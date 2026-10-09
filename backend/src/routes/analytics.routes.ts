import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";

const router = Router();
const prisma = new PrismaClient();

const generateExport = (res: Response, data: any[], filenamePrefix: string, format: string) => {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Export");

  const dateStr = new Date().toISOString().split("T")[0];
  const isExcel = format === "xlsx";
  const filename = `${filenamePrefix}_${dateStr}.${isExcel ? 'xlsx' : 'csv'}`;

  const buffer = isExcel 
    ? xlsx.write(wb, { type: "buffer", bookType: "xlsx" }) 
    : xlsx.write(wb, { type: "buffer", bookType: "csv" });

  res.setHeader(
    "Content-Type", 
    isExcel 
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      : "text/csv"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buffer);
};

router.get("/export/users", async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "csv";
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const data = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      LGU: u.lguName || 'N/A'
    }));

    generateExport(res, data, "smartrelief_users", format);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting users");
  }
});

router.get("/export/logs", async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "csv";
    const logs = await prisma.systemLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    
    const data = logs.map(l => ({
      ID: l.id,
      Timestamp: l.timestamp.toISOString(),
      Action: l.action,
      User: l.userName,
      Role: l.userRole,
      Details: l.details,
      IP: l.ipAddress
    }));

    generateExport(res, data, "smartrelief_audit", format);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting logs");
  }
});

router.get("/export/incidents", async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "csv";
    const incidents = await prisma.incident.findMany({
      orderBy: { reportedAt: 'desc' }
    });
    
    const data = incidents.map(i => ({
      ID: i.id,
      Title: i.title,
      Type: i.type,
      Location: i.locationName,
      Barangay: i.barangay,
      LGU: i.lguName,
      Severity: i.severity,
      Status: i.status,
      ReportedAt: i.reportedAt.toISOString(),
      AffectedCount: i.affectedCount
    }));

    generateExport(res, data, "smartrelief_incidents", format);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting incidents");
  }
});

router.get("/export/lgus", async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "csv";
    const lgus = await prisma.lGUOrganization.findMany({
      orderBy: { name: 'asc' }
    });
    
    const data = lgus.map(l => ({
      ID: l.id,
      Name: l.name,
      Region: l.region,
      Municipality: l.cityMunicipality,
      Status: l.status,
      BarangayCount: l.barangayCount,
      DRRMHead: l.drrmHead,
      Responders: l.registeredRespondersCount
    }));

    generateExport(res, data, "smartrelief_lgus", format);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting lgus");
  }
});

export default router;
