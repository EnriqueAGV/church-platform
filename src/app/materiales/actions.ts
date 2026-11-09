"use server";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  acceptedFileTypes,
  extractYoutubeId,
  FORMAT_LABELS,
  MATERIAL_FORMAT_VALUES,
  MAX_FILE_BYTES,
} from "~/lib/materials";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export type MaterialFormState = { error: string } | null;

const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";
const MAX_THUMBNAIL_BYTES = 300 * 1024;

const materialFieldsSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().trim().max(2000, "La descripción es muy larga.").optional(),
});

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/** Returns the category id if it exists, otherwise null. */
async function existingCategoryId(value: string): Promise<string | null> {
  const category = await db.category.findUnique({ where: { id: value }, select: { id: true } });
  return category?.id ?? null;
}

export async function createMaterial(
  _prev: MaterialFormState,
  formData: FormData,
): Promise<MaterialFormState> {
  const session = await getSession();
  if (!session) return { error: SESSION_EXPIRED };

  const categoryId = await existingCategoryId(readText(formData, "categoryId"));
  if (!categoryId) return { error: "Elige una categoría." };

  const formatInput = readText(formData, "format");
  const format = MATERIAL_FORMAT_VALUES.find((value) => value === formatInput);
  if (!format) return { error: "Elige un formato." };

  const fields = materialFieldsSchema.safeParse({
    title: readText(formData, "title"),
    description: readText(formData, "description"),
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Datos no válidos." };
  }
  const { title, description } = fields.data;

  let fileData: {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    thumbnailUrl?: string;
    youtubeId?: string;
  };

  if (format === "VIDEO") {
    const youtubeId = extractYoutubeId(readText(formData, "youtubeUrl"));
    if (!youtubeId) return { error: "Pega un link válido de YouTube." };
    fileData = { youtubeId };
  } else {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Selecciona un archivo." };
    }
    if (!acceptedFileTypes(format).includes(file.type)) {
      return { error: `Tipo de archivo no permitido para ${FORMAT_LABELS[format]}.` };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { error: "El archivo supera 4 MB." };
    }

    try {
      const blob = await put(
        `materiales/${randomUUID()}-${safeFileName(file.name)}`,
        file,
        { access: "public", contentType: file.type },
      );
      fileData = {
        fileUrl: blob.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    } catch {
      return { error: "No se pudo subir el archivo. Intenta de nuevo." };
    }

    // The browser sends a preview of the first page for PDFs; a failed preview doesn't block the upload
    const thumbnail = formData.get("thumbnail");
    if (
      file.type === "application/pdf" &&
      thumbnail instanceof File &&
      thumbnail.size > 0 &&
      thumbnail.size <= MAX_THUMBNAIL_BYTES
    ) {
      const preview = await put(`materiales/miniaturas/${randomUUID()}.jpg`, thumbnail, {
        access: "public",
        contentType: "image/jpeg",
      }).catch(() => null);
      fileData.thumbnailUrl = preview?.url;
    }
  }

  const material = await db.material.create({
    data: {
      title,
      description: description ?? null,
      format,
      categoryId,
      createdById: session.user.id,
      ...fileData,
    },
  });

  revalidatePath("/");
  redirect(`/materiales/${material.id}`);
}

export async function updateMaterial(
  id: string,
  _prev: MaterialFormState,
  formData: FormData,
): Promise<MaterialFormState> {
  const session = await getSession();
  if (!session) return { error: SESSION_EXPIRED };

  const categoryId = await existingCategoryId(readText(formData, "categoryId"));
  if (!categoryId) return { error: "Elige una categoría." };

  const fields = materialFieldsSchema.safeParse({
    title: readText(formData, "title"),
    description: readText(formData, "description"),
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const updated = await db.material.updateMany({
    where: { id },
    data: {
      title: fields.data.title,
      description: fields.data.description ?? null,
      categoryId,
    },
  });
  if (updated.count === 0) return { error: "Este material ya no existe." };

  revalidatePath("/");
  revalidatePath(`/materiales/${id}`);
  redirect(`/materiales/${id}`);
}

export async function deleteMaterial(id: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const material = await db.material.findUnique({ where: { id } });
  if (!material) redirect("/");

  await db.material.delete({ where: { id } });

  // The row is already gone; a failed blob delete only leaves an orphan file
  const urls = [material.fileUrl, material.thumbnailUrl].filter(
    (url): url is string => Boolean(url),
  );
  if (urls.length > 0) {
    await del(urls).catch(() => undefined);
  }

  revalidatePath("/");
  redirect("/");
}
