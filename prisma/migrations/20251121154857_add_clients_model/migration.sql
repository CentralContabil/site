-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_newsletter_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_newsletter_subscriptions" ("created_at", "email", "id", "name", "updated_at") SELECT "created_at", "email", "id", "name", "updated_at" FROM "newsletter_subscriptions";
DROP TABLE "newsletter_subscriptions";
ALTER TABLE "new_newsletter_subscriptions" RENAME TO "newsletter_subscriptions";
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
