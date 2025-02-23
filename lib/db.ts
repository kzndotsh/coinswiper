import { PrismaClient } from '../prisma/generated/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create a new Prisma Client with proper configuration
const createPrismaClient = () => {
  return new PrismaClient().$extends(withAccelerate())
}

// Type the global object
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>
}

// Initialize or reuse the Prisma Client
export const db = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
} 