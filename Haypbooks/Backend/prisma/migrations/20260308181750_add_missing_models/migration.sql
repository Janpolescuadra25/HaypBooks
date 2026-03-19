-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" DECIMAL(19,4),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "totalRaised" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" TEXT,
    "status" "ProjectTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorInteraction" (
    "id" TEXT NOT NULL,
    "donorManagementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementTemplate" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementWorkflow" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "templateId" TEXT,
    "steps" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeDashboard" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Dashboard',
    "layout" JSONB,
    "widgets" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPortalSettings" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowedFeatures" JSONB,
    "branding" JSONB,
    "welcomeMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPortalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_companyId_status_idx" ON "Campaign"("companyId", "status");

-- CreateIndex
CREATE INDEX "Campaign_companyId_startDate_idx" ON "Campaign"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_status_idx" ON "ProjectTask"("projectId", "status");

-- CreateIndex
CREATE INDEX "DonorInteraction_donorManagementId_idx" ON "DonorInteraction"("donorManagementId");

-- CreateIndex
CREATE INDEX "DonorInteraction_occurredAt_idx" ON "DonorInteraction"("occurredAt");

-- CreateIndex
CREATE INDEX "EngagementTemplate_practiceId_type_idx" ON "EngagementTemplate"("practiceId", "type");

-- CreateIndex
CREATE INDEX "EngagementTemplate_practiceId_isActive_idx" ON "EngagementTemplate"("practiceId", "isActive");

-- CreateIndex
CREATE INDEX "EngagementWorkflow_engagementId_idx" ON "EngagementWorkflow"("engagementId");

-- CreateIndex
CREATE INDEX "EngagementWorkflow_status_idx" ON "EngagementWorkflow"("status");

-- CreateIndex
CREATE INDEX "PracticeDashboard_practiceId_idx" ON "PracticeDashboard"("practiceId");

-- CreateIndex
CREATE INDEX "PracticeDashboard_practiceId_userId_idx" ON "PracticeDashboard"("practiceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPortalSettings_practiceId_key" ON "ClientPortalSettings"("practiceId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorInteraction" ADD CONSTRAINT "DonorInteraction_donorManagementId_fkey" FOREIGN KEY ("donorManagementId") REFERENCES "DonorManagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementTemplate" ADD CONSTRAINT "EngagementTemplate_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementWorkflow" ADD CONSTRAINT "EngagementWorkflow_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementWorkflow" ADD CONSTRAINT "EngagementWorkflow_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EngagementTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeDashboard" ADD CONSTRAINT "PracticeDashboard_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPortalSettings" ADD CONSTRAINT "ClientPortalSettings_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
