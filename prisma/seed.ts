import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo account
  const hashedPassword = await bcrypt.hash("demo123456", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@kayai.com" },
    update: {},
    create: {
      email: "demo@kayai.com",
      name: "Demo User",
      password: hashedPassword,
      aiProvider: "openai",
    },
  });

  console.log("✅ Demo account created:");
  console.log("   Email: demo@kayai.com");
  console.log("   Password: demo123456");
  console.log("");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


