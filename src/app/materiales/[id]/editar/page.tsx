import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "~/app/_components/site-header";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

import { updateMaterial } from "../../actions";
import { MaterialForm } from "../../material-form";

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const material = await db.material.findUnique({ where: { id } });
  if (!material) notFound();

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
            <h1 className="text-2xl font-bold">Editar material</h1>
            <Link href={`/materiales/${id}`} className="text-sm underline">
              Cancelar
            </Link>
          </div>
          <p className="text-sm text-neutral-600">
            Para cambiar el archivo o el link, borra el material y súbelo de nuevo.
          </p>
          <MaterialForm
            mode="edit"
            action={updateMaterial.bind(null, id)}
            categories={categories}
            defaults={{
              title: material.title,
              description: material.description,
              categoryId: material.categoryId,
            }}
          />
        </section>
      </main>
    </>
  );
}
