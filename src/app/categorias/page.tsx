import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "~/app/_components/site-header";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

import { deleteCategory, renameCategory } from "./actions";
import { CategoryRow } from "./category-row";
import { NewCategoryForm } from "./new-category-form";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { materials: true } } },
  });

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-dark">Categorías</h1>
            <Link
              href="/"
              className="w-fit rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              ← Volver a materiales
            </Link>
          </div>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 font-semibold">Nueva categoría</h2>
            <NewCategoryForm />
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-2 font-semibold">Editar categorías</h2>
            {categories.length === 0 ? (
              <p className="text-sm text-neutral-600">Todavía no hay categorías.</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    name={category.name}
                    materialCount={category._count.materials}
                    renameAction={renameCategory.bind(null, category.id)}
                    deleteAction={deleteCategory.bind(null, category.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
