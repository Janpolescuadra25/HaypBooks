-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'otppurpose') THEN
        CREATE TYPE "OtpPurpose" AS ENUM ('RESET', 'VERIFY_EMAIL', 'MFA');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'depreciationmethod') THEN
        CREATE TYPE "DepreciationMethod" AS ENUM ('STRAIGHT_LINE');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'timesheetstatus') THEN
        CREATE TYPE "TimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'postingstatus') THEN
        CREATE TYPE "PostingStatus" AS ENUM ('DRAFT', 'POSTED', 'VOIDED');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'periodstatus') THEN
        CREATE TYPE "PeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'budgetscenario') THEN
        CREATE TYPE "BudgetScenario" AS ENUM ('ACTUAL', 'BUDGET', 'FORECAST', 'WHAT_IF');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'budgetstatus') THEN
        CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'APPROVED', 'LOCKED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "name" TEXT,
    "passwordhash" TEXT NOT NULL,
    "isemailverified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resettoken" TEXT,
    "resettokenexpiry" INTEGER,
    "onboardingcomplete" BOOLEAN DEFAULT false,
    "onboarding_mode" TEXT NOT NULL DEFAULT 'full',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ipaddress" TEXT,
    "useragent" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "lastusedat" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "otpCode" VARCHAR(16) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'RESET',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSecurityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "UserSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAssetCategory" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAsset" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "cost" DECIMAL(20,4) NOT NULL,
    "salvageValue" DECIMAL(20,4),
    "usefulLifeMonths" INTEGER,
    "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'STRAIGHT_LINE',
    "assetAccountId" TEXT,
    "accumulatedDepreciationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAssetDepreciation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetDepreciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "tenantId" uuid NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleId" TEXT,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("tenantId","userId")
);

