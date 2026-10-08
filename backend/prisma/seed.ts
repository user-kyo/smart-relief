import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean the database so we have exactly these 4 users
  await prisma.user.deleteMany({});
  
  const defaultPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Dr. Roberto Mendoza",
      email: "sadmin@email.com",
      role: "SUPER_ADMIN",
      password: defaultPassword,
    },
    {
      name: "Kapt. Elena Santos",
      email: "admin@email.com",
      role: "ADMIN",
      password: defaultPassword,
    },
    {
      name: "Juan Dela Cruz",
      email: "responder@email.com",
      role: "RESPONDER",
      password: defaultPassword,
    },
    {
      name: "Ana Reyes",
      email: "citizen@email.com",
      role: "CITIZEN",
      password: defaultPassword,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created user: ${user.email} (${user.role})`);
  }

  console.log("Seeding finished! All accounts have the password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
