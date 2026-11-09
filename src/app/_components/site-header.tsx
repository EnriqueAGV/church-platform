import Image from "next/image";
import Link from "next/link";

import { getSession } from "~/server/better-auth/server";

import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-brand bg-white px-4 py-3">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/brand/logo-primary.jpg"
          alt="Tabernáculo de Ilopango"
          width={1020}
          height={336}
          priority
          className="h-12 w-auto"
        />
        <span className="hidden text-lg font-bold text-brand-dark sm:inline">
          Escuela Bíblica
        </span>
      </Link>

      <nav className="flex flex-wrap items-center gap-3 text-sm">
        {session && (
          <Link
            href="/materiales/nuevo"
            className="rounded bg-brand px-3 py-1 font-semibold text-white"
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
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>
        )}
      </nav>
    </header>
  );
}
