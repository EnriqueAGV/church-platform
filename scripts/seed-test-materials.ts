/**
 * Inserts sample materials (all titled "[Prueba] ...") to try the search bar.
 * They are videos, so no files are needed. Safe to re-run; use --remove to delete them.
 *
 * Usage:
 *   bun scripts/seed-test-materials.ts
 *   bun scripts/seed-test-materials.ts --remove
 */
import { PrismaClient } from "../generated/prisma";

const PREFIX = "[Prueba]";

const SAMPLES = [
  { title: "La creación del mundo", description: "Génesis 1: los seis días de la creación.", category: "Lección", youtubeId: "dQw4w9WgXcQ" },
  { title: "Noé y el arca", description: "Génesis 6-9: el diluvio y el pacto con Noé.", category: "Lección", youtubeId: "dQw4w9WgXcQ" },
  { title: "David y Goliat", description: "1 Samuel 17: la fe de un joven pastor.", category: "Lección", youtubeId: "dQw4w9WgXcQ" },
  { title: "El buen samaritano", description: "Lucas 10: quién es mi prójimo.", category: "Lección", youtubeId: "dQw4w9WgXcQ" },
  { title: "Guía para enseñar a niños de 6 a 8 años", description: "Consejos y dinámicas para el maestro.", category: "Guía del maestro", youtubeId: "dQw4w9WgXcQ" },
  { title: "Cómo preparar una clase de Escuela Bíblica", description: "Pasos para planificar la lección semanal.", category: "Guía del maestro", youtubeId: "dQw4w9WgXcQ" },
  { title: "Canción: Cristo me ama", description: "Video musical para cantar con los niños.", category: "Video", youtubeId: "dQw4w9WgXcQ" },
  { title: "Mapa de los viajes de Pablo", description: "Recurso visual de los viajes misioneros.", category: "Otro", youtubeId: "dQw4w9WgXcQ" },
] as const;

const db = new PrismaClient();

try {
  if (process.argv.includes("--remove")) {
    const { count } = await db.material.deleteMany({
      where: { title: { startsWith: PREFIX } },
    });
    console.log(`Eliminados ${count} materiales de prueba.`);
  } else {
    const author = await db.user.findFirst({
      where: { role: "admin" },
      select: { id: true },
    });
    if (!author) throw new Error("No hay un usuario admin para asignar los materiales.");

    let created = 0;
    for (const sample of SAMPLES) {
      const title = `${PREFIX} ${sample.title}`;
      if (await db.material.findFirst({ where: { title } })) continue;

      const category = await db.category.upsert({
        where: { name: sample.category },
        update: {},
        create: { name: sample.category },
      });
      await db.material.create({
        data: {
          title,
          description: sample.description,
          format: "VIDEO",
          youtubeId: sample.youtubeId,
          categoryId: category.id,
          createdById: author.id,
        },
      });
      created++;
    }
    console.log(`Creados ${created} materiales de prueba.`);
  }
} finally {
  await db.$disconnect();
}
