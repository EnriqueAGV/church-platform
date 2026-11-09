import Link from "next/link";

import { SiteHeader } from "~/app/_components/site-header";
import {
  FORMAT_LABELS,
  MATERIAL_FORMAT_VALUES,
  youtubeThumbnailUrl,
} from "~/lib/materials";
import { db } from "~/server/db";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    formato?: string;
    orden?: string;
  }>;
}) {
  const { categoria, q, formato: formatoParam, orden: ordenParam } = await searchParams;
  const query = q?.trim();
  const formato = MATERIAL_FORMAT_VALUES.find((value) => value === formatoParam);
  const orden = SORT_OPTIONS.find((option) => option.value === ordenParam)?.value;
  const filters: Filters = { categoria, q: query, formato, orden };

  const [categories, allMaterials] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.material.findMany({
      where: {
        ...(categoria ? { categoryId: categoria } : {}),
        ...(formato ? { format: formato } : {}),
      },
      orderBy: { createdAt: orden === "antiguos" ? "asc" : "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        format: true,
        fileType: true,
        fileUrl: true,
        thumbnailUrl: true,
        youtubeId: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  // Filtered in memory (the library is small) so accents and case don't matter: "noe" finds "Noé"
  const needle = query ? normalize(query) : null;
  const matching = needle
    ? allMaterials.filter((m) =>
        normalize(`${m.title} ${m.description ?? ""} ${m.category.name}`).includes(needle),
      )
    : allMaterials;
  // Title sort is done here: the database collation puts uppercase before lowercase
  const materials =
    orden === "titulo"
      ? [...matching].sort((a, b) => a.title.localeCompare(b.title, "es"))
      : matching;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <form
            action="/"
            method="get"
            role="search"
            className="flex flex-wrap gap-2 text-sm"
          >
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar materiales…"
              aria-label="Buscar materiales"
              className="min-w-0 flex-1 basis-56 rounded-full bg-white px-4 py-2 shadow outline-none focus:ring-2 focus:ring-brand"
            />
            <select
              name="formato"
              defaultValue={formato ?? ""}
              aria-label="Formato"
              className="rounded-full bg-white px-3 py-2 shadow"
            >
              <option value="">Todos los formatos</option>
              {MATERIAL_FORMAT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {FORMAT_LABELS[value]}
                </option>
              ))}
            </select>
            <select
              name="orden"
              defaultValue={orden ?? "recientes"}
              aria-label="Ordenar por"
              className="rounded-full bg-white px-3 py-2 shadow"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-brand px-4 py-2 font-semibold text-white"
            >
              Buscar
            </button>
            {(Boolean(query) || Boolean(formato) || Boolean(orden)) && (
              <Link
                href={filterHref({ categoria })}
                className="self-center text-neutral-600 underline"
              >
                Limpiar
              </Link>
            )}
          </form>

          <nav className="flex flex-wrap gap-2 text-sm">
            <FilterLink
              href={filterHref({ ...filters, categoria: undefined })}
              active={!categoria}
              label="Todos"
            />
            {categories.map((category) => (
              <FilterLink
                key={category.id}
                href={filterHref({ ...filters, categoria: category.id })}
                active={categoria === category.id}
                label={category.name}
              />
            ))}
          </nav>

          {materials.length === 0 ? (
            <p className="text-neutral-600">
              {query || categoria || formato
                ? "No se encontraron materiales."
                : "Todavía no hay materiales."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => {
                const thumbnail =
                  material.thumbnailUrl ??
                  (material.format === "VIDEO" && material.youtubeId
                    ? youtubeThumbnailUrl(material.youtubeId)
                    : material.fileType?.startsWith("image/")
                      ? material.fileUrl
                      : null);

                return (
                  <li key={material.id}>
                    <Link
                      href={`/materiales/${material.id}`}
                      className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow hover:shadow-md"
                    >
                      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-neutral-100 text-sm text-neutral-500">
                        {thumbnail ? (
                          // Thumbnails come from public Blob / YouTube URLs.
                          // PDF previews are portrait, so they're cropped to the top of the page
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnail}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-top"
                          />
                        ) : (
                          material.category.name
                        )}
                      </div>
                      <div className="flex flex-col gap-1 p-4">
                        <span className="text-xs font-semibold uppercase text-neutral-500">
                          {material.category.name}
                        </span>
                        <h2 className="font-semibold">{material.title}</h2>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "antiguos", label: "Más antiguos" },
  { value: "titulo", label: "Título (A-Z)" },
] as const;

type Filters = {
  categoria?: string;
  q?: string;
  formato?: string;
  orden?: string;
};

function filterHref(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 ${
        active
          ? "bg-brand text-white"
          : "bg-white text-neutral-700 shadow hover:bg-neutral-100"
      }`}
    >
      {label}
    </Link>
  );
}
