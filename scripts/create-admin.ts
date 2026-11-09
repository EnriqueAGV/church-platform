/**
 * Creates the first admin account. Public sign-up is disabled, so this is the only way to
 * bootstrap the system. Later, the admin creates editors from the app.
 *
 * Usage (the password goes in an env var so it doesn't end up in shell history):
 *   ADMIN_PASSWORD='your-password' bun scripts/create-admin.ts admin@example.com "Nombre"
 */
import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../generated/prisma";

const [email, name = "Administrador"] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 8) {
  console.error(
    "Uso: ADMIN_PASSWORD='contraseña (mín. 8)' bun scripts/create-admin.ts <correo> [nombre]",
  );
  process.exit(1);
}

const db = new PrismaClient();

try {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.error("Ya existe un usuario con ese correo.");
    process.exit(1);
  }

  const user = await db.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
      emailVerified: true,
      role: "admin",
    },
  });

  // Better Auth stores email/password logins as an account with providerId "credential"
  await db.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(password),
    },
  });

  console.log(`Admin creado: ${email}`);
} finally {
  await db.$disconnect();
}
