"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export type CategoryState = { error?: string; ok?: string } | null;

const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";

const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(60, "El nombre es muy largo.");

function readName(formData: FormData): string {
  const value = formData.get("name");
  return typeof value === "string" ? value : "";
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function refreshCategories() {
  revalidatePath("/categorias");
  revalidatePath("/");
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const session = await getSession();
  if (!session) return { error: SESSION_EXPIRED };

  const parsed = nameSchema.safeParse(readName(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre no válido." };

  try {
    await db.category.create({ data: { name: parsed.data } });
  } catch (error) {
    return {
      error: isUniqueViolation(error)
        ? "Ya existe una categoría con ese nombre."
        : "No se pudo crear la categoría.",
    };
  }

  refreshCategories();
  return { ok: `Categoría creada: ${parsed.data}` };
}

export async function renameCategory(
  id: string,
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const session = await getSession();
  if (!session) return { error: SESSION_EXPIRED };

  const parsed = nameSchema.safeParse(readName(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre no válido." };

  try {
    await db.category.update({ where: { id }, data: { name: parsed.data } });
  } catch (error) {
    return {
      error: isUniqueViolation(error)
        ? "Ya existe una categoría con ese nombre."
        : "No se pudo guardar el cambio.",
    };
  }

  refreshCategories();
  return { ok: "Cambios guardados." };
}

export async function deleteCategory(id: string, _prev: CategoryState): Promise<CategoryState> {
  const session = await getSession();
  if (!session) return { error: SESSION_EXPIRED };

  const count = await db.material.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      error: `No se puede borrar: tiene ${count} material(es). Muévelos a otra categoría primero.`,
    };
  }

  await db.category.delete({ where: { id } });
  refreshCategories();
  return { ok: "Categoría borrada." };
}
