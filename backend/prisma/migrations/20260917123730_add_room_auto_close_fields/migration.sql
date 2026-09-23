-- AlterTable
ALTER TABLE "Lernraum" ADD COLUMN     "autoCloseWhenEmpty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTemporarilyClosed" BOOLEAN NOT NULL DEFAULT false;
