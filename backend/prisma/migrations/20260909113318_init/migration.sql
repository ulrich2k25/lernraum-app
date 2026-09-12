-- CreateEnum
CREATE TYPE "RaumStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Lernraum" (
    "id" SERIAL NOT NULL,
    "raumBezeichnung" TEXT NOT NULL,
    "gebaeude" TEXT NOT NULL,
    "etage" TEXT NOT NULL,
    "kapazitaet" INTEGER NOT NULL,
    "status" "RaumStatus" NOT NULL DEFAULT 'ACTIVE',
    "raumToken" TEXT NOT NULL,

    CONSTRAINT "Lernraum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lernraum_raumToken_key" ON "Lernraum"("raumToken");
