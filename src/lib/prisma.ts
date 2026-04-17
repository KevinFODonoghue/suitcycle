// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma client handling for Next.js
 * ------------------------------------------
 * Prevents multiple PrismaClient instances during hot reload in development.
 * Includes optional logging and nice stack traces.
 */

declare global {
  // Ensures type-safe reuse of Prisma instance on globalThis
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // add "query" here if you need to debug SQL
    errorFormat: "pretty",  // makes stack traces easier to read
  });

// In development, store the Prisma instance globally to prevent new connections
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
