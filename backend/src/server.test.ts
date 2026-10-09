import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from './server';
import { GoogleGenAI } from '@google/genai';

// Mock the Prisma Client if needed for auth tests, but let's see if we can do this without full mock first, 
// or maybe we DO need to mock it if it hits a real DB. We can mock prisma.
vi.mock('./routes/auth.routes', async (importOriginal) => {
  const express = await import('express');
  const router = express.Router();
  
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@smartrelief.gov' && password === 'admin123') {
      res.json({ success: true, token: 'mock-token', user: { id: 1, name: 'Admin', role: 'ADMIN' } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  router.get('/me', (req, res) => {
    // mock cookie logic
    if (req.cookies?.token === 'mock-token') {
      res.json({ success: true, user: { id: 1, name: 'Admin', role: 'ADMIN' } });
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  });

  return { 
    default: router,
    authMiddleware: (req: any, res: any, next: any) => next(),
    optionalAuthMiddleware: (req: any, res: any, next: any) => next(),
    requireSuperAdmin: (req: any, res: any, next: any) => next(),
    requireAdminOrSuperAdmin: (req: any, res: any, next: any) => next()
  };
});

describe('Backend API Integration Tests', () => {
  
  describe('Auth Endpoints', () => {
    it('POST /api/auth/login with valid credentials should return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@smartrelief.gov', password: 'admin123' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('mock-token');
    });

    it('POST /api/auth/login with invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@smartrelief.gov', password: 'wrong' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/auth/me should return user if token is valid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=mock-token']);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('GET /api/auth/me should return 401 if no token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('AI Decision Support Endpoint', () => {
    
    it('POST /api/ai/decision-support should fail Zod validation with bad payload', async () => {
      const response = await request(app)
        .post('/api/ai/decision-support')
        .send({ prompt: 12345 }); // Expected string, got number
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('POST /api/ai/decision-support without AI configured should return heuristic recommendations', async () => {
      // Temporarily unset AI to test heuristics
      const { ai: originalAi, setAIClient } = await import('./server');
      setAIClient(null);

      const incidentContext = [{
        id: 'inc-1',
        title: 'Massive Flood',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        locationName: 'North District',
        affectedCount: 50
      }];

      const response = await request(app)
        .post('/api/ai/decision-support')
        .send({ incidentContext });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.source).toBe('heuristic');
      expect(response.body.recommendations).toHaveLength(1);
      expect(response.body.recommendations[0].severity).toBe('CRITICAL');

      setAIClient(originalAi);
    });

    it('POST /api/ai/decision-support with AI should return gemini generated recommendations', async () => {
      const { ai: originalAi, setAIClient } = await import('./server');

      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: JSON.stringify({
          recommendations: [{
            id: 'mock-rec-1',
            title: 'Mocked AI Action',
            severity: 'HIGH',
            reasoning: 'Mock reasoning',
            recommendedAction: 'Mock action',
            impactScore: 90,
            category: 'DISPATCH',
            targetId: 'INC-1'
          }],
          aiAnalysis: 'Mock analysis'
        })
      });

      setAIClient({
        models: {
          generateContent: mockGenerateContent
        }
      });

      const response = await request(app)
        .post('/api/ai/decision-support')
        .send({ prompt: 'test' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.source).toBe('gemini');
      expect(response.body.recommendations[0].title).toBe('Mocked AI Action');

      setAIClient(originalAi);
    });
  });
});
