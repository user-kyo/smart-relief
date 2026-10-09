import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all role permissions
router.get("/", async (req, res) => {
  try {
    let permissions = await prisma.rolePermission.findMany();
    
    if (permissions.length === 0) {
      // Seed initial default role permissions
      await prisma.rolePermission.createMany({
        data: [
          {
            role: "SUPER_ADMIN",
            description: "Full administrative and security authority over the entire disaster coordination system.",
            incidentsCreate: true,
            incidentsVerify: true,
            incidentsAssign: true,
            incidentsDelete: true,
            requestsManage: true,
            resourcesAdd: true,
            resourcesTransfer: true,
            evacuationManage: true,
            usersManage: true,
            rolesManage: true,
            systemLogsView: true
          },
          {
            role: "ADMIN",
            description: "LGU DRRM Operations Manager - manages incidents, logistics, shelters, and responders.",
            incidentsCreate: true,
            incidentsVerify: true,
            incidentsAssign: true,
            incidentsDelete: true,
            requestsManage: true,
            resourcesAdd: true,
            resourcesTransfer: true,
            evacuationManage: true,
            usersManage: false,
            rolesManage: false,
            systemLogsView: true
          },
          {
            role: "RESPONDER",
            description: "Field Response Unit - receives assignments, executes rescue, submits field sitreps.",
            incidentsCreate: true,
            incidentsVerify: false,
            incidentsAssign: false,
            incidentsDelete: false,
            requestsManage: true,
            resourcesAdd: false,
            resourcesTransfer: false,
            evacuationManage: true,
            usersManage: false,
            rolesManage: false,
            systemLogsView: false
          },
          {
            role: "CITIZEN",
            description: "Resident / Citizen - reports emergency incidents, requests assistance, locates evacuation shelters.",
            incidentsCreate: true,
            incidentsVerify: false,
            incidentsAssign: false,
            incidentsDelete: false,
            requestsManage: false,
            resourcesAdd: false,
            resourcesTransfer: false,
            evacuationManage: false,
            usersManage: false,
            rolesManage: false,
            systemLogsView: false
          }
        ]
      });
      permissions = await prisma.rolePermission.findMany();
    }

    // Transform flat DB structure into nested object to match frontend
    const formatted = permissions.map(p => ({
      id: p.id,
      role: p.role,
      description: p.description,
      permissions: {
        incidentsCreate: p.incidentsCreate,
        incidentsVerify: p.incidentsVerify,
        incidentsAssign: p.incidentsAssign,
        incidentsDelete: p.incidentsDelete,
        requestsManage: p.requestsManage,
        resourcesAdd: p.resourcesAdd,
        resourcesTransfer: p.resourcesTransfer,
        evacuationManage: p.evacuationManage,
        usersManage: p.usersManage,
        rolesManage: p.rolesManage,
        systemLogsView: p.systemLogsView,
      }
    }));

    res.json({ success: true, permissions: formatted });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update a specific role's permissions
router.post("/:role", async (req: any, res) => {
  try {
    const { role } = req.params;
    const { permissions, description } = req.body;

    const updated = await prisma.rolePermission.upsert({
      where: { role: role.toUpperCase() },
      update: {
        description: description || undefined,
        ...permissions
      },
      create: {
        role: role.toUpperCase(),
        description: description || "System role",
        ...permissions
      }
    });

    res.json({ success: true, role: updated.role });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
