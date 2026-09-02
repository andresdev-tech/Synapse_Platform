const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jhonalexander0606@gmail.com' },
    include: { role: true }
  })
  
  if (!user) {
    console.log("User not found!")
    return
  }
  
  console.log("User found:", user.email, "Role:", user.role?.name)
  console.log("Password hash in DB:", user.password)
  
  const isMatch = await bcrypt.compare('Jhon12345@', user.password)
  console.log("Does 'Jhon12345@' match?", isMatch)
}

main().catch(console.error).finally(() => prisma.$disconnect())
