import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, optionalAuthMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();

// Get all evacuation centers
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const centers = await prisma.evacuationCenter.findMany({
      orderBy: { updatedAt: "desc" }
    });
    const formatted = centers.map(c => ({
      ...c,
      facilities: {
        powerGenerator: c.powerGenerator,
        medicalStation: c.medicalStation,
        sanitation: c.sanitation,
        wifiComm: c.wifiComm,
        communityKitchen: c.communityKitchen,
        waterPurifier: c.waterPurifier
      },
      updatedAt: c.updatedAt.toISOString()
    }));
    res.json({ success: true, centers: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch evacuation centers" });
  }
});

// Create new evacuation center
router.post("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      barangay,
      lguName,
      lat,
      lng,
      capacity,
      currentOccupants,
      facilities,
      status,
      contactPerson,
      contactPhone
    } = req.body;

    const newCenter = await prisma.evacuationCenter.create({
      data: {
        name: name || "New Evacuation Center",
        address: address || "",
        barangay: barangay || "Pauli 2",
        lguName: lguName || "Rizal",
        lat: Number(lat) || 14.1134,
        lng: Number(lng) || 121.3938,
        capacity: Number(capacity) || 100,
        currentOccupants: Number(currentOccupants) || 0,
        powerGenerator: !!facilities?.powerGenerator,
        medicalStation: !!facilities?.medicalStation,
        sanitation: facilities?.sanitation ?? true,
        wifiComm: !!facilities?.wifiComm,
        communityKitchen: !!facilities?.communityKitchen,
        waterPurifier: !!facilities?.waterPurifier,
        status: status || "OPEN",
        contactPerson: contactPerson || "",
        contactPhone: contactPhone || ""
      }
    });

    res.json({
      success: true,
      center: {
        ...newCenter,
        facilities: {
          powerGenerator: newCenter.powerGenerator,
          medicalStation: newCenter.medicalStation,
          sanitation: newCenter.sanitation,
          wifiComm: newCenter.wifiComm,
          communityKitchen: newCenter.communityKitchen,
          waterPurifier: newCenter.waterPurifier
        },
        updatedAt: newCenter.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create evacuation center" });
  }
});

// Update occupancy or status
router.put("/:id", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentOccupants, status } = req.body;

    const updateData: any = {};
    if (currentOccupants !== undefined) {
      updateData.currentOccupants = Number(currentOccupants);
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const updated = await prisma.evacuationCenter.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      center: {
        ...updated,
        facilities: {
          powerGenerator: updated.powerGenerator,
          medicalStation: updated.medicalStation,
          sanitation: updated.sanitation,
          wifiComm: updated.wifiComm,
          communityKitchen: updated.communityKitchen,
          waterPurifier: updated.waterPurifier
        },
        updatedAt: updated.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update evacuation center" });
  }
});

export default router;
