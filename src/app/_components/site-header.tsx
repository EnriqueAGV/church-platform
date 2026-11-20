import Link from "next/link";

import { getSession } from "~/server/better-auth/server";

import { BrandLogo } from "./brand-logo";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="bg-leaf text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-4 py-6">
        <Link href="/" className="text-2xl sm:text-3xl">
          <BrandLogo />
        </Link>

        <div className="flex flex-col items-end gap-3">
          <p className="hidden text-right text-lg leading-tight font-medium uppercase sm:block">
            “Un trazo
            <br />
            inspirado por Dios”
          </p>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
            {session && (
              <Link
                href="/materiales/nuevo"
                className="rounded-full bg-white px-3 py-1 font-semibold text-brand"
              >
                Subir material
              </Link>
            )}
            {session && (
              <Link href="/categorias" className="underline">
                Categorías
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/usuarios" className="underline">
                Editores
              </Link>
            )}
            {session ? (
              <SignOutButton />
            ) : (
              <Link href="/login" className="text-white/80 underline">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
