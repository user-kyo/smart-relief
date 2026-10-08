const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating User roles...");
  await prisma.user.updateMany({
    where: { role: 'VOLUNTEER' },
    data: { role: 'RESPONDER' }
  });

  // Also update the specific seed user email if it exists
  const volUser = await prisma.user.findUnique({
    where: { email: 'volunteer@email.com' }
  });
  if (volUser) {
    console.log("Updating volunteer@email.com to responder@email.com");
    await prisma.user.update({
      where: { email: 'volunteer@email.com' },
      data: { email: 'responder@email.com' }
    });
  }

  console.log("Updating Responder profiles (roleType)...");
  await prisma.responder.updateMany({
    where: { roleType: 'VOLUNTEER' },
    data: { roleType: 'RESPONDER' }
  });

  console.log("Updating SystemLog userRoles...");
  await prisma.systemLog.updateMany({
    where: { userRole: 'VOLUNTEER' },
    data: { userRole: 'RESPONDER' }
  });

  console.log("Updating RolePermissions...");
  const existingRolePerm = await prisma.rolePermission.findUnique({
    where: { role: 'VOLUNTEER' }
  });
  if (existingRolePerm) {
    const responderExists = await prisma.rolePermission.findUnique({
      where: { role: 'RESPONDER' }
    });
    if (!responderExists) {
      await prisma.rolePermission.update({
        where: { role: 'VOLUNTEER' },
        data: { role: 'RESPONDER' }
      });
    } else {
      await prisma.rolePermission.delete({
        where: { role: 'VOLUNTEER' }
      });
    }
  }

  console.log("Database update complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
