"use client";

export function DeleteMaterialButton({
  onDelete,
}: {
  onDelete: () => Promise<void>;
}) {
  return (
    <form
      action={onDelete}
      onSubmit={(event) => {
        if (!window.confirm("¿Borrar este material? No se puede deshacer.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
      >
        Borrar
      </button>
    </form>
  );
}
