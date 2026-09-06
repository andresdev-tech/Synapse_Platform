import "dotenv/config"
import { PrismaClient, RoleName } from '../../generated/prisma/client.ts'
import { PrismaNeon } from "@prisma/adapter-neon"


const connectionString = process.env.DATABASE_URL || ""

if (!connectionString) {
    //throw new Error("No se encontro la esta vaiarble de entorno")
    console.log("No se encontro esta vaiarble de entorno");
    
}

const adapter = new PrismaNeon({connectionString});

export const prisma = new PrismaClient({adapter})
export const RoleNames = RoleName