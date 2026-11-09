"use client";

import { useActionState } from "react";

import type { CategoryState } from "./actions";

type Props = {
  name: string;
  materialCount: number;
  renameAction: (prev: CategoryState, formData: FormData) => Promise<CategoryState>;
  deleteAction: (prev: CategoryState) => Promise<CategoryState>;
};

export function CategoryRow({ name, materialCount, renameAction, deleteAction }: Props) {
  const [renameState, rename, renaming] = useActionState<CategoryState, FormData>(
    renameAction,
    null,
  );
  const [deleteState, remove, deleting] = useActionState<CategoryState, FormData>(
    deleteAction,
    null,
  );

  const message = renameState ?? deleteState;

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <form action={rename} className="flex flex-1 flex-wrap items-center gap-2">
          <input
            name="name"
            defaultValue={name}
            required
            minLength={2}
            maxLength={60}
            className="min-w-48 flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={renaming}
            className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {renaming ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <form
          action={remove}
          onSubmit={(event) => {
            if (!window.confirm(`¿Borrar la categoría "${name}"?`)) event.preventDefault();
          }}
        >
          <button
            type="submit"
            disabled={deleting}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Borrar
          </button>
        </form>
      </div>

      <span className="text-xs text-neutral-500">
        {materialCount} {materialCount === 1 ? "material" : "materiales"}
      </span>

      {message?.error && <p className="text-sm text-red-600">{message.error}</p>}
      {message?.ok && <p className="text-sm text-green-700">{message.ok}</p>}
    </li>
  );
}
