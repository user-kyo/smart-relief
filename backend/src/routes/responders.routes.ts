import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, optionalAuthMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();

// Get all responders
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const responders = await prisma.responder.findMany({
      include: {
        user: { select: { name: true } }
      }
    });
    const formatted = responders.map(r => ({
      ...r,
      name: r.user.name,
      id: r.id
    }));
    res.json({ success: true, responders: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch responders" });
  }
});

// Update responder status
router.put("/:id/status", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, lat, lng, locationName } = req.body;
    const updateData: any = { lastPing: new Date() };
    if (status) updateData.status = status;
    if (lat !== undefined) updateData.lat = Number(lat);
    if (lng !== undefined) updateData.lng = Number(lng);
    if (locationName) updateData.locationName = locationName;

    const responder = await prisma.responder.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { name: true } }
      }
    });

    res.json({
      success: true,
      responder: {
        ...responder,
        name: responder.user.name,
        id: responder.id
      }
    });
  } catch (error) {
    console.error("Error updating responder status:", error);
    res.status(500).json({ success: false, message: "Failed to update responder status" });
  }
});

// Create/Register new responder
router.post("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, codeName, roleType, status, lguName, locationName, lat, lng, phone, teamSize, skills, equipment } = req.body;
    
    // Find or create associated user if needed
    let targetUserId = userId;
    if (!targetUserId) {
      const existingUser = await prisma.user.findFirst({ where: { role: "RESPONDER" } });
      targetUserId = existingUser ? existingUser.id : (await prisma.user.findFirst())?.id;
    }

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "Valid user ID required for responder profile" });
    }

    const newResponder = await prisma.responder.create({
      data: {
        userId: targetUserId,
        codeName: codeName || "UNIT-NEW",
        roleType: roleType || "DISASTER_RESPONSE_TEAM",
        status: status || "AVAILABLE",
        lguName: lguName || "Rizal DRRM",
        locationName: locationName || "Central Station",
        lat: Number(lat) || 14.1134,
        lng: Number(lng) || 121.3938,
        phone: phone || "+63 900 000 0000",
        teamSize: Number(teamSize) || 4,
        skills: typeof skills === "string" ? skills : JSON.stringify(skills || ["Rescue", "First Aid"]),
        equipment: typeof equipment === "string" ? equipment : JSON.stringify(equipment || ["Field Kit"])
      },
      include: {
        user: { select: { name: true } }
      }
    });

    res.json({
      success: true,
      responder: {
        ...newResponder,
        name: newResponder.user.name,
        id: newResponder.id
      }
    });
  } catch (error) {
    console.error("Error creating responder:", error);
    res.status(500).json({ success: false, message: "Failed to create responder" });
  }
});

export default router;
