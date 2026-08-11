import express from "express";
import path from "path";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI client if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
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

  // AI Decision Support Endpoint
  app.post("/api/ai/decision-support", async (req, res) => {
    try {
      const { incidentContext, resourceContext, prompt } = req.body;

      if (!ai) {
        return res.json({
          success: true,
          source: "heuristic",
          recommendations: [
            {
              id: `rec-fallback-1`,
              title: "Priority Evacuation Dispatch: Sector 4 Flood",
              severity: "CRITICAL",
              reasoning: "18 residents reported trapped in rising water near Sector 4. Water level rising at 0.3m/hr. Two rescue boats available within 2.5km.",
              recommendedAction: "Dispatch Rescue Team Alpha with 2 inflatable motorboats and 20 life vests to Barangay San Jose Sector 4.",
              impactScore: 94,
              category: "DISPATCH",
              targetId: "INC-2026-089"
            },
            {
              id: `rec-fallback-2`,
              title: "Resource Transfer: Water Purification Units",
              severity: "HIGH",
              reasoning: "Evacuation Center Central Gym is operating at 88% capacity (440 occupants). Clean water supply projected to deplete in 3.5 hours.",
              recommendedAction: "Reallocate 150 water purification tablet kits and 20 water tanks from Metro Warehouse Depot to Central Gym Evacuation Center.",
              impactScore: 88,
              category: "RESOURCE_ALLOCATION",
              targetId: "EC-001"
            }
          ],
          aiAnalysis: "Simulated AI decision model analyzed 14 active incidents and 6 evacuation centers. Primary threat remains flash flooding in lower elevation barangays."
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
      console.error("AI Decision Support Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI decision support recommendations."
      });
    }
  });

  // AI Strategic Query Assistant Endpoint
  app.post("/api/ai/query", async (req, res) => {
    try {
      const { userQuery, context } = req.body;

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartRelief Server running on http://localhost:${PORT}`);
  });
}

startServer();
