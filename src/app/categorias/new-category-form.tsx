"use client";

import { useActionState } from "react";

import { createCategory, type CategoryState } from "./actions";

export function NewCategoryForm() {
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(
    createCategory,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="name"
          placeholder="Nombre de la categoría"
          required
          minLength={2}
          maxLength={60}
          className="min-w-48 flex-1 rounded border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Creando..." : "Agregar categoría"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">{state.ok}</p>}
    </form>
  );
}
