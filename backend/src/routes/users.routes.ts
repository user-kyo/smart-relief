import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();

const updateRoleSchema = z.object({ role: z.enum(["SUPER_ADMIN", "ADMIN", "RESPONDER", "CITIZEN"]) });
const updateStatusSchema = z.object({ status: z.enum(["APPROVED", "PENDING", "ACTIVE", "INACTIVE"]) });

// Ensure only SUPER_ADMIN can access these routes
const requireSuperAdmin = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Forbidden: Super Admin access required." });
  }
  next();
};

// Get all users
router.get("/", authMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// Update user role
router.put("/:id/role", authMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || error.message });
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update user role" });
  }
});

// Update user status
router.put("/:id/status", authMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || error.message });
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
});

// Delete user
router.delete("/:id", authMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
