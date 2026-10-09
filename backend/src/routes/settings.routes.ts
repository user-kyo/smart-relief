import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all system settings
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array of {key, value} to an object
    const settingsObj = settings.reduce((acc, curr) => {
      // Parse boolean and numeric values if necessary
      let parsedValue: any = curr.value;
      if (curr.value === "true") parsedValue = true;
      else if (curr.value === "false") parsedValue = false;
      
      acc[curr.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);
    
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update system settings (mass update)
router.post("/", async (req, res) => {
  try {
    const newSettings = req.body.settings;
    
    // Process updates in a transaction
    const updates = Object.entries(newSettings).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await prisma.$transaction(updates);

    res.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
