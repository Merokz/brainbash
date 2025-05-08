import { PrismaClient } from "@prisma/client";
import { cacheExtension } from "../cache";
import { DynamicClientExtensionThis } from "@prisma/client/runtime/library";

declare global {
  // Allow extended Prisma client (with cache extension) or undefined
  var prisma: PrismaClient;
  const CACHE_TTL = 60; // 60 seconds TTL for most queries
  const CACHE_SWR = 300; // 5 minutes SWR
  const USER_CACHE_TTL = 300; // 5 minutes for user-related queries
}

// Connection pooling configuration
const prismaClientSingleton = () => {
  // Base Prisma client with logging and datasource config
  const base = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
  // Extend with in-memory caching
  return base.$extends(cacheExtension);
};

export const prisma: PrismaClient = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

if (process.env.NODE_ENV !== "development") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
