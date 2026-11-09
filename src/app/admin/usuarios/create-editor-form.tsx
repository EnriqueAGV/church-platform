"use client";

import { useActionState } from "react";

import { createEditor, type CreateEditorState } from "./actions";

export function CreateEditorForm() {
  const [state, formAction, pending] = useActionState<CreateEditorState, FormData>(
    createEditor,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="name"
        placeholder="Nombre"
        required
        className="rounded border border-neutral-300 px-3 py-2"
      />
      <input
        name="email"
        type="email"
        placeholder="Correo"
        required
        className="rounded border border-neutral-300 px-3 py-2"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña inicial (mín. 8)"
        required
        minLength={8}
        className="rounded border border-neutral-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear editor"}
      </button>
      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
