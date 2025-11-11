import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@proxy.local" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@proxy.local",
      userId: 1001,
      category: "ADMIN",
      isAdmin: true,
      password
    }
  });

  const setting = await prisma.setting.findFirst();
  if (!setting) {
    await prisma.setting.create({
      data: {
        tenure: "2025/2026",
        name: "Proxy",
        dueAmount: "3000.00",
        email: "admin@proxy.local",
        phone: "+1234567890",
        address: "5, Privet Drive",
        isRegistrationOpen: false
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
