-- Categories become a table; the old MaterialType enum is split into a format (PDF, IMAGE, ...)

CREATE TYPE "MaterialFormat" AS ENUM ('PDF', 'IMAGE', 'VIDEO', 'OTHER');

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

INSERT INTO "Category" ("id", "name") VALUES
    ('cat_lesson', 'Lección'),
    ('cat_guide', 'Guía del maestro'),
    ('cat_image', 'Imagen'),
    ('cat_video', 'Video'),
    ('cat_other', 'Otro');

ALTER TABLE "Material" ADD COLUMN "format" "MaterialFormat",
                       ADD COLUMN "categoryId" TEXT;

UPDATE "Material" SET
    "format" = (CASE "type"
        WHEN 'LESSON' THEN 'PDF'
        WHEN 'TEACHER_GUIDE' THEN 'PDF'
        WHEN 'IMAGE' THEN 'IMAGE'
        WHEN 'VIDEO' THEN 'VIDEO'
        ELSE 'OTHER' END)::"MaterialFormat",
    "categoryId" = (CASE "type"
        WHEN 'LESSON' THEN 'cat_lesson'
        WHEN 'TEACHER_GUIDE' THEN 'cat_guide'
        WHEN 'IMAGE' THEN 'cat_image'
        WHEN 'VIDEO' THEN 'cat_video'
        ELSE 'cat_other' END);

ALTER TABLE "Material" ALTER COLUMN "format" SET NOT NULL,
                       ALTER COLUMN "categoryId" SET NOT NULL;

DROP INDEX IF EXISTS "Material_type_idx";
ALTER TABLE "Material" DROP COLUMN "type";
DROP TYPE "MaterialType";

CREATE INDEX "Material_categoryId_idx" ON "Material"("categoryId");

ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
