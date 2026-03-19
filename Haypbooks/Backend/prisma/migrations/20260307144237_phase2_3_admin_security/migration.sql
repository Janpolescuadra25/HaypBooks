-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "superAdminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "geoLocation" JSONB,
    "riskScore" DECIMAL(5,2),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIpWhitelist" (
    "id" TEXT NOT NULL,
    "superAdminUserId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIpWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionApproval" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "actionType" "AdminAction" NOT NULL,
    "targetEntityType" "AdminEntityType" NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "proposedChanges" JSONB,
    "status" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approverId" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminActionApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_superAdminUserId_idx" ON "AdminSession"("superAdminUserId");

-- CreateIndex
CREATE INDEX "AdminSession_tokenHash_idx" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminIpWhitelist_superAdminUserId_isActive_idx" ON "AdminIpWhitelist"("superAdminUserId", "isActive");

-- CreateIndex
CREATE INDEX "AdminIpWhitelist_ipAddress_idx" ON "AdminIpWhitelist"("ipAddress");

-- CreateIndex
CREATE INDEX "AdminActionApproval_status_actionType_idx" ON "AdminActionApproval"("status", "actionType");

-- CreateIndex
CREATE INDEX "AdminActionApproval_requesterId_idx" ON "AdminActionApproval"("requesterId");

-- CreateIndex
CREATE INDEX "AdminActionApproval_approverId_idx" ON "AdminActionApproval"("approverId");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_superAdminUserId_fkey" FOREIGN KEY ("superAdminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminIpWhitelist" ADD CONSTRAINT "AdminIpWhitelist_superAdminUserId_fkey" FOREIGN KEY ("superAdminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionApproval" ADD CONSTRAINT "AdminActionApproval_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionApproval" ADD CONSTRAINT "AdminActionApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
