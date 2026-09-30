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
      email: "roberto.mendoza@drrm.gov.ph",
      role: "SUPER_ADMIN",
      password: defaultPassword,
    },
    {
      name: "Kapt. Elena Santos",
      email: "elena.santos@manila.gov.ph",
      role: "ADMIN",
      password: defaultPassword,
    },
    {
      name: "Juan Dela Cruz",
      email: "j.delacruz@redcross.org.ph",
      role: "VOLUNTEER",
      password: defaultPassword,
    },
    {
      name: "Ana Reyes",
      email: "ana.reyes@gmail.com",
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
