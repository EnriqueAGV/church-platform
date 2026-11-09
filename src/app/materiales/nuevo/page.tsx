import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "~/app/_components/site-header";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

import { createMaterial } from "../actions";
import { MaterialForm } from "../material-form";

export default async function NewMaterialPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream px-4 py-8">
        <section className="mx-auto flex max-w-xl flex-col gap-6 rounded-xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Subir material</h1>
            <Link href="/" className="text-sm underline">
              Cancelar
            </Link>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-neutral-600">
              Primero crea una categoría en{" "}
              <Link href="/categorias" className="underline">
                Categorías
              </Link>
              .
            </p>
          ) : (
            <MaterialForm mode="create" action={createMaterial} categories={categories} />
          )}
        </section>
      </main>
    </>
  );
}
