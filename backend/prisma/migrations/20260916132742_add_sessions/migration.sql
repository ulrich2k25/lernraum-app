-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'ENDED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "lernraumId" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_clientId_status_idx" ON "Session"("clientId", "status");

-- CreateIndex
CREATE INDEX "Session_lernraumId_status_idx" ON "Session"("lernraumId", "status");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_lernraumId_fkey" FOREIGN KEY ("lernraumId") REFERENCES "Lernraum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
