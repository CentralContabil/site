/*
  Warnings:

  - Added the required column `slug` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Criar tabela temporária com os novos campos
CREATE TABLE "new_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "icon" TEXT,
    "image_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- Copiar dados existentes e gerar slugs
INSERT INTO "new_services" ("id", "name", "slug", "description", "icon", "order", "is_active", "created_at", "updated_at")
SELECT 
    "id",
    "name",
    LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        "name",
        'á', 'a'), 'à', 'a'), 'ã', 'a'), 'â', 'a'), 'é', 'e'), 'ê', 'e'), 'í', 'i'), 'ó', 'o'), 'ô', 'o'), 'ú', 'u'))
    || '-' || SUBSTR("id", -8) as "slug",
    "description",
    "icon",
    "order",
    "is_active",
    "created_at",
    "updated_at"
FROM "services";

DROP TABLE "services";
ALTER TABLE "new_services" RENAME TO "services";
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
