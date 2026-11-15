import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  // Requests from these origins are accepted (sign in / sign out). Local dev uses two ports.
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    // Production domains that serve the app (the same deployment is reachable from both)
    "https://escuela-biblica-taberilopango.vercel.app",
    "https://escuelabiclica-recursos.vercel.app",
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // No public registration: accounts are created by an admin (see admin plugin)
    disableSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
