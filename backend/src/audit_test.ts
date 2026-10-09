import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const [users, incidents, requests, resources, evac, responders, logs, settings, permissions] = await Promise.all([
    p.user.count(),
    p.incident.count(),
    p.assistanceRequest.count(),
    p.resourceItem.count(),
    p.evacuationCenter.count(),
    p.responder.count(),
    p.systemLog.count(),
    p.systemSetting.count(),
    p.rolePermission.count()
  ]);
  console.log('DATABASE_TABLE_COUNTS:', JSON.stringify({ users, incidents, requests, resources, evac, responders, logs, settings, permissions }));
  const allUsers = await p.user.findMany({ select: { id: true, email: true, name: true, role: true, status: true } });
  console.log('USERS_LIST:', JSON.stringify(allUsers, null, 2));
}

main().finally(() => p.$disconnect());
