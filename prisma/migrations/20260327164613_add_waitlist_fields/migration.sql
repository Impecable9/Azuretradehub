/*
  Warnings:

  - You are about to drop the column `image` on the `Waitlist` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Waitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "role" TEXT,
    "industry" TEXT,
    "useCase" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Waitlist" ("createdAt", "email", "id", "name", "notified") SELECT "createdAt", "email", "id", "name", "notified" FROM "Waitlist";
DROP TABLE "Waitlist";
ALTER TABLE "new_Waitlist" RENAME TO "Waitlist";
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
