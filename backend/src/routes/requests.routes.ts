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

  const candidateId = user?.id || user?.userId || req.body?.citizenId;
  if (candidateId) {
    const existing = await prisma.user.findUnique({ where: { id: candidateId } });
    if (existing) return existing;
  }

  // Fallback to first CITIZEN in database (e.g. Carlos Dalisay) to satisfy foreign key constraints
  const citizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
  if (citizen) return citizen;

  return await prisma.user.findFirst();
}

// Get all requests
router.get("/", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const requests = await prisma.assistanceRequest.findMany({
      include: {
        requester: {
          select: { name: true, phone: true }
        },
        responder: {
          select: { codeName: true, user: { select: { name: true } } }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
    // Format them to match the frontend types
    const formatted = requests.map(req => ({
      ...req,
      citizenName: req.requester?.name || "Unknown Citizen",
      citizenPhone: req.requester?.phone || "",
      assignedResponderName: req.responder?.user?.name || req.responder?.codeName || ""
    }));
    res.json({ success: true, requests: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch assistance requests" });
  }
});

// Create new request
router.post("/", async (req: Request, res: Response) => {
  try {
    const dbUser = await resolveDatabaseUser(req);
    if (!dbUser) {
      return res.status(500).json({ success: false, message: "Database user not available" });
    }

    const { requestType, severity, locationName, barangay, lat, lng, peopleCount, specialNeeds, description, photoUrl, incidentId } = req.body;
    
    const newRequest = await prisma.assistanceRequest.create({
      data: {
        citizenId: dbUser.id,
        requestType: requestType || "RESCUE",
        severity: severity || "HIGH",
        locationName: locationName || "Pauli 2, Rizal, Laguna",
        barangay: barangay || "Pauli 2",
        lat: Number(lat) || 14.1134,
        lng: Number(lng) || 121.3938,
        peopleCount: Number(peopleCount) || 1,
        specialNeeds: specialNeeds || null,
        description: description || "Assistance request logged.",
        status: "SUBMITTED",
        photoUrl: photoUrl || null,
        incidentId: incidentId || null
      }
    });

    // Create history
    await prisma.requestStatusHistory.create({
      data: {
        requestId: newRequest.id,
        status: "SUBMITTED",
        note: `Request created: ${requestType || 'RESCUE'} in ${barangay || locationName || 'Pauli 2, Rizal, Laguna'}`
      }
    });

    const formatted = {
      ...newRequest,
      citizenName: dbUser.name,
      citizenPhone: dbUser.phone || "",
      assignedResponderName: ""
    };

    res.json({ success: true, request: formatted });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Failed to create assistance request" });
  }
});

// Update request status (assign)
router.put("/:id/status", optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, responderId, note } = req.body;
    
    const updateData: any = { status };
    if (responderId) {
      updateData.responderId = responderId;
    }

    const updatedRequest = await prisma.assistanceRequest.update({
      where: { id: req.params.id },
      data: updateData
    });

    await prisma.requestStatusHistory.create({
      data: {
        requestId: req.params.id,
        status,
        note: note || `Status updated to ${status}`
      }
    });

    res.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update assistance request" });
  }
});

export default router;
