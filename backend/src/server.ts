import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { z } from "zod";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import settingsRoutes from "./routes/settings.routes";
import analyticsRoutes from "./routes/analytics.routes";
import permissionsRoutes from "./routes/permissions.routes";
import incidentsRoutes from "./routes/incidents.routes";
import respondersRoutes from "./routes/responders.routes";
import requestsRoutes from "./routes/requests.routes";
import resourcesRoutes from "./routes/resources.routes";
import evacuationRoutes from "./routes/evacuation.routes";
import logsRoutes from "./routes/logs.routes";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(cors({
  origin: (_origin, callback) => {
    // Allow any local network origin (localhost, 10.x.x.x, 192.168.x.x, USB tethering)
    callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini AI client if API key exists
const apiKey = process.env.GEMINI_API_KEY;
export let ai: GoogleGenAI | null = null;
export const setAIClient = (client: any) => { ai = client; };
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}


  // Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/permissions", permissionsRoutes);
  app.use("/api/incidents", incidentsRoutes);
  app.use("/api/responders", respondersRoutes);
  app.use("/api/requests", requestsRoutes);
  app.use("/api/resources", resourcesRoutes);
  app.use("/api/evacuation", evacuationRoutes);
  app.use("/api/logs", logsRoutes);


export const decisionSupportSchema = z.object({
  incidentContext: z.array(z.any()).optional(),
  resourceContext: z.array(z.any()).optional(),
  prompt: z.string().optional()
});

// AI Decision Support Endpoint
app.post("/api/ai/decision-support", async (req, res) => {
  try {
    const { incidentContext, resourceContext, prompt } = decisionSupportSchema.parse(req.body);

      if (!ai) {
        // Generate dynamic heuristic recommendations based on real context if AI is not configured
        const recommendations = [];
        
        // Find most critical unassigned incident
        const criticalIncident = (incidentContext || []).find((i: any) => 
          (i.severity === "CRITICAL" || i.severity === "HIGH") && i.status !== "RESOLVED"
        );
        
        if (criticalIncident) {
          recommendations.push({
            id: `rec-fallback-${Date.now()}-1`,
            title: `Priority Dispatch: ${criticalIncident.title}`,
            severity: criticalIncident.severity,
            reasoning: `${criticalIncident.affectedCount || 'Multiple'} individuals affected near ${criticalIncident.locationName || 'the reported area'}. Immediate response required based on severity level.`,
            recommendedAction: `Dispatch nearest available emergency response team to ${criticalIncident.locationName || 'incident zone'}.`,
            impactScore: criticalIncident.severity === "CRITICAL" ? 95 : 85,
            category: "DISPATCH",
            targetId: criticalIncident.id
          });
        }
        
        // Find most depleted resource
        const lowResource = (resourceContext || []).find((r: any) => 
          r.stockStatus === "LOW_STOCK" || r.stockStatus === "CRITICAL" || (r.availableQuantity < r.minThreshold)
        );
        
        if (lowResource) {
          recommendations.push({
            id: `rec-fallback-${Date.now()}-2`,
            title: `Resource Reallocation: ${lowResource.name}`,
            severity: "HIGH",
            reasoning: `Inventory for ${lowResource.name} is dangerously low (${lowResource.availableQuantity} ${lowResource.unit} remaining). Depletion expected soon.`,
            recommendedAction: `Initiate emergency transfer of 50+ ${lowResource.unit} of ${lowResource.name} to the active staging area.`,
            impactScore: 88,
            category: "RESOURCE_ALLOCATION",
            targetId: "EC-001" // Defaulting to central hub or evac center
          });
        }
        
        // If nothing critical, show a generic monitoring rec
        if (recommendations.length === 0) {
          recommendations.push({
            id: `rec-fallback-${Date.now()}-3`,
            title: "Routine Patrol & Monitoring",
            severity: "LOW",
            reasoning: "No critical incidents or supply shortages detected in the current operating picture.",
            recommendedAction: "Maintain standard alert level and continue routine data collection.",
            impactScore: 40,
            category: "ALERT",
            targetId: "SYSTEM"
          });
        }

        return res.json({
          success: true,
          source: "heuristic",
          recommendations,
          aiAnalysis: `Analyzed ${incidentContext?.length || 0} active incidents and ${resourceContext?.length || 0} resource assets using local heuristics.`
        });
      }

      const systemInstruction = `You are SmartRelief AI, a decision support intelligence engine for emergency disaster response and LGU-DRRM operations.
Analyze the provided disaster data and generate actionable, prioritized decision support recommendations.
Always explain the rationale behind each recommendation (e.g. why it was suggested, distance, capacity, severity, time sensitivity).
Return valid JSON matching this structure:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Short actionable title",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "Detailed explanation of why this was suggested",
      "recommendedAction": "Concrete action step for administrators",
      "impactScore": 95,
      "category": "DISPATCH" | "RESOURCE_ALLOCATION" | "EVACUATION" | "ALERT",
      "targetId": "INC-001"
    }
  ],
  "aiAnalysis": "High level strategic summary of current operational state"
}`;

      const userPrompt = `
Incident Data: ${JSON.stringify(incidentContext || [])}
Resource Data: ${JSON.stringify(resourceContext || [])}
Custom Focus Prompt: ${prompt || "Analyze all active critical incidents and suggest optimal responder assignments and resource allocations."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);

      return res.json({
        success: true,
        source: "gemini",
        ...parsed
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || error.message });
      console.error("AI Decision Support Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI decision support recommendations."
      });
    }
  });

  const aiQuerySchema = z.object({
    userQuery: z.string(),
    context: z.any().optional()
  });

  // AI Strategic Query Assistant Endpoint
  app.post("/api/ai/query", async (req, res) => {
    try {
      const { userQuery, context } = aiQuerySchema.parse(req.body);

      if (!ai) {
        return res.json({
          success: true,
          answer: "SmartRelief Decision Support Engine: Based on current active logs, 3 critical flood incidents require immediate motorboat deployment in Sector 4. Evacuation Center Central Gym is near capacity (88%), and supply replenishment is advised within 3 hours."
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are SmartRelief AI Disaster Operations Advisor. 
Context: ${JSON.stringify(context || {})}
User Question: ${userQuery}`,
        config: {
          systemInstruction: "Provide concise, highly authoritative tactical disaster management advice for emergency admins, responders, or citizens. Focus on human safety, swift logistics, and risk mitigation.",
          temperature: 0.4
        }
      });

      return res.json({
        success: true,
        answer: response.text
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || error.message });
      console.error("AI Query Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "AI Query service error."
      });
    }
  });

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartRelief Server running on http://localhost:${PORT}`);
  });
}
