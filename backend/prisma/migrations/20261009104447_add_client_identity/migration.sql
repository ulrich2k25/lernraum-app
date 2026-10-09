-- CreateTable
CREATE TABLE "ClientIdentity" (
    "clientId" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientIdentity_pkey" PRIMARY KEY ("clientId")
);
