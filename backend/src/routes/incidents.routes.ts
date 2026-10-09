import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authMiddleware, optionalAuthMiddleware } from "./auth.routes";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Helper to extract or fallback to a real database user
async function resolveDatabaseUser(req: Request) {
  let user = (req as any).user;
  if (!user) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        user = {
          ...decoded,
          id: decoded.userId || decoded.id,
          userId: decoded.userId || decoded.id
        };
      } catch {}
    }
  }

  const candidateId = user?.id || user?.userId || req.body?.reportedById;
  if (candidateId) {
    const existing = await prisma.user.findUnique({ where: { id: candidateId } });
    if (existing) return existing;
  }

  // Fallback to first CITIZEN in database (e.g. Carlos Dalisay) to satisfy foreign key constraints
  const citizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
  if (citizen) return citizen;

  // Fallback to any user
  return await prisma.user.findFirst();
}

// Get all incidents
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        reporter: {
          select: { name: true, phone: true }
        },
        responders: {
          include: {
            responder: {
              include: {
                user: true
              }
            }
          }
        },
        timelines: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { reportedAt: 'desc' }
    });
    // Format them to match the frontend types
    const formatted = incidents.map(inc => ({
      ...inc,
      reportedBy: inc.reporter?.name || inc.reportedBy,
      reporterContact: inc.reporter?.phone || "",
      assignedResponders: inc.responders.map(r => r.responder.id),
      timeline: inc.timelines.map(t => ({
        timestamp: t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: t.action,
        performedBy: t.performedBy,
        notes: t.notes || ""
      }))
    }));
    res.json({ success: true, incidents: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch incidents" });
  }
});

// Create new incident
router.post("/", async (req: Request, res: Response) => {
  try {
    const dbUser = await resolveDatabaseUser(req);
    if (!dbUser) {
      return res.status(500).json({ success: false, message: "Database user not available" });
    }

    const { title, description, type, severity, locationName, barangay, lat, lng, affectedCount, photoUrl } = req.body;
    
    // 1. Create Incident in SQLite database
    const incident = await prisma.incident.create({
      data: {
        title: title || "Emergency Incident Report",
        description: description || "Field emergency report.",
        type: type || "FLOOD",
        severity: severity || "HIGH",
        status: "REPORTED",
        locationName: locationName || "Pauli 2, Rizal, Laguna",
        barangay: barangay || "Pauli 2",
        lguName: dbUser.lguName || "Rizal DRRM Operations Center",
        lat: Number(lat) || 14.1134,
        lng: Number(lng) || 121.3938,
        affectedCount: Number(affectedCount) || 1,
        photoUrl: photoUrl || null,
        reportedBy: dbUser.id
      }
    });

    // 2. Create Incident Timeline record
    await prisma.incidentTimeline.create({
      data: {
        incidentId: incident.id,
        action: "Incident report submitted by citizen via Citizen Portal",
        performedBy: dbUser.name || "Citizen Reporter",
        notes: `Emergency logged: ${type || 'FLOOD'} (${severity || 'HIGH'}) in ${barangay || locationName || 'Pauli 2, Rizal, Laguna'}`
      }
    });

    // 3. Automatically create linked Assistance Request in database so it reflects in Citizen Requests & My Requests
    const reqTypeMap: Record<string, string> = {
      FLOOD: "RESCUE",
      FIRE: "RESCUE",
      LANDSLIDE: "RESCUE",
      EARTHQUAKE: "RESCUE",
      TYPHOON: "RESCUE",
      MEDICAL: "MEDICAL"
    };

    const linkedRequest = await prisma.assistanceRequest.create({
      data: {
        citizenId: dbUser.id,
        requestType: reqTypeMap[type] || "RESCUE",
        severity: severity || "HIGH",
        locationName: locationName || "Pauli 2, Rizal, Laguna",
        barangay: barangay || "Pauli 2",
        lat: Number(lat) || 14.1134,
        lng: Number(lng) || 121.3938,
        peopleCount: Number(affectedCount) || 1,
        specialNeeds: `Reported emergency incident: ${title}`,
        description: `[Incident ${incident.id}] ${title}: ${description || "Field report submitted"}`,
        status: "SUBMITTED",
        photoUrl: photoUrl || null,
        incidentId: incident.id
      }
    });

    await prisma.requestStatusHistory.create({
      data: {
        requestId: linkedRequest.id,
        status: "SUBMITTED",
        note: `Emergency request initiated from incident: ${title}`
      }
    });

    const formattedIncident = {
      ...incident,
      reportedBy: dbUser.name,
      reporterContact: dbUser.phone || "",
      assignedResponders: [],
      assignedResponderIds: [],
      assignedResponderNames: [],
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: "Incident report submitted by citizen via Citizen Portal",
          performedBy: dbUser.name,
          notes: `Emergency logged: ${type || 'FLOOD'} (${severity || 'HIGH'}) in ${barangay || locationName || 'Pauli 2, Rizal, Laguna'}`
        }
      ]
    };

    const formattedRequest = {
      ...linkedRequest,
      citizenName: dbUser.name,
      citizenPhone: dbUser.phone || "",
      assignedResponderName: ""
    };

    res.json({
      success: true,
      incident: formattedIncident,
      request: formattedRequest
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ success: false, message: "Failed to create incident" });
  }
});

// Verify incident
router.put("/:id/verify", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED" }
    });

    // Sync linked assistance request
    await prisma.assistanceRequest.updateMany({
      where: { incidentId: req.params.id },
      data: { status: "VERIFIED" }
    });

    res.json({ success: true, incident });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to verify incident" });
  }
});

// Assign responder
router.post("/:id/assign", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { responderId } = req.body;
    await prisma.responderIncident.create({
      data: {
        incidentId: req.params.id,
        responderId: responderId
      }
    });
    // Update incident status
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { status: "ASSIGNED" }
    });
    // Update responder status
    await prisma.responder.update({
      where: { id: responderId },
      data: { status: "EN_ROUTE" }
    });

    // Sync linked assistance requests
    await prisma.assistanceRequest.updateMany({
      where: { incidentId: req.params.id },
      data: { status: "ASSIGNED", responderId }
    });

    res.json({ success: true, incident });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to assign responder" });
  }
});

// Update incident status
router.put("/:id/status", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { status }
    });
    const user = (req as any).user;
    await prisma.incidentTimeline.create({
      data: {
        incidentId: req.params.id,
        action: `Status updated to ${status}${notes ? `: ${notes}` : ""}`,
        performedBy: user?.name || "System Responder"
      }
    });

    // Sync linked assistance requests
    if (status === "RESOLVED" || status === "ASSIGNED" || status === "VERIFIED") {
      await prisma.assistanceRequest.updateMany({
        where: { incidentId: req.params.id },
        data: { status }
      });
    }

    res.json({ success: true, incident });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update incident status" });
  }
});

export default router;
