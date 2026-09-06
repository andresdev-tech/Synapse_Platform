import pkg from './generated/prisma/index.js';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
prisma.$queryRawUnsafe("SELECT data_type FROM information_schema.columns WHERE table_name = 'Category' AND column_name = 'id'")
  .then(console.log)
  .finally(() => prisma.$disconnect());
