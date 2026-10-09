import { describe, it, expect } from 'vitest';
import { 
  calculateNewResourceStock, 
  calculateNewEvacuationOccupancy, 
  acceptAIRecommendationLogic, 
  rejectAIRecommendationLogic, 
  generateFallbackRecommendations 
} from './logic';
import { AIRecommendation, EvacuationCenter, Incident, ResourceItem } from '../types';

describe('SmartRelief Pure Logic', () => {
  describe('calculateNewResourceStock', () => {
    const mockResource: any = {
      id: 'res-1',
      name: 'Water',
      category: 'WATER',
      quantity: 1000,
      unit: 'Liters',
      availableQuantity: 500,
      distributedQuantity: 500,
      minThreshold: 100,
      stockStatus: 'NORMAL',
      location: 'Warehouse A',
      lastUpdated: '2026-10-01T00:00:00Z',
      supplier: 'Supplier A',
      expiryDate: '2027-10-01'
    };

    it('should floor availableQuantity at zero and set stockStatus to DEPLETED', () => {
      const result = calculateNewResourceStock(mockResource, -1000); // More than available
      expect(result.availableQuantity).toBe(0);
      expect(result.distributedQuantity).toBe(1500);
      // Actually my extracted logic just did: res.distributedQuantity + (deltaAvailable < 0 ? Math.abs(deltaAvailable) : 0). 
      // If deltaAvailable is -1000, distributed increases by 1000.
      expect(result.stockStatus).toBe('DEPLETED');
    });

    it('should set stockStatus to LOW_STOCK if below minThreshold', () => {
      const result = calculateNewResourceStock(mockResource, -450); // 500 - 450 = 50
      expect(result.availableQuantity).toBe(50);
      expect(result.stockStatus).toBe('LOW_STOCK');
    });

    it('should set stockStatus to NORMAL if above minThreshold', () => {
      const result = calculateNewResourceStock(mockResource, -300); // 500 - 300 = 200
      expect(result.availableQuantity).toBe(200);
      expect(result.stockStatus).toBe('NORMAL');
    });
  });

  describe('calculateNewEvacuationOccupancy', () => {
    const mockEC: any = {
      id: 'ec-1',
      name: 'Central High School',
      address: '123 Main St',
      capacity: 500,
      currentOccupants: 100,
      status: 'OPEN',
      contactPerson: 'John Doe',
      contactNumber: '123-456-7890',
      facilities: {}
    };

    it('should clamp occupants to 0 if negative', () => {
      const result = calculateNewEvacuationOccupancy(mockEC, -50);
      expect(result.currentOccupants).toBe(0);
      expect(result.status).toBe('OPEN');
    });

    it('should set status to FULL if occupants >= capacity', () => {
      const result = calculateNewEvacuationOccupancy(mockEC, 600);
      expect(result.currentOccupants).toBe(600); // clamping to capacity is not in original logic!
      expect(result.status).toBe('FULL');
    });

    it('should set status to OPEN if occupants < capacity', () => {
      const result = calculateNewEvacuationOccupancy(mockEC, 499);
      expect(result.currentOccupants).toBe(499);
      expect(result.status).toBe('OPEN');
    });
  });

  describe('acceptAIRecommendationLogic', () => {
    it('should set recommendation status to ACCEPTED', () => {
      const recs: any[] = [{ id: '1', status: 'PENDING' }];
      const result = acceptAIRecommendationLogic(recs, '1');
      expect(result[0].status).toBe('ACCEPTED');
    });
  });

  describe('rejectAIRecommendationLogic', () => {
    it('should set recommendation status to REJECTED', () => {
      const recs: any[] = [{ id: '1', status: 'PENDING' }];
      const result = rejectAIRecommendationLogic(recs, '1');
      expect(result[0].status).toBe('REJECTED');
    });
  });

  describe('generateFallbackRecommendations', () => {
    it('should generate critical dispatch recommendation', () => {
      const incidents = [{ id: 'inc-1', title: 'Fire', severity: 'CRITICAL', locationName: 'Downtown' } as any];
      const result = generateFallbackRecommendations(incidents, [], 1000);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('DISPATCH');
      expect(result[0].impactScore).toBe(96);
    });

    it('should generate high dispatch recommendation', () => {
      const incidents = [{ id: 'inc-1', title: 'Flood', severity: 'HIGH', locationName: 'Uptown' } as any];
      const result = generateFallbackRecommendations(incidents, [], 1000);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('DISPATCH');
      expect(result[0].impactScore).toBe(84);
    });

    it('should generate resource depletion alert', () => {
      const resources = [{ id: 'res-1', name: 'Food', category: 'FOOD', minThreshold: 100, availableQuantity: 50, quantity: 50, unit: 'Boxes' } as any];
      const result = generateFallbackRecommendations([], resources, 1000);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('RESOURCE_ALLOCATION');
      expect(result[0].impactScore).toBe(89);
    });

    it('should generate routine monitoring if no critical incidents or low resources', () => {
      const incidents = [{ id: 'inc-1', severity: 'LOW' } as any];
      const resources = [{ id: 'res-1', availableQuantity: 500, minThreshold: 100 } as any];
      const result = generateFallbackRecommendations(incidents, resources, 1000);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('EVACUATION');
      expect(result[0].impactScore).toBe(45);
    });
  });
});
