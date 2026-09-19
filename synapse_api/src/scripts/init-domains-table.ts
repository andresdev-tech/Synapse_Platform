import { prisma } from "../config/prisma";

async function main() {
  console.log("Creando tabla e índices para AllowedDomain en PostgreSQL/Neon...");

  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "DomainScope" AS ENUM ('USER', 'ADMIN', 'ALL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AllowedDomain" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "domain" VARCHAR(120) UNIQUE NOT NULL,
        "scope" "DomainScope" NOT NULL DEFAULT 'USER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "description" VARCHAR(255),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AllowedDomain_domain_isActive_idx" ON "AllowedDomain"("domain", "isActive");
    `);

    console.log("✅ Tabla AllowedDomain y tipo DomainScope verificados/creados exitosamente en Neon.");
  } catch (error) {
    console.error("❌ Error ejecutando migración manual:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
