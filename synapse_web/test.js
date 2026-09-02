const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ email: u.email, role: u.role })));
  const notes = await prisma.note.findMany({ where: { isGlobal: false }});
  console.log("Suggestions:", notes);
}
main().catch(console.error).finally(() => prisma.$disconnect());
