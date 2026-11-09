/**
 * Creates an admin account, or resets the password of an existing one (and makes it admin).
 * Public sign-up is disabled, so this is how the system is bootstrapped or recovered.
 * Later, the admin creates editors from the app.
 *
 * Email and password go in env vars so they don't end up in shell history:
 *   ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='your-password' bun scripts/create-admin.ts
 *
 * Optional: ADMIN_NAME (default "Administrador", only used when creating).
 *
 * With --optional (used by `bun run build`, so every deploy syncs the admin from the env vars):
 * does nothing if the vars are missing, and never fails the build.
 */
import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../generated/prisma";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() ?? "Administrador";

const optional = process.argv.includes("--optional");

if (!email || !password || password.length < 8) {
  if (optional) {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD no definidos (mín. 8): se omite el admin.");
    process.exit(0);
  }
  console.error(
    "Uso: ADMIN_EMAIL='correo' ADMIN_PASSWORD='contraseña (mín. 8)' bun scripts/create-admin.ts",
  );
  process.exit(1);
}

const db = new PrismaClient();

try {
  const passwordHash = await hashPassword(password);
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    // Better Auth stores email/password logins as an account with providerId "credential"
    const credential = await db.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
      select: { id: true },
    });

    await db.$transaction([
      db.user.update({ where: { id: existing.id }, data: { role: "admin" } }),
      credential
        ? db.account.update({ where: { id: credential.id }, data: { password: passwordHash } })
        : db.account.create({
            data: {
              id: randomUUID(),
              accountId: existing.id,
              providerId: "credential",
              userId: existing.id,
              password: passwordHash,
            },
          }),
    ]);
    console.log(`Contraseña actualizada y rol admin confirmado: ${email}`);
  } else {
    const user = await db.user.create({
      data: { id: randomUUID(), name, email, emailVerified: true, role: "admin" },
    });
    await db.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
    console.log(`Admin creado: ${email}`);
  }
} catch (error) {
  if (!optional) throw error;
  console.error("No se pudo crear/actualizar el admin:", error);
} finally {
  await db.$disconnect();
}
