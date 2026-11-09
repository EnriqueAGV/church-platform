"use client";

import { useRouter } from "next/navigation";

import { authClient } from "~/server/better-auth/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const { error } = await authClient.signOut();
        if (error) {
          // Without this the page would look logged out while the session cookie still exists
          window.alert(`No se pudo cerrar la sesión: ${error.message ?? "error desconocido"}`);
          return;
        }
        router.push("/login");
        router.refresh();
      }}
      className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
    >
      Cerrar sesión
    </button>
  );
}
