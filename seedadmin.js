import prisma from "./src/utils/prisma-clients.js";
import bcrypt from "bcrypt";

async function main() {
  const email = "admin@example.com";

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const hashed = await bcrypt.hash("AdminPass123!", 10); // hash password

  await prisma.user.create({
    data: {
      name: "Aayushma bista",
      email: email,
      password: hashed,       // <-- use hashed password here
      role: "ADMIN"
    }
  });

  console.log("Admin created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });