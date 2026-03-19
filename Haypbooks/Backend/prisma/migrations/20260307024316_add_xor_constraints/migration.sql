/*
  Warnings:

  - Added the required column `updatedAt` to the `FixedAssetCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LiquidityType" AS ENUM ('CURRENT', 'NON_CURRENT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "StandardFixedAssetCategory" AS ENUM ('LAND', 'BUILDING', 'LEASEHOLD_IMPROVEMENT', 'MACHINERY_EQUIPMENT', 'FURNITURE_FIXTURES', 'VEHICLE', 'COMPUTER_IT', 'SOFTWARE', 'PHONE_SYSTEM', 'PHOTO_VIDEO', 'OFFICE_EQUIPMENT', 'TOOLS_EQUIPMENT', 'INTANGIBLE', 'CONSTRUCTION_PROGRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountSpecialType" AS ENUM ('NONE', 'CONTROL_ACCOUNT', 'CONTRA_ACCOUNT', 'SUSPENSE_ACCOUNT', 'INTERCOMPANY_ACCOUNT', 'REVALUATION_ACCOUNT');

-- CreateEnum
CREATE TYPE "PracticeCalendarEventType" AS ENUM ('MEETING', 'DEADLINE', 'REMINDER', 'PERIOD_CLOSE', 'ENGAGEMENT', 'TAX_FILING', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarAttendeeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE');

-- CreateEnum
CREATE TYPE "ClientRequestType" AS ENUM ('INFORMATION', 'DOCUMENT', 'ADJUSTMENT', 'APPROVAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ClientRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ClientRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CLIENT', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SettingsChangeCategory" AS ENUM ('LOCALIZATION', 'CURRENCY', 'FISCAL_YEAR', 'TAX_DEFAULTS', 'SECURITY', 'DOCUMENT', 'REPORTING', 'AI', 'OTHER');

-- CreateEnum
CREATE TYPE "DeleteType" AS ENUM ('SOFT', 'HARD', 'CASCADE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');

-- CreateEnum
CREATE TYPE "MfaType" AS ENUM ('TOTP', 'SMS', 'EMAIL', 'BACKUP_CODE');

-- CreateEnum
CREATE TYPE "AuditFieldDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BirFormType" ADD VALUE 'FORM_0605';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1901';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1905';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1701';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1701A';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1702RT';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1702MX';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_1702RX';
ALTER TYPE "BirFormType" ADD VALUE 'FORM_2551Q';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DepreciationMethod" ADD VALUE 'DECLINING_BALANCE';
ALTER TYPE "DepreciationMethod" ADD VALUE 'DOUBLE_DECLINING_BALANCE';
ALTER TYPE "DepreciationMethod" ADD VALUE 'SUM_OF_YEARS_DIGITS';
ALTER TYPE "DepreciationMethod" ADD VALUE 'UNITS_OF_PRODUCTION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationType" ADD VALUE 'BDO_BANK';
ALTER TYPE "IntegrationType" ADD VALUE 'BPI_BANK';
ALTER TYPE "IntegrationType" ADD VALUE 'METROBANK';
ALTER TYPE "IntegrationType" ADD VALUE 'UNIONBANK';
ALTER TYPE "IntegrationType" ADD VALUE 'LANDBANK';
ALTER TYPE "IntegrationType" ADD VALUE 'PNB_BANK';
ALTER TYPE "IntegrationType" ADD VALUE 'RCBC_BANK';
ALTER TYPE "IntegrationType" ADD VALUE 'EASTWEST_BANK';
ALTER TYPE "IntegrationType" ADD VALUE 'GCASH';
ALTER TYPE "IntegrationType" ADD VALUE 'MAYA_PAYMAYA';
ALTER TYPE "IntegrationType" ADD VALUE 'GRABPAY';
ALTER TYPE "IntegrationType" ADD VALUE 'SHOPEEPAY';
ALTER TYPE "IntegrationType" ADD VALUE 'LAZADA';
ALTER TYPE "IntegrationType" ADD VALUE 'SHOPEE';
ALTER TYPE "IntegrationType" ADD VALUE 'WOOCOMMERCE';
ALTER TYPE "IntegrationType" ADD VALUE 'SHOPIFY';
ALTER TYPE "IntegrationType" ADD VALUE 'SPROUT_HR';
ALTER TYPE "IntegrationType" ADD VALUE 'SALARIUM';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActiveForEntry" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isHeader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liquidityType" "LiquidityType" DEFAULT 'CURRENT',
ADD COLUMN     "specialType" "AccountSpecialType" DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "allowedIps" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastIpAddress" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "rateLimit" INTEGER NOT NULL DEFAULT 1000;

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "birRdoCode" TEXT,
ADD COLUMN     "birRegistrationDate" TIMESTAMP(3),
ADD COLUMN     "birRegistrationStatus" TEXT,
ADD COLUMN     "birTin" VARCHAR(15),
ADD COLUMN     "dataRetentionYears" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "retentionPolicySetAt" TIMESTAMP(3),
ADD COLUMN     "retentionPolicySetBy" TEXT,
ADD COLUMN     "taxIncentiveDetails" JSONB,
ADD COLUMN     "taxIncentiveExpiry" TIMESTAMP(3),
ADD COLUMN     "taxIncentiveGranted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxIncentiveType" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "ExpenseClaimLine" ADD COLUMN     "subCategoryId" TEXT;

-- AlterTable
ALTER TABLE "FixedAsset" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "standardCategory" "StandardFixedAssetCategory";

-- AlterTable
ALTER TABLE "FixedAssetCategory" ADD COLUMN     "defaultDepreciationMethod" "DepreciationMethod" DEFAULT 'STRAIGHT_LINE',
ADD COLUMN     "defaultUsefulLifeMonths" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "standardCategory" "StandardFixedAssetCategory",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "previousId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedBy" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "TaxRate" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastMfaUsedAt" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "mfaBackupCodes" TEXT,
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaEnabledAt" TIMESTAMP(3),
ADD COLUMN     "mfaSecret" TEXT,
ADD COLUMN     "mfaType" "MfaType",
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT NOT NULL,
    "templateConfig" JSONB NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringJournalTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "memo" TEXT,
    "linesConfig" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringJournalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseSubCategoryConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "parentAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseSubCategoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogLine" (
    "id" TEXT NOT NULL,
    "auditLogId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeType" "ChangeType" NOT NULL DEFAULT 'UPDATE',
    "dataType" "AuditFieldDataType",
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuditLogLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "deletedData" JSONB NOT NULL,
    "metadata" JSONB,
    "deleteType" "DeleteType" NOT NULL DEFAULT 'SOFT',
    "deletedById" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "reference" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "recoveredAt" TIMESTAMP(3),
    "recoveredById" TEXT,

    CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_settings" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "allowManualEntry" BOOLEAN NOT NULL DEFAULT true,
    "requireReconciliation" BOOLEAN NOT NULL DEFAULT false,
    "budgetWarningThreshold" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'PHP',
    "accountingMethod" TEXT NOT NULL DEFAULT 'ACCRUAL',
    "birFilingReminder" BOOLEAN NOT NULL DEFAULT true,
    "vatRegistered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
    "defaultLandingPage" TEXT NOT NULL DEFAULT 'dashboard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeHealthMetric" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "activeEngagements" INTEGER NOT NULL DEFAULT 0,
    "pendingReviews" INTEGER NOT NULL DEFAULT 0,
    "arBalance" DECIMAL(20,4),
    "apBalance" DECIMAL(20,4),
    "wipBalance" DECIMAL(20,4),
    "efficiencyScore" DECIMAL(5,2),
    "activeClients" INTEGER NOT NULL DEFAULT 0,
    "newClients" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeHealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeCalendar" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "PracticeCalendarEventType" NOT NULL DEFAULT 'OTHER',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "externalId" TEXT,
    "externalSource" TEXT,
    "taskId" TEXT,
    "engagementId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarAttendee" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "responseStatus" "CalendarAttendeeStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "CalendarAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequest" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ClientRequestType" NOT NULL DEFAULT 'OTHER',
    "priority" "ClientRequestPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "ClientRequestStatus" NOT NULL DEFAULT 'OPEN',
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "assignedToId" TEXT,
    "dueAt" TIMESTAMP(3),
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "engagementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequestResponse" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "isFromClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRequestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequestAttachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRequestAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequestActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "detail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-PH',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "numberFormat" TEXT NOT NULL DEFAULT 'en-PH',
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLocale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnector" (
    "id" TEXT NOT NULL,
    "systemType" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "category" TEXT NOT NULL,
    "configSchema" JSONB NOT NULL,
    "docsUrl" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isBeta" BOOLEAN NOT NULL DEFAULT false,
    "countries" TEXT[] DEFAULT ARRAY['PH']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocaleConfiguration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "defaultLocale" TEXT NOT NULL DEFAULT 'en-PH',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT 'HH:mm',
    "enabledLocales" TEXT[] DEFAULT ARRAY['en-PH', 'tl']::TEXT[],
    "weekStartDay" INTEGER NOT NULL DEFAULT 1,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'PHP',
    "numberFormat" TEXT NOT NULL DEFAULT 'en-PH',
    "currencyDisplay" TEXT NOT NULL DEFAULT 'symbol',
    "currencyPlacement" TEXT NOT NULL DEFAULT 'before',
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "roundingMode" TEXT NOT NULL DEFAULT 'HALF_UP',
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "fiscalYearStartDay" INTEGER NOT NULL DEFAULT 1,
    "defaultVatRate" DECIMAL(5,2),
    "defaultWithholdingRate" DECIMAL(5,2),
    "preferredTaxAgency" TEXT,
    "birEnabled" BOOLEAN NOT NULL DEFAULT true,
    "einvoicingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultExchangeSource" TEXT NOT NULL DEFAULT 'manual',
    "autoUpdateRates" BOOLEAN NOT NULL DEFAULT false,
    "realizedGainLossAccountId" TEXT,
    "unrealizedGainLossAccountId" TEXT,
    "maxFileSizeMb" INTEGER NOT NULL DEFAULT 50,
    "allowedFileTypes" TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'png', 'docx', 'xlsx']::TEXT[],
    "preferredStorageProvider" TEXT NOT NULL DEFAULT 'S3',
    "require2FA" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 12,
    "defaultUserRole" TEXT NOT NULL DEFAULT 'VIEWER',
    "aiAutoCategorizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiAnomalyDetectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultReportCurrency" TEXT NOT NULL DEFAULT 'PHP',
    "defaultComparisonPeriod" TEXT NOT NULL DEFAULT 'PREVIOUS_MONTH',
    "updatedById" TEXT,
    "changeCategory" "SettingsChangeCategory" DEFAULT 'OTHER',
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_log" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "blockedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowTemplate_workspaceId_domain_isActive_idx" ON "WorkflowTemplate"("workspaceId", "domain", "isActive");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_isBuiltIn_idx" ON "WorkflowTemplate"("isBuiltIn");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_workspaceId_name_key" ON "WorkflowTemplate"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "RecurringJournalTemplate_workspaceId_companyId_isActive_idx" ON "RecurringJournalTemplate"("workspaceId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringJournalTemplate_companyId_name_key" ON "RecurringJournalTemplate"("companyId", "name");

-- CreateIndex
CREATE INDEX "ExpenseSubCategoryConfig_companyId_parentAccountId_isActive_idx" ON "ExpenseSubCategoryConfig"("companyId", "parentAccountId", "isActive");

-- CreateIndex
CREATE INDEX "ExpenseSubCategoryConfig_companyId_isActive_idx" ON "ExpenseSubCategoryConfig"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSubCategoryConfig_companyId_parentAccountId_name_key" ON "ExpenseSubCategoryConfig"("companyId", "parentAccountId", "name");

-- CreateIndex
CREATE INDEX "AuditLogLine_auditLogId_idx" ON "AuditLogLine"("auditLogId");

-- CreateIndex
CREATE INDEX "AuditLogLine_auditLogId_fieldName_idx" ON "AuditLogLine"("auditLogId", "fieldName");

-- CreateIndex
CREATE INDEX "AuditLogLine_fieldName_changeType_idx" ON "AuditLogLine"("fieldName", "changeType");

-- CreateIndex
CREATE INDEX "DeletionLog_workspaceId_tableName_deletedAt_idx" ON "DeletionLog"("workspaceId", "tableName", "deletedAt");

-- CreateIndex
CREATE INDEX "DeletionLog_companyId_tableName_deletedAt_idx" ON "DeletionLog"("companyId", "tableName", "deletedAt");

-- CreateIndex
CREATE INDEX "DeletionLog_tableName_recordId_idx" ON "DeletionLog"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "DeletionLog_deletedById_idx" ON "DeletionLog"("deletedById");

-- CreateIndex
CREATE INDEX "DeletionLog_recoveredById_idx" ON "DeletionLog"("recoveredById");

-- CreateIndex
CREATE UNIQUE INDEX "account_settings_accountId_key" ON "account_settings"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_companyId_key" ON "company_settings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "PracticeHealthMetric_practiceId_metricDate_idx" ON "PracticeHealthMetric"("practiceId", "metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeHealthMetric_practiceId_metricDate_key" ON "PracticeHealthMetric"("practiceId", "metricDate");

-- CreateIndex
CREATE INDEX "PracticeCalendar_practiceId_startAt_idx" ON "PracticeCalendar"("practiceId", "startAt");

-- CreateIndex
CREATE INDEX "PracticeCalendar_companyId_startAt_idx" ON "PracticeCalendar"("companyId", "startAt");

-- CreateIndex
CREATE INDEX "CalendarAttendee_calendarId_idx" ON "CalendarAttendee"("calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarAttendee_calendarId_email_key" ON "CalendarAttendee"("calendarId", "email");

-- CreateIndex
CREATE INDEX "ClientRequest_practiceId_status_idx" ON "ClientRequest"("practiceId", "status");

-- CreateIndex
CREATE INDEX "ClientRequest_companyId_status_idx" ON "ClientRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "ClientRequest_assignedToId_status_idx" ON "ClientRequest"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "ClientRequestResponse_requestId_idx" ON "ClientRequestResponse"("requestId");

-- CreateIndex
CREATE INDEX "ClientRequestAttachment_requestId_idx" ON "ClientRequestAttachment"("requestId");

-- CreateIndex
CREATE INDEX "ClientRequestActivity_requestId_createdAt_idx" ON "ClientRequestActivity"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientRequestActivity_userId_idx" ON "ClientRequestActivity"("userId");

-- CreateIndex
CREATE INDEX "Translation_workspaceId_entityType_locale_idx" ON "Translation"("workspaceId", "entityType", "locale");

-- CreateIndex
CREATE INDEX "Translation_workspaceId_locale_idx" ON "Translation"("workspaceId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_workspaceId_entityType_entityId_field_locale_key" ON "Translation"("workspaceId", "entityType", "entityId", "field", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocale_userId_key" ON "UserLocale"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnector_systemType_key" ON "IntegrationConnector"("systemType");

-- CreateIndex
CREATE INDEX "IntegrationConnector_category_isLive_idx" ON "IntegrationConnector"("category", "isLive");

-- CreateIndex
CREATE INDEX "IntegrationConnector_countries_idx" ON "IntegrationConnector"("countries");

-- CreateIndex
CREATE UNIQUE INDEX "LocaleConfiguration_workspaceId_key" ON "LocaleConfiguration"("workspaceId");

-- CreateIndex
CREATE INDEX "LocaleConfiguration_workspaceId_idx" ON "LocaleConfiguration"("workspaceId");

-- CreateIndex
CREATE INDEX "system_config_workspaceId_idx" ON "system_config"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_workspaceId_key_key" ON "system_config"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "rate_limit_log_workspaceId_identifier_idx" ON "rate_limit_log"("workspaceId", "identifier");

-- CreateIndex
CREATE INDEX "rate_limit_log_expiresAt_idx" ON "rate_limit_log"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_log_identifier_action_key" ON "rate_limit_log"("identifier", "action");

-- CreateIndex
CREATE INDEX "Account_companyId_deletedAt_idx" ON "Account"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "ApiKey_expiresAt_idx" ON "ApiKey"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "BankAccount_workspaceId_deletedAt_idx" ON "BankAccount"("workspaceId", "deletedAt");

-- CreateIndex
CREATE INDEX "BankTransaction_workspaceId_date_bankAccountId_idx" ON "BankTransaction"("workspaceId", "date", "bankAccountId");

-- CreateIndex
CREATE INDEX "Bill_companyId_status_dueAt_idx" ON "Bill"("companyId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Company_birRegistrationStatus_idx" ON "Company"("birRegistrationStatus");

-- CreateIndex
CREATE INDEX "Company_taxIncentiveGranted_idx" ON "Company"("taxIncentiveGranted");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_deletedAt_idx" ON "Contact"("workspaceId", "deletedAt");

-- CreateIndex
CREATE INDEX "Customer_workspaceId_deletedAt_idx" ON "Customer"("workspaceId", "deletedAt");

-- CreateIndex
CREATE INDEX "Employee_companyId_deletedAt_idx" ON "Employee"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "ExpenseClaimLine_subCategoryId_idx" ON "ExpenseClaimLine"("subCategoryId");

-- CreateIndex
CREATE INDEX "FixedAsset_companyId_deletedAt_idx" ON "FixedAsset"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "FixedAssetCategory_companyId_isActive_idx" ON "FixedAssetCategory"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "FixedAssetCategory_standardCategory_idx" ON "FixedAssetCategory"("standardCategory");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_dueDate_idx" ON "Invoice"("companyId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Item_companyId_deletedAt_idx" ON "Item"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "JournalEntry_version_idx" ON "JournalEntry"("version");

-- CreateIndex
CREATE INDEX "JournalEntry_previousId_idx" ON "JournalEntry"("previousId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_companyId_accountId_idx" ON "JournalEntryLine"("companyId", "accountId");

-- CreateIndex
CREATE INDEX "Notification_priority_createdAt_idx" ON "Notification"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_archivedAt_idx" ON "Notification"("archivedAt");

-- CreateIndex
CREATE INDEX "Notification_expiresAt_idx" ON "Notification"("expiresAt");

-- CreateIndex
CREATE INDEX "TaxRate_companyId_deletedAt_idx" ON "TaxRate"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_mfaEnabled_idx" ON "User"("mfaEnabled");

-- CreateIndex
CREATE INDEX "Vendor_workspaceId_deletedAt_idx" ON "Vendor"("workspaceId", "deletedAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_retentionPolicySetBy_fkey" FOREIGN KEY ("retentionPolicySetBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_previousId_fkey" FOREIGN KEY ("previousId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJournalTemplate" ADD CONSTRAINT "RecurringJournalTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJournalTemplate" ADD CONSTRAINT "RecurringJournalTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringJournalTemplate" ADD CONSTRAINT "RecurringJournalTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaimLine" ADD CONSTRAINT "ExpenseClaimLine_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "ExpenseSubCategoryConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSubCategoryConfig" ADD CONSTRAINT "ExpenseSubCategoryConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSubCategoryConfig" ADD CONSTRAINT "ExpenseSubCategoryConfig_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogLine" ADD CONSTRAINT "AuditLogLine_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionLog" ADD CONSTRAINT "DeletionLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionLog" ADD CONSTRAINT "DeletionLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionLog" ADD CONSTRAINT "DeletionLog_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionLog" ADD CONSTRAINT "DeletionLog_recoveredById_fkey" FOREIGN KEY ("recoveredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "account_settings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeHealthMetric" ADD CONSTRAINT "PracticeHealthMetric_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCalendar" ADD CONSTRAINT "PracticeCalendar_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCalendar" ADD CONSTRAINT "PracticeCalendar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCalendar" ADD CONSTRAINT "PracticeCalendar_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCalendar" ADD CONSTRAINT "PracticeCalendar_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCalendar" ADD CONSTRAINT "PracticeCalendar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarAttendee" ADD CONSTRAINT "CalendarAttendee_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "PracticeCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarAttendee" ADD CONSTRAINT "CalendarAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequestResponse" ADD CONSTRAINT "ClientRequestResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClientRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequestResponse" ADD CONSTRAINT "ClientRequestResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequestAttachment" ADD CONSTRAINT "ClientRequestAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClientRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequestActivity" ADD CONSTRAINT "ClientRequestActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClientRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequestActivity" ADD CONSTRAINT "ClientRequestActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocale" ADD CONSTRAINT "UserLocale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocaleConfiguration" ADD CONSTRAINT "LocaleConfiguration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocaleConfiguration" ADD CONSTRAINT "LocaleConfiguration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_limit_log" ADD CONSTRAINT "rate_limit_log_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "chk_onboardingstep_owner" CHECK (
  ("companyId" IS NOT NULL AND "practiceId" IS NULL) OR 
  ("companyId" IS NULL AND "practiceId" IS NOT NULL)
);

-- AddCheckConstraint
ALTER TABLE "Subscription" ADD CONSTRAINT "chk_subscription_owner" CHECK (
  ("companyId" IS NOT NULL AND "practiceId" IS NULL) OR 
  ("companyId" IS NULL AND "practiceId" IS NOT NULL)
);
