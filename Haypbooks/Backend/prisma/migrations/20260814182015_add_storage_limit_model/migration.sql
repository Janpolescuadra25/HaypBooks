-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StorageLimit" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "planBaseLimitMb" INTEGER NOT NULL DEFAULT 0,
    "ownerOverrideMb" INTEGER,
    "safetyNetMb" INTEGER NOT NULL DEFAULT 51200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageLimit_companyId_key" ON "StorageLimit"("companyId");

-- CreateIndex
CREATE INDEX "StorageLimit_companyId_idx" ON "StorageLimit"("companyId");

-- AddForeignKey
ALTER TABLE "StorageLimit" ADD CONSTRAINT "StorageLimit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
