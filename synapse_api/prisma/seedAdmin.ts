import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  
  if (!adminRole) {
    console.error("El rol ADMIN no existe. Corre prisma/seed.ts primero.");
    process.exit(1);
  }

  const email = "jhonalexander0606@gmail.com";
  const password = "Jhon12345@";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      roleId: adminRole.id
    },
    create: {
      name: "Jhon Alexander",
      email,
      password: hashedPassword,
      roleId: adminRole.id
    }
  });

  console.log(`Usuario Administrador '${email}' creado exitosamente.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
