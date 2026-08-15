-- CreateTable
CREATE TABLE "PracticeInvite" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "engagementName" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedByUserId" TEXT,
    "companyId" TEXT,
    "engagementId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeInvite_code_key" ON "PracticeInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeInvite_engagementId_key" ON "PracticeInvite"("engagementId");

-- AddForeignKey
ALTER TABLE "PracticeInvite" ADD CONSTRAINT "PracticeInvite_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeInvite" ADD CONSTRAINT "PracticeInvite_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeInvite" ADD CONSTRAINT "PracticeInvite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeInvite" ADD CONSTRAINT "PracticeInvite_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
