import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from "../generated/prisma/client.js";
import dotenv from 'dotenv';


dotenv.config();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL || "" });

export const prisma = new PrismaClient({
  adapter,
});