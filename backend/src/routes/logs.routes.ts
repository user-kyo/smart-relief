import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { optionalAuthMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();

// Get recent system audit logs
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

// Record new system audit log
router.post("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { action, details, severity, userId, userName, userRole, ipAddress } = req.body;
    const log = await prisma.systemLog.create({
      data: {
        action: action || "SYSTEM_ACTION",
        details: details || "Action executed",
        severity: severity || "INFO",
        userId: userId || "SYSTEM",
        userName: userName || "System User",
        userRole: userRole || "ADMIN",
        ipAddress: ipAddress || (req.ip || "127.0.0.1")
      }
    });
    res.json({ success: true, log });
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ success: false, message: "Failed to record log" });
  }
});

export default router;
