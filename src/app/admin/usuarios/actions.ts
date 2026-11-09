"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "~/server/better-auth";

const createEditorSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto."),
  email: z.string().trim().email("Correo no válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export type CreateEditorState = { ok: boolean; message: string } | null;

export async function createEditor(
  _prev: CreateEditorState,
  formData: FormData,
): Promise<CreateEditorState> {
  const parsed = createEditorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  try {
    // Better Auth rejects this call unless the caller's session has the admin role
    await auth.api.createUser({
      headers: await headers(),
      body: { ...parsed.data, role: "user" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el editor.";
    return { ok: false, message };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Editor creado: ${parsed.data.email}` };
}
