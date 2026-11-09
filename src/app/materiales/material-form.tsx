"use client";

import Link from "next/link";
import { type ChangeEvent, useActionState, useRef, useState } from "react";

import {
  acceptedFileTypes,
  FORMAT_LABELS,
  MATERIAL_FORMAT_VALUES,
  type MaterialFormat,
} from "~/lib/materials";
import { firstPageThumbnail } from "~/lib/pdf-thumbnail";

import type { MaterialFormState } from "./actions";

type Category = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  action: (prev: MaterialFormState, formData: FormData) => Promise<MaterialFormState>;
  categories: Category[];
  defaults?: { title: string; description: string | null; categoryId: string };
};

const inputClass = "rounded border border-neutral-300 px-3 py-2";

export function MaterialForm({ mode, action, categories, defaults }: Props) {
  const [state, formAction, pending] = useActionState<MaterialFormState, FormData>(
    action,
    null,
  );
  const [format, setFormat] = useState<MaterialFormat>("PDF");
  const thumbnailInput = useRef<HTMLInputElement>(null);

  // Renders the PDF's first page into a hidden file input, so it goes up with the form
  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const thumbnail = thumbnailInput.current;
    if (!thumbnail) return;
    thumbnail.value = "";

    const file = event.target.files?.[0];
    if (file?.type !== "application/pdf") return;

    try {
      const blob = await firstPageThumbnail(file);
      const transfer = new DataTransfer();
      transfer.items.add(new File([blob], "miniatura.jpg", { type: "image/jpeg" }));
      thumbnail.files = transfer.files;
    } catch {
      // Without a preview the material still uploads; the listing shows a placeholder
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          name="title"
          required
          minLength={3}
          defaultValue={defaults?.title}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descripción (opcional)
        <textarea
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <label className="flex flex-col gap-1">
          Categoría
          <select
            name="categoryId"
            required
            defaultValue={defaults?.categoryId ?? categories[0]?.id}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <Link href="/categorias" className="w-fit text-xs underline text-neutral-600">
          Agregar o editar categorías
        </Link>
      </div>

      {mode === "create" && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Formato del archivo
            <select
              name="format"
              value={format}
              onChange={(event) => setFormat(event.target.value as MaterialFormat)}
              className={inputClass}
            >
              {MATERIAL_FORMAT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {FORMAT_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          {format === "VIDEO" ? (
            <label className="flex flex-col gap-1 text-sm">
              Link de YouTube
              <input
                name="youtubeUrl"
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass}
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              Archivo (máx. 4 MB)
              <input
                name="file"
                type="file"
                required
                accept={acceptedFileTypes(format).join(",")}
                onChange={onFileChange}
                className={inputClass}
              />
            </label>
          )}
          <input
            ref={thumbnailInput}
            name="thumbnail"
            type="file"
            accept="image/jpeg"
            className="hidden"
            tabIndex={-1}
            aria-hidden
          />
        </>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Subir material"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