-- CreateTable
CREATE TABLE "TenantInvite" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "roleId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "TenantInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL(28,12) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSubType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "AccountSubType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "balanceForeign" DECIMAL(20,4),

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "budgetAmount" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "employeeId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimesheetApproval" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "TimesheetApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "scenario" "BudgetScenario" NOT NULL DEFAULT 'ACTUAL',
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "fiscalYear" INTEGER NOT NULL,
    "totalAmount" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "accountId" TEXT,
    "classId" TEXT,
    "month" INTEGER,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingPeriod" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reversal" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "originalType" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "reversalEntry" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reversal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialStatementSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialStatementSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "statementDate" TIMESTAMP(3) NOT NULL,
    "closingBalance" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliationLine" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "bankReconciliationId" TEXT NOT NULL,
    "bankTransactionId" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliationLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "type" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactCustomField" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,

    CONSTRAINT "ContactCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "parentId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountSubTypeId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "entryNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(16,4),

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "companyId" TEXT,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "credit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "description" TEXT,
    "tenantId" uuid NOT NULL,
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "type" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEmail" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORK',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPhone" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORK',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "contactId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "terms" TEXT,
    "creditLimit" DECIMAL(12,2),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "contactId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inventoryAssetAccountId" TEXT,
    "cogsAccountId" TEXT,
    "costMethod" TEXT DEFAULT 'FIFO',

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCostLayer" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "itemId" TEXT NOT NULL,
    "inventoryTxLineId" TEXT,
    "quantity" DECIMAL(28,6) NOT NULL,
    "remainingQty" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryCostLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLocation" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "contactId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "ssnHash" TEXT,
    "hireDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "payRate" DECIMAL(12,2),
    "payType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaySchedule" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "payScheduleId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRunEmployee" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "grossAmount" DECIMAL(20,4) NOT NULL,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRunEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paycheck" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "payrollRunId" TEXT,
    "employeeId" TEXT NOT NULL,
    "checkNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "grossAmount" DECIMAL(20,4) NOT NULL,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "Paycheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaycheckLine" (
    "id" TEXT NOT NULL,
    "paycheckId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "PaycheckLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaycheckTax" (
    "id" TEXT NOT NULL,
    "paycheckId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaycheckTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "itemId" TEXT NOT NULL,
    "stockLocationId" TEXT NOT NULL,
    "quantity" DECIMAL(28,6) NOT NULL,
    "reserved" DECIMAL(28,6) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "transactionNumber" TEXT,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseOrderId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "journalEntryId" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransactionLine" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "transactionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "stockLocationId" TEXT,
    "qty" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6),
    "lineType" TEXT,
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "InventoryTransactionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxJurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxJurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isCompound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "tenantId" uuid,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCodeRate" (
    "id" TEXT NOT NULL,
    "taxCodeId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "ratePct" DECIMAL(10,6) NOT NULL,

    CONSTRAINT "TaxCodeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineTax" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "invoiceLineId" TEXT,
    "billLineId" TEXT,
    "purchaseOrderLineId" TEXT,
    "taxCodeId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "LineTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCodeAccount" (
    "id" TEXT NOT NULL,
    "tenantId" uuid,
    "taxCodeId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "TaxCodeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "desc" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revaluation" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "period" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entries" JSONB NOT NULL,

    CONSTRAINT "Revaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "invoiceNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(16,4),
    "discountAmount" DECIMAL(16,4),
    "shippingAmount" DECIMAL(16,4),
    "otherCharges" DECIMAL(16,4),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "companyId" TEXT,
    "customerId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3) NOT NULL,
    "templateData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "invoiceId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "itemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(16,4),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceived" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(16,4),
    "journalEntryId" TEXT,

    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePaymentApplication" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoicePaymentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "vendorId" TEXT NOT NULL,
    "billNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(16,4),
    "discountAmount" DECIMAL(16,4),
    "shippingAmount" DECIMAL(16,4),
    "otherCharges" DECIMAL(16,4),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "description" TEXT,
    "journalEntryId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "billId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "accountId" TEXT,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "taxCodeId" TEXT,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(16,4),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "BillLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(16,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "inventoryTransactionId" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "vendorId" TEXT NOT NULL,
    "creditNumber" TEXT,
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "VendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "customerId" TEXT NOT NULL,
    "creditNumber" TEXT,
    "total" DECIMAL(16,4) NOT NULL,
    "balance" DECIMAL(16,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "CustomerCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCreditLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "customerCreditId" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(16,4) NOT NULL,
    "description" TEXT,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "CustomerCreditLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCreditApplication" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "creditId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerCreditApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCreditLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "vendorCreditId" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(16,4) NOT NULL,
    "description" TEXT,
    "tenantId" uuid NOT NULL,

    CONSTRAINT "VendorCreditLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "bankAccountId" TEXT,
    "vendorPaymentMethodId" TEXT,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(16,4),
    "journalEntryId" TEXT,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPaymentApplication" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "billId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(16,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillPaymentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPaymentMethod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "tenantId" uuid NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" BIGSERIAL NOT NULL,
    "tenantId" uuid,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aggregateId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAttempt" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "worker" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "JobAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLetter" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryAfter" TIMESTAMP(3),

    CONSTRAINT "DeadLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexingQueue" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "indexableType" TEXT NOT NULL,
    "indexableId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndexingQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexedDoc" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "indexableType" TEXT NOT NULL,
    "indexableId" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "indexedPayload" JSONB NOT NULL,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndexedDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBillingInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "TenantBillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBillingUsage" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "period" TEXT NOT NULL,
    "invoicesCount" INTEGER NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "TenantBillingUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsrExportRequest" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "requesterId" TEXT,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "exportLink" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DsrExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "userId" TEXT,
    "consentType" TEXT NOT NULL,
    "consentStatus" TEXT NOT NULL,
    "metadata" JSONB,
    "grantedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "tenantId" uuid NOT NULL,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT,
    "eventType" TEXT NOT NULL,
    "tenantId" uuid,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaMigration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appliedBy" TEXT,
    "checksum" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" TEXT NOT NULL,
    "artifactRef" TEXT,

    CONSTRAINT "SchemaMigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimit" (
    "id" TEXT NOT NULL,
    "tenantId" uuid,
    "apiKeyId" TEXT,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "quota" INTEGER NOT NULL,

    CONSTRAINT "ApiRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiTokenRevocation" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "revokedBy" TEXT,
    "reason" TEXT,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiTokenRevocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");

-- CreateIndex
CREATE INDEX "UserSecurityEvent_userId_idx" ON "UserSecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "UserSecurityEvent_email_idx" ON "UserSecurityEvent"("email");

-- CreateIndex
CREATE INDEX "OnboardingStep_userId_idx" ON "OnboardingStep"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_name_key" ON "Company"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAssetCategory_tenantId_name_key" ON "FixedAssetCategory"("tenantId", "name");

-- CreateIndex
CREATE INDEX "FixedAsset_tenantId_idx" ON "FixedAsset"("tenantId");

-- CreateIndex
CREATE INDEX "FixedAssetDepreciation_assetId_idx" ON "FixedAssetDepreciation"("assetId");

-- CreateIndex
CREATE INDEX "FixedAssetDepreciation_tenantId_idx" ON "FixedAssetDepreciation"("tenantId");

-- CreateIndex
CREATE INDEX "TenantInvite_tenantId_idx" ON "TenantInvite"("tenantId");

-- CreateIndex
CREATE INDEX "TenantInvite_email_idx" ON "TenantInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TenantInvite_tenantId_email_key" ON "TenantInvite"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_toCurrency_date_key" ON "ExchangeRate"("baseCurrency", "toCurrency", "date");

-- CreateIndex
CREATE INDEX "AccountSubType_tenantId_typeId_idx" ON "AccountSubType"("tenantId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_tenantId_accountId_yearMonth_key" ON "AccountBalance"("tenantId", "accountId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_tenantId_accountId_key" ON "OpeningBalance"("tenantId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_tenantId_name_key" ON "Class"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenantId_name_key" ON "Location"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Project_tenantId_status_idx" ON "Project"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Timesheet_tenantId_employeeId_idx" ON "Timesheet"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_timesheetId_idx" ON "TimeEntry"("timesheetId");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_tenantId_idx" ON "TimeEntry"("tenantId");

-- CreateIndex
CREATE INDEX "TimesheetApproval_timesheetId_idx" ON "TimesheetApproval"("timesheetId");

-- CreateIndex
CREATE INDEX "TimesheetApproval_tenantId_idx" ON "TimesheetApproval"("tenantId");

-- CreateIndex
CREATE INDEX "Budget_tenantId_fiscalYear_idx" ON "Budget"("tenantId", "fiscalYear");

-- CreateIndex
CREATE INDEX "BudgetLine_budgetId_idx" ON "BudgetLine"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetLine_accountId_idx" ON "BudgetLine"("accountId");

-- CreateIndex
CREATE INDEX "BudgetLine_tenantId_idx" ON "BudgetLine"("tenantId");

-- CreateIndex
CREATE INDEX "AccountingPeriod_tenantId_startDate_idx" ON "AccountingPeriod"("tenantId", "startDate");

-- CreateIndex
CREATE INDEX "Reversal_tenantId_idx" ON "Reversal"("tenantId");

-- CreateIndex
CREATE INDEX "FinancialStatementSnapshot_tenantId_type_period_idx" ON "FinancialStatementSnapshot"("tenantId", "type", "period");

-- CreateIndex
CREATE INDEX "BankReconciliation_tenantId_bankAccountId_statementDate_idx" ON "BankReconciliation"("tenantId", "bankAccountId", "statementDate");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_tenantId_bankReconciliationId_idx" ON "BankReconciliationLine"("tenantId", "bankReconciliationId");

-- CreateIndex
CREATE INDEX "ContactAddress_tenantId_contactId_idx" ON "ContactAddress"("tenantId", "contactId");

-- CreateIndex
CREATE INDEX "ContactCustomField_tenantId_contactId_idx" ON "ContactCustomField"("tenantId", "contactId");

-- CreateIndex
CREATE INDEX "Account_tenantId_name_idx" ON "Account"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_tenantId_code_key" ON "Account"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntry_tenantId_date_idx" ON "JournalEntry"("tenantId", "date");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalId_idx" ON "JournalEntryLine"("journalId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_idx" ON "JournalEntryLine"("tenantId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_accountId_idx" ON "JournalEntryLine"("tenantId", "accountId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_accountId_journalId_idx" ON "JournalEntryLine"("tenantId", "accountId", "journalId");

-- CreateIndex
CREATE INDEX "ContactEmail_contactId_idx" ON "ContactEmail"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEmail_contactId_email_key" ON "ContactEmail"("contactId", "email");

-- CreateIndex
CREATE INDEX "ContactPhone_contactId_idx" ON "ContactPhone"("contactId");

-- CreateIndex
CREATE INDEX "InventoryCostLayer_tenantId_itemId_idx" ON "InventoryCostLayer"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "StockLocation_tenantId_name_idx" ON "StockLocation"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_id_key" ON "Employee"("tenantId", "id");

-- CreateIndex
CREATE INDEX "PaySchedule_tenantId_idx" ON "PaySchedule"("tenantId");

-- CreateIndex
CREATE INDEX "PayrollRun_tenantId_status_idx" ON "PayrollRun"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PayrollRunEmployee_tenantId_idx" ON "PayrollRunEmployee"("tenantId");

-- CreateIndex
CREATE INDEX "PayrollRunEmployee_employeeId_idx" ON "PayrollRunEmployee"("employeeId");

-- CreateIndex
CREATE INDEX "Paycheck_tenantId_employeeId_idx" ON "Paycheck"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "PaycheckLine_paycheckId_idx" ON "PaycheckLine"("paycheckId");

-- CreateIndex
CREATE INDEX "PaycheckLine_tenantId_idx" ON "PaycheckLine"("tenantId");

-- CreateIndex
CREATE INDEX "PaycheckTax_paycheckId_idx" ON "PaycheckTax"("paycheckId");

-- CreateIndex
CREATE INDEX "PaycheckTax_tenantId_idx" ON "PaycheckTax"("tenantId");

-- CreateIndex
CREATE INDEX "StockLevel_tenantId_itemId_idx" ON "StockLevel"("tenantId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_tenantId_itemId_stockLocationId_key" ON "StockLevel"("tenantId", "itemId", "stockLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_tenantId_transactionNumber_idx" ON "InventoryTransaction"("tenantId", "transactionNumber");

-- CreateIndex
CREATE INDEX "InventoryTransaction_tenantId_createdAt_idx" ON "InventoryTransaction"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryTransaction_journalEntryId_idx" ON "InventoryTransaction"("journalEntryId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_tenantId_itemId_idx" ON "InventoryTransactionLine"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_tenantId_transactionId_idx" ON "InventoryTransactionLine"("tenantId", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_country_region_code_key" ON "TaxJurisdiction"("country", "region", "code");

-- CreateIndex
CREATE INDEX "TaxRate_tenantId_jurisdiction_effectiveFrom_idx" ON "TaxRate"("tenantId", "jurisdiction", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_tenantId_code_key" ON "TaxCode"("tenantId", "code");

-- CreateIndex
CREATE INDEX "TaxCodeRate_taxCodeId_taxRateId_idx" ON "TaxCodeRate"("taxCodeId", "taxRateId");

-- CreateIndex
CREATE INDEX "TaxCodeRate_tenantId_taxCodeId_idx" ON "TaxCodeRate"("tenantId", "taxCodeId");

-- CreateIndex
CREATE INDEX "LineTax_tenantId_invoiceLineId_billLineId_idx" ON "LineTax"("tenantId", "invoiceLineId", "billLineId");

-- CreateIndex
CREATE INDEX "LineTax_tenantId_purchaseOrderLineId_idx" ON "LineTax"("tenantId", "purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_idx" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_key" ON "TaxCodeAccount"("tenantId", "taxCodeId", "accountId");

-- CreateIndex
CREATE INDEX "Role_tenantId_name_idx" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Approval_tenantId_entityType_entityId_idx" ON "Approval"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Revaluation_tenantId_period_idx" ON "Revaluation"("tenantId", "period");

-- CreateIndex
CREATE INDEX "Attachment_tenantId_entityType_idx" ON "Attachment"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_issuedAt_idx" ON "Invoice"("tenantId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_customerId_status_idx" ON "Invoice"("tenantId", "customerId", "status");

-- CreateIndex
CREATE INDEX "RecurringInvoice_tenantId_nextRun_idx" ON "RecurringInvoice"("tenantId", "nextRun");

-- CreateIndex
CREATE INDEX "InvoiceLine_tenantId_idx" ON "InvoiceLine"("tenantId");

-- CreateIndex
CREATE INDEX "InvoiceLine_tenantId_itemId_idx" ON "InvoiceLine"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "InvoiceLine_tenantId_invoiceId_idx" ON "InvoiceLine"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "PaymentReceived_tenantId_paymentDate_idx" ON "PaymentReceived"("tenantId", "paymentDate");

-- CreateIndex
CREATE INDEX "PaymentReceived_journalEntryId_idx" ON "PaymentReceived"("journalEntryId");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_tenantId_invoiceId_idx" ON "InvoicePaymentApplication"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_tenantId_paymentId_idx" ON "InvoicePaymentApplication"("tenantId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoicePaymentApplication_invoiceId_paymentId_key" ON "InvoicePaymentApplication"("invoiceId", "paymentId");

-- CreateIndex
CREATE INDEX "BankTransaction_tenantId_idx" ON "BankTransaction"("tenantId");

-- CreateIndex
CREATE INDEX "BankTransaction_tenantId_date_idx" ON "BankTransaction"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Bill_tenantId_status_idx" ON "Bill"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Bill_tenantId_vendorId_idx" ON "Bill"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "Bill_tenantId_vendorId_status_idx" ON "Bill"("tenantId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "Bill_companyId_idx" ON "Bill"("companyId");

-- CreateIndex
CREATE INDEX "Bill_tenantId_issuedAt_idx" ON "Bill"("tenantId", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_tenantId_billNumber_key" ON "Bill"("tenantId", "billNumber");

-- CreateIndex
CREATE INDEX "BillLine_billId_idx" ON "BillLine"("billId");

-- CreateIndex
CREATE INDEX "BillLine_tenantId_idx" ON "BillLine"("tenantId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_status_idx" ON "PurchaseOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_vendorId_idx" ON "PurchaseOrder"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_tenantId_poNumber_key" ON "PurchaseOrder"("tenantId", "poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_tenantId_idx" ON "PurchaseOrderLine"("tenantId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_purchaseOrderId_idx" ON "PurchaseOrderLine"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "VendorCredit_tenantId_status_idx" ON "VendorCredit"("tenantId", "status");

-- CreateIndex
CREATE INDEX "VendorCredit_tenantId_vendorId_idx" ON "VendorCredit"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_idx" ON "VendorCredit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCredit_tenantId_creditNumber_key" ON "VendorCredit"("tenantId", "creditNumber");

-- CreateIndex
CREATE INDEX "CustomerCredit_tenantId_status_idx" ON "CustomerCredit"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CustomerCredit_tenantId_customerId_idx" ON "CustomerCredit"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerCredit_companyId_idx" ON "CustomerCredit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCredit_tenantId_creditNumber_key" ON "CustomerCredit"("tenantId", "creditNumber");

-- CreateIndex
CREATE INDEX "CustomerCreditLine_customerCreditId_idx" ON "CustomerCreditLine"("customerCreditId");

-- CreateIndex
CREATE INDEX "CustomerCreditLine_tenantId_idx" ON "CustomerCreditLine"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerCreditApplication_tenantId_creditId_idx" ON "CustomerCreditApplication"("tenantId", "creditId");

-- CreateIndex
CREATE INDEX "CustomerCreditApplication_tenantId_invoiceId_idx" ON "CustomerCreditApplication"("tenantId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCreditApplication_creditId_invoiceId_key" ON "CustomerCreditApplication"("creditId", "invoiceId");

-- CreateIndex
CREATE INDEX "VendorCreditLine_vendorCreditId_idx" ON "VendorCreditLine"("vendorCreditId");

-- CreateIndex
CREATE INDEX "VendorCreditLine_tenantId_idx" ON "VendorCreditLine"("tenantId");

-- CreateIndex
CREATE INDEX "BillPayment_tenantId_billId_idx" ON "BillPayment"("tenantId", "billId");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_billId_idx" ON "BillPayment"("companyId", "billId");

-- CreateIndex
CREATE INDEX "BillPayment_journalEntryId_idx" ON "BillPayment"("journalEntryId");

-- CreateIndex
CREATE INDEX "BillPaymentApplication_tenantId_billId_idx" ON "BillPaymentApplication"("tenantId", "billId");

-- CreateIndex
CREATE INDEX "BillPaymentApplication_tenantId_paymentId_idx" ON "BillPaymentApplication"("tenantId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "BillPaymentApplication_billId_paymentId_key" ON "BillPaymentApplication"("billId", "paymentId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_tenantId_vendorId_idx" ON "VendorPaymentMethod"("tenantId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_companyId_vendorId_idx" ON "VendorPaymentMethod"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "EventLog_tenantId_type_createdAt_idx" ON "EventLog"("tenantId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "JobAttempt_jobId_status_idx" ON "JobAttempt"("jobId", "status");

-- CreateIndex
CREATE INDEX "DeadLetter_jobId_idx" ON "DeadLetter"("jobId");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_tenantId_status_nextRetryAt_idx" ON "SearchIndexingQueue"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "SearchIndexedDoc_tenantId_indexName_indexedAt_idx" ON "SearchIndexedDoc"("tenantId", "indexName", "indexedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingInvoice_invoiceNumber_key" ON "TenantBillingInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "TenantBillingInvoice_tenantId_status_idx" ON "TenantBillingInvoice"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBillingUsage_tenantId_period_key" ON "TenantBillingUsage"("tenantId", "period");

-- CreateIndex
CREATE INDEX "DsrExportRequest_tenantId_status_idx" ON "DsrExportRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ConsentRecord_tenantId_userId_consentType_idx" ON "ConsentRecord"("tenantId", "userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_nextRetryAt_idx" ON "OutboxEvent"("tenantId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "ApiRateLimit_tenantId_apiKeyId_windowStart_idx" ON "ApiRateLimit"("tenantId", "apiKeyId", "windowStart");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSecurityEvent" ADD CONSTRAINT "UserSecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FixedAssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_assetAccountId_fkey" FOREIGN KEY ("assetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_accumulatedDepreciationId_fkey" FOREIGN KEY ("accumulatedDepreciationId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSubType" ADD CONSTRAINT "AccountSubType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reversal" ADD CONSTRAINT "Reversal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialStatementSnapshot" ADD CONSTRAINT "FinancialStatementSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_bankReconciliationId_fkey" FOREIGN KEY ("bankReconciliationId") REFERENCES "BankReconciliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "BankTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactCustomField" ADD CONSTRAINT "ContactCustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accountSubTypeId_fkey" FOREIGN KEY ("accountSubTypeId") REFERENCES "AccountSubType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactEmail" ADD CONSTRAINT "ContactEmail_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPhone" ADD CONSTRAINT "ContactPhone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_inventoryTxLineId_fkey" FOREIGN KEY ("inventoryTxLineId") REFERENCES "InventoryTransactionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaySchedule" ADD CONSTRAINT "PaySchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_payScheduleId_fkey" FOREIGN KEY ("payScheduleId") REFERENCES "PaySchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckLine" ADD CONSTRAINT "PaycheckLine_paycheckId_fkey" FOREIGN KEY ("paycheckId") REFERENCES "Paycheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckLine" ADD CONSTRAINT "PaycheckLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckTax" ADD CONSTRAINT "PaycheckTax_paycheckId_fkey" FOREIGN KEY ("paycheckId") REFERENCES "Paycheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckTax" ADD CONSTRAINT "PaycheckTax_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "StockLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "StockLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCode" ADD CONSTRAINT "TaxCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "InvoiceLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_billLineId_fkey" FOREIGN KEY ("billLineId") REFERENCES "BillLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "PurchaseOrderLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revaluation" ADD CONSTRAINT "Revaluation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceived"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_customerCreditId_fkey" FOREIGN KEY ("customerCreditId") REFERENCES "CustomerCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditApplication" ADD CONSTRAINT "CustomerCreditApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditApplication" ADD CONSTRAINT "CustomerCreditApplication_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "CustomerCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditApplication" ADD CONSTRAINT "CustomerCreditApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "VendorCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_vendorPaymentMethodId_fkey" FOREIGN KEY ("vendorPaymentMethodId") REFERENCES "VendorPaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

