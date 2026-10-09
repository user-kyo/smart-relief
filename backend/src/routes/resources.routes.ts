import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, optionalAuthMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();

// Get all resources
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resourceItem.findMany({
      orderBy: { lastUpdated: 'desc' }
    });
    // Ensure formatting matches frontend
    const formatted = resources.map(res => ({
      ...res,
      lastUpdated: res.lastUpdated.toISOString()
    }));
    res.json({ success: true, resources: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch resources" });
  }
});

// Add new resource
router.post("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category, quantity, unit, location, lguName, minThreshold, expirationDate } = req.body;
    
    const qty = quantity || 100;
    const thresh = minThreshold || 50;

    const newResource = await prisma.resourceItem.create({
      data: {
        name: name || "Emergency Supply Kit",
        category: category || "FOOD_WATER",
        quantity: qty,
        availableQuantity: qty,
        reservedQuantity: 0,
        distributedQuantity: 0,
        unit: unit || "units",
        location: location || "Central Logistics Hub",
        lguName: lguName || "Manila DRRM Operations Center",
        minThreshold: thresh,
        stockStatus: qty < thresh ? "LOW_STOCK" : "NORMAL",
        expirationDate: expirationDate ? new Date(expirationDate) : null
      }
    });

    res.json({ success: true, resource: newResource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create resource" });
  }
});

// Update resource stock
router.put("/:id/stock", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { deltaAvailable } = req.body;
    const resourceId = req.params.id;

    // We must fetch it first to calculate safely
    const currentRes = await prisma.resourceItem.findUnique({ where: { id: resourceId } });
    if (!currentRes) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const newAvail = Math.max(0, currentRes.availableQuantity + deltaAvailable);
    let stockStatus = "NORMAL";
    if (newAvail === 0) stockStatus = "DEPLETED";
    else if (newAvail < currentRes.minThreshold) stockStatus = "LOW_STOCK";

    const distributedAdd = deltaAvailable < 0 ? Math.abs(deltaAvailable) : 0;

    const updatedResource = await prisma.resourceItem.update({
      where: { id: resourceId },
      data: {
        availableQuantity: newAvail,
        distributedQuantity: currentRes.distributedQuantity + distributedAdd,
        stockStatus
      }
    });

    res.json({ success: true, resource: updatedResource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update resource stock" });
  }
});

// Transfer resource (this just deducts stock for now and acts like a transfer logic)
router.post("/:id/transfer", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { quantity, destination } = req.body;
    const resourceId = req.params.id;

    const currentRes = await prisma.resourceItem.findUnique({ where: { id: resourceId } });
    if (!currentRes) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // A transfer reduces available, increases distributed
    const newAvail = Math.max(0, currentRes.availableQuantity - quantity);
    let stockStatus = "NORMAL";
    if (newAvail === 0) stockStatus = "DEPLETED";
    else if (newAvail < currentRes.minThreshold) stockStatus = "LOW_STOCK";

    const updatedResource = await prisma.resourceItem.update({
      where: { id: resourceId },
      data: {
        availableQuantity: newAvail,
        distributedQuantity: currentRes.distributedQuantity + quantity,
        stockStatus
      }
    });

    res.json({ success: true, resource: updatedResource, destination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to transfer resource" });
  }
});

export default router;
