import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "~/app/_components/site-header";
import { youtubeEmbedUrl } from "~/lib/materials";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

import { deleteMaterial } from "../actions";
import { DeleteMaterialButton } from "../delete-material-button";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const material = await db.material.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!material) notFound();

  const session = await getSession();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream px-4 py-8">
        <article className="mx-auto flex max-w-4xl flex-col gap-6">
          <Link
            href="/"
            className="w-fit rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            ← Volver a materiales
          </Link>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-500">
              {material.category.name}
            </span>
            <h1 className="text-3xl font-bold">{material.title}</h1>
            {material.description && (
              <p className="whitespace-pre-line text-neutral-700">
                {material.description}
              </p>
            )}
          </div>

          {material.format === "VIDEO" && material.youtubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={youtubeEmbedUrl(material.youtubeId)}
                title={material.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {material.fileUrl && material.fileType === "application/pdf" && (
            <iframe
              src={material.fileUrl}
              title={material.title}
              className="h-[80vh] w-full rounded-xl bg-white shadow"
            />
          )}

          {material.fileUrl && material.fileType?.startsWith("image/") && (
            // Blob images are served from a public URL, so next/image is not configured for them
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.fileUrl}
              alt={material.title}
              className="mx-auto max-h-[80vh] rounded-xl bg-white object-contain shadow"
            />
          )}

          {material.fileUrl && (
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={material.fileUrl}
                download={material.fileName ?? true}
                className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Descargar
              </a>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                Abrir en otra pestaña
              </a>
            </div>
          )}

          {session && (
            <div className="flex items-center gap-3 border-t border-neutral-200 pt-6">
              <Link
                href={`/materiales/${material.id}/editar`}
                className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
              >
                Editar
              </Link>
              <DeleteMaterialButton
                onDelete={deleteMaterial.bind(null, material.id)}
              />
            </div>
          )}
        </article>
      </main>
    </>
  );
}
