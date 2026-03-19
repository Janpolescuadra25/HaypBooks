-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "AccountCategory" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CONTRA_ASSET', 'CONTRA_REVENUE', 'CONTRA_EXPENSE', 'TEMPORARY_EQUITY');

-- CreateEnum
CREATE TYPE "FeatureScope" AS ENUM ('COMPANY', 'PRACTICE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "NormalSide" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "CashFlowSection" AS ENUM ('OPERATING', 'INVESTING', 'FINANCING');

-- CreateEnum
CREATE TYPE "CountryCode" AS ENUM ('PH', 'US', 'IN', 'AU', 'CA', 'GB', 'SG', 'MY');

-- CreateEnum
CREATE TYPE "WithholdingTaxType" AS ENUM ('EWT_1_PERCENT', 'EWT_2_PERCENT', 'EWT_5_PERCENT', 'EWT_10_PERCENT');

-- CreateEnum
CREATE TYPE "FinalTaxType" AS ENUM ('FINAL_TAX_1_PERCENT', 'FINAL_TAX_5_PERCENT');

-- CreateEnum
CREATE TYPE "PercentageTaxType" AS ENUM ('TAX_3_PERCENT');

-- CreateEnum
CREATE TYPE "PhilippinePayrollDeductionType" AS ENUM ('SSS_EMPLOYEE', 'SSS_EMPLOYER', 'PHILHEALTH_EMPLOYEE', 'PHILHEALTH_EMPLOYER', 'PAGIBIG_EMPLOYEE', 'PAGIBIG_EMPLOYER', 'WITHHOLDING_TAX', 'THIRTEENTH_MONTH');

-- CreateEnum
CREATE TYPE "LocalTaxType" AS ENUM ('MAYORS_PERMIT', 'BARANGAY_CLEARANCE', 'REAL_PROPERTY_TAX', 'COMMUNITY_TAX_CERTIFICATE', 'BUSINESS_TAX');

-- CreateEnum
CREATE TYPE "BirFormType" AS ENUM ('FORM_2550Q', 'FORM_2550M', 'FORM_2307', 'FORM_2316', 'FORM_1601CQ', 'FORM_1604CF');

-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('DRAFT', 'READY', 'FILED', 'VOID');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "RefundApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChargebackStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "RelatedPartyRelationshipType" AS ENUM ('PARENT', 'SUBSIDIARY', 'SISTER', 'JOINT_VENTURE');

-- CreateEnum
CREATE TYPE "TaxProvisionStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED');

-- CreateEnum
CREATE TYPE "TaxOptimizationSuggestionType" AS ENUM ('TAX_TREATY', 'DEDUCTION', 'CREDIT', 'STRUCTURING');

-- CreateEnum
CREATE TYPE "TaxOptimizationStatus" AS ENUM ('PENDING', 'IMPLEMENTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaxAuthorityCommunicationType" AS ENUM ('QUERY', 'RESPONSE', 'NOTICE', 'AUDIT');

-- CreateEnum
CREATE TYPE "TaxAuthorityCommunicationStatus" AS ENUM ('DRAFT', 'SENT', 'RECEIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaxObligationStatus" AS ENUM ('PENDING', 'DUE', 'FILED', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "TaxAuditStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaxAttributeType" AS ENUM ('TAX_CREDIT', 'LOSS');

-- CreateEnum
CREATE TYPE "TaxAttributeStatus" AS ENUM ('ACTIVE', 'UTILIZED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransferPricingDocumentType" AS ENUM ('LOCAL_FILE', 'MASTER_FILE', 'CBC_REPORT', 'APA', 'STUDY');

-- CreateEnum
CREATE TYPE "GlobalTaxType" AS ENUM ('CORPORATE_INCOME_TAX', 'CAPITAL_GAINS_TAX', 'DIVIDEND_WITHHOLDING_TAX', 'INTEREST_WITHHOLDING_TAX', 'ROYALTY_WITHHOLDING_TAX', 'DIGITAL_SERVICES_TAX', 'ENVIRONMENTAL_TAX', 'PROPERTY_TAX', 'STAMP_DUTY', 'IMPORT_DUTY', 'EXCISE_TAX');

-- CreateEnum
CREATE TYPE "DeferredTaxType" AS ENUM ('ASSET', 'LIABILITY');

-- CreateEnum
CREATE TYPE "InventoryAdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LocalTaxObligationStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "BankReconciliationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'VOID');

-- CreateEnum
CREATE TYPE "BankDepositStatus" AS ENUM ('DRAFT', 'POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "UndepositedFundsBatchStatus" AS ENUM ('PENDING', 'DEPOSITED', 'VOID');

-- CreateEnum
CREATE TYPE "DunningRunStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DunningNoticeStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentReminderStatus" AS ENUM ('PENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "Form1099Status" AS ENUM ('DRAFT', 'FILED', 'VOID');

-- CreateEnum
CREATE TYPE "IntercompanyTransactionStatus" AS ENUM ('DRAFT', 'POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('BANK', 'PAYROLL', 'POS', 'INVENTORY', 'CRM', 'ERP', 'ECOMMERCE', 'BIR_API', 'CUSTOM');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "IntegrationActionStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "ExternalEntitySyncStatus" AS ENUM ('PENDING', 'SYNCED', 'ERROR');

-- CreateEnum
CREATE TYPE "IntegrationConflictResolution" AS ENUM ('LOCAL_WIN', 'EXTERNAL_WIN', 'MANUAL');

-- CreateEnum
CREATE TYPE "SyncJobType" AS ENUM ('FULL_SYNC', 'DELTA_SYNC', 'ENTITY_SYNC');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "SystemHealthState" AS ENUM ('OK', 'DEGRADED', 'FAIL');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('OPEN', 'PARTIAL_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurringInvoiceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurringScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurringExecutionStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ArchiveJobStatus" AS ENUM ('PLANNED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TaxAuthorityJurisdictionType" AS ENUM ('FEDERAL', 'STATE', 'LOCAL', 'MUNICIPAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "TaxFilingMethod" AS ENUM ('ONLINE', 'EFPS', 'MANUAL', 'API');

-- CreateEnum
CREATE TYPE "ControlSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReconciliationExceptionStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReconciliationExceptionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SubsidiaryLedgerType" AS ENUM ('AR', 'AP', 'INVENTORY');

-- CreateEnum
CREATE TYPE "CashFlowScenario" AS ENUM ('BASE', 'OPTIMISTIC', 'PESSIMISTIC');

-- CreateEnum
CREATE TYPE "CashFlowForecastItemCategory" AS ENUM ('AR_COLLECTION', 'AP_PAYMENT', 'SALES', 'EXPENSE');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AccountingStandard" AS ENUM ('IFRS', 'US_GAAP', 'LOCAL_GAAP', 'TAX_BASIS', 'CASH_BASIS');

-- CreateEnum
CREATE TYPE "PreferredHub" AS ENUM ('OWNER', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('RESET', 'VERIFY_EMAIL', 'MFA');

-- CreateEnum
CREATE TYPE "FirmDataType" AS ENUM ('INTERNAL_NOTE', 'AUTOMATION_RULE', 'AI_TEMPLATE', 'DASHBOARD_CONFIG');

-- CreateEnum
CREATE TYPE "FirmRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('INVITED', 'PENDING', 'ACCEPTED', 'REVOKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('STRAIGHT_LINE');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('OWNER', 'PRACTICE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM ('SCHEDULED', 'EVENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "WorkflowActionType" AS ENUM ('CREATE_TASK', 'SEND_NOTIFICATION', 'UPDATE_STATUS', 'RUN_WEBHOOK');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "WorkflowStepStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AiInsightStatus" AS ENUM ('ACTIVE', 'IN_REVIEW', 'ACTION_PLANNED', 'IMPLEMENTED', 'RESOLVED', 'DISMISSED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "AiInsightType" AS ENUM ('CASH_FLOW_RISK', 'TAX_OPTIMIZATION', 'FRAUD_DETECTION', 'ANOMALY_DETECTION', 'FORECAST_DEVIATION', 'COMPLIANCE_RISK', 'CUSTOMER_BEHAVIOR', 'VENDOR_RISK', 'EMPLOYEE_EXPENSE', 'REVENUE_LEAKAGE', 'INVENTORY_OPTIMIZATION', 'CURRENCY_RISK', 'INTEREST_RATE_RISK', 'CREDIT_RISK', 'OPERATIONAL_EFFICIENCY', 'FINANCIAL_HEALTH', 'BENCHMARK_COMPARISON', 'SCENARIO_ANALYSIS', 'WHAT_IF_ANALYSIS', 'PATTERN_RECOGNITION');

-- CreateEnum
CREATE TYPE "AiInsightSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AiModelType" AS ENUM ('TAX_OPTIMIZATION', 'FRAUD_DETECTION', 'CASH_FLOW_FORECAST', 'REVENUE_PREDICTION', 'CUSTOMER_CHURN', 'VENDOR_RISK', 'ANOMALY_DETECTION', 'SENTIMENT_ANALYSIS', 'DOCUMENT_CLASSIFICATION', 'NATURAL_LANGUAGE', 'RECOMMENDATION', 'CLUSTERING', 'REGRESSION', 'CLASSIFICATION', 'TIME_SERIES');

-- CreateEnum
CREATE TYPE "AiModelStatus" AS ENUM ('DRAFT', 'TRAINING', 'TRAINED', 'VALIDATING', 'VALIDATED', 'DEPLOYED', 'ARCHIVED', 'ERROR');

-- CreateEnum
CREATE TYPE "AiRunType" AS ENUM ('TRAINING', 'VALIDATION', 'PREDICTION', 'BATCH_PREDICTION', 'FEATURE_EXTRACTION', 'MODEL_EVALUATION', 'HYPERPARAMETER_TUNING');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "FeatureDataType" AS ENUM ('NUMERIC', 'CATEGORICAL', 'BOOLEAN', 'TEXT', 'DATETIME', 'ARRAY', 'OBJECT');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('REVENUE', 'EXPENSE', 'CASH_FLOW', 'TAX_LIABILITY', 'CUSTOMER_PAYMENT', 'VENDOR_PAYMENT', 'INVENTORY_DEMAND', 'EMPLOYEE_TURNOVER', 'CREDIT_RISK', 'MARKET_TREND', 'CURRENCY_EXCHANGE', 'INTEREST_RATE', 'STOCK_PRICE', 'CUSTOMER_CHURN', 'SALES_VOLUME');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiAgentType" AS ENUM ('TAX_OPTIMIZER', 'CASH_FLOW_MANAGER', 'FRAUD_DETECTOR', 'COLLECTIONS_AGENT', 'VENDOR_NEGOTIATOR', 'INVENTORY_OPTIMIZER', 'COMPLIANCE_MONITOR', 'REPORT_GENERATOR', 'DATA_CLEANER', 'PREDICTIVE_ANALYST', 'RECOMMENDATION_ENGINE', 'CONVERSATIONAL_AGENT');

-- CreateEnum
CREATE TYPE "AiAgentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED', 'ERROR');

-- CreateEnum
CREATE TYPE "AiAgentTaskStatus" AS ENUM ('PENDING', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiChatSessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "AiChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'FUNCTION');

-- CreateEnum
CREATE TYPE "AiGovernanceRuleType" AS ENUM ('BIAS_DETECTION', 'DATA_QUALITY', 'MODEL_DRIFT', 'PERFORMANCE_DEGRADATION', 'ETHICAL_COMPLIANCE', 'REGULATORY_COMPLIANCE', 'SECURITY', 'PRIVACY', 'COST_CONTROL', 'EXPLAINABILITY', 'TRANSPARENCY');

-- CreateEnum
CREATE TYPE "AiGovernanceSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AiAuditActionType" AS ENUM ('MODEL_TRAINED', 'MODEL_DEPLOYED', 'PREDICTION_MADE', 'INSIGHT_GENERATED', 'AGENT_ACTION', 'QUERY_EXECUTED', 'DATA_ACCESSED', 'CONFIG_CHANGED', 'RULE_TRIGGERED', 'ERROR_OCCURRED');

-- CreateEnum
CREATE TYPE "AiAuditActorType" AS ENUM ('USER', 'SYSTEM', 'AI_AGENT', 'EXTERNAL_SYSTEM');

-- CreateEnum
CREATE TYPE "PettyCashStatus" AS ENUM ('ACTIVE', 'CLOSED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('DRAFT', 'PRINTED', 'ISSUED', 'CANCELLED', 'VOID', 'STOPPED', 'CLEARED');

-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'APPLIED', 'VOID');

-- CreateEnum
CREATE TYPE "DebitNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'APPLIED', 'VOID');

-- CreateEnum
CREATE TYPE "DocumentApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimeOffType" AS ENUM ('VACATION', 'SICK', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "TimeOffRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GovernmentContributionType" AS ENUM ('SSS', 'PHILHEALTH', 'PAGIBIG', 'WITHHOLDING_TAX');

-- CreateEnum
CREATE TYPE "AssetDisposalMethod" AS ENUM ('SALE', 'SCRAP', 'DONATION', 'WRITE_OFF');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CASH', 'CREDIT', 'ADVANCE');

-- CreateEnum
CREATE TYPE "PayrollFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "VatCategory" AS ENUM ('VAT', 'NON_VAT', 'ZERO_RATED', 'EXEMPT');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'IDLE', 'UNDER_MAINTENANCE', 'DISPOSED', 'SOLD');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'CHECK', 'CARD', 'BANK', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectPhase" AS ENUM ('PLANNING', 'DESIGN', 'PRE_CONSTRUCTION', 'PROCUREMENT', 'CONSTRUCTION', 'POST_CONSTRUCTION', 'CLOSEOUT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ChangeOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'VOID');

-- CreateEnum
CREATE TYPE "LienStatus" AS ENUM ('PENDING', 'FILED', 'RELEASED', 'VOID');

-- CreateEnum
CREATE TYPE "RetentionStatus" AS ENUM ('WITHHELD', 'DUE', 'RELEASED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'AWARDED', 'ACTIVE', 'COMPLETED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DonorTier" AS ENUM ('INDIVIDUAL', 'CORPORATE', 'FOUNDATION', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RevenueRecognitionPhaseStatus" AS ENUM ('PENDING', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VarianceType" AS ENUM ('PURCHASE_PRICE', 'LABOR', 'MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LandedCostStatus" AS ENUM ('PENDING', 'POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "LandedCostLineType" AS ENUM ('FREIGHT', 'DUTY', 'BROKERAGE', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'POSTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('REFUND', 'WRITEOFF');

-- CreateEnum
CREATE TYPE "PostingModule" AS ENUM ('JOURNAL_ENTRY', 'INVOICE', 'BILL', 'BANK_DEPOSIT', 'INVENTORY', 'PAYROLL');

-- CreateEnum
CREATE TYPE "BudgetScenario" AS ENUM ('ACTUAL', 'BUDGET', 'FORECAST', 'WHAT_IF');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'APPROVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('INVOICE', 'QUOTE', 'CREDIT_NOTE', 'PURCHASE_ORDER', 'VENDOR_CREDIT', 'STATEMENT', 'DEPOSIT_SLIP');

-- CreateEnum
CREATE TYPE "SubledgerType" AS ENUM ('BANK', 'AR', 'AP', 'INVENTORY', 'PAYROLL', 'OTHER');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EstimateType" AS ENUM ('BAD_DEBT', 'INVENTORY_OBSOLESCENCE', 'USEFUL_LIFE', 'DEFERRED_TAX', 'OTHER');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'ARCHIVED');

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
    "preferredHub" "PreferredHub",
    "phone" TEXT,
    "phone_hmac" TEXT,
    "isphoneverified" BOOLEAN NOT NULL DEFAULT false,
    "phoneverifiedat" TIMESTAMP(3),
    "auditReviewer" BOOLEAN NOT NULL DEFAULT false,

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
    "email" VARCHAR(320),
    "phone" VARCHAR(32),
    "otpCode" VARCHAR(16) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'RESET',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSecurityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "step" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" "CountryCode" NOT NULL,
    "name" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultTaxYear" INTEGER,
    "taxSystem" JSONB,
    "defaultWithholdingRates" JSONB,
    "defaultVatRate" DECIMAL(10,6),
    "defaultCorporateTaxRate" DECIMAL(10,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" TEXT,
    "preferredLanguage" TEXT,
    "timeZone" TEXT,
    "dateFormat" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryTaxModule" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountryTaxModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nexus" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateCode" TEXT,
    "city" TEXT,
    "nexusType" TEXT NOT NULL,
    "establishedDate" TIMESTAMP(3) NOT NULL,
    "terminatedDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nexus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedParty" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relatedCompanyId" TEXT NOT NULL,
    "relationshipType" "RelatedPartyRelationshipType" NOT NULL,
    "ownershipPercentage" DECIMAL(5,2),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatedParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTreaty" (
    "id" TEXT NOT NULL,
    "countryFromId" TEXT NOT NULL,
    "countryToId" TEXT NOT NULL,
    "treatyName" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "withholdingRates" JSONB NOT NULL,
    "peRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxTreaty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxProvision" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "currentTax" DECIMAL(20,4) NOT NULL,
    "deferredTax" DECIMAL(20,4) NOT NULL,
    "totalTax" DECIMAL(20,4) NOT NULL,
    "effectiveTaxRate" DECIMAL(10,6) NOT NULL,
    "status" "TaxProvisionStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxProvision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL DEFAULT 'OWNER',
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "maxCompanies" INTEGER NOT NULL DEFAULT 0,
    "companiesCreated" INTEGER NOT NULL DEFAULT 0,
    "active_non_owner_users_count" INTEGER NOT NULL DEFAULT 0,
    "active_companies_count" INTEGER NOT NULL DEFAULT 0,
    "active_firm_count" INTEGER NOT NULL DEFAULT 0,
    "active_project_count" INTEGER NOT NULL DEFAULT 0,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servicesOffered" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_mode" TEXT NOT NULL DEFAULT 'full',
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceCapabilities" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companiesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "practicesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceCapabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" DECIMAL(65,30),
    "annualPrice" DECIMAL(65,30),
    "currency" TEXT,
    "maxCompanies" INTEGER,
    "maxClients" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "scope" "FeatureScope" NOT NULL DEFAULT 'COMPANY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("planId","featureId")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_mode" TEXT NOT NULL DEFAULT 'full',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reportingStandard" "AccountingStandard",
    "functionalCurrency" VARCHAR(3),
    "fiscalYearStart" INTEGER,
    "taxYearEnd" TIMESTAMP(3),
    "legalName" VARCHAR(200),
    "legalNameChangedAt" TIMESTAMP(3),
    "businessType" TEXT,
    "industry" TEXT,
    "address" TEXT,
    "country" VARCHAR(100),
    "startDate" TIMESTAMP(3),
    "taxId" VARCHAR(50),
    "taxIdChangedAt" TIMESTAMP(3),
    "logoUrl" TEXT,
    "invoicePrefix" TEXT,
    "vatNumberChangedAt" TIMESTAMP(3),
    "vatRegistered" BOOLEAN DEFAULT false,
    "vatRate" DECIMAL(5,2),
    "pricesInclusive" BOOLEAN DEFAULT false,
    "dstLiable" BOOLEAN NOT NULL DEFAULT false,
    "dstRegistrationNumber" TEXT,
    "euVatOneStopShop" BOOLEAN DEFAULT false,
    "euVatOssCountry" TEXT,
    "euVatOssNumber" TEXT,
    "euVatOssEffectiveDate" TIMESTAMP(3),
    "euVatIossNumber" TEXT,
    "defaultPaymentTerms" TEXT,
    "accountingMethod" TEXT DEFAULT 'ACCRUAL',
    "inventoryEnabled" BOOLEAN DEFAULT false,
    "payrollEnabled" BOOLEAN DEFAULT false,
    "auditTrailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastAuditReview" TIMESTAMP(3),
    "legacy_id" TEXT,
    "migratedAt" TIMESTAMP(3),
    "migrationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsolidationGroup" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "autoEliminateIntercompany" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsolidationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsolidationGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "ConsolidationGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingFirm" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingFirm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmData" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "type" "FirmDataType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirmData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFirmAccess" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "role" "FirmRole" NOT NULL,
    "status" "AccessStatus" NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "CompanyFirmAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingFirmSubscription" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "AccountingFirmSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUser" (
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("companyId","workspaceId","userId")
);

-- CreateTable
CREATE TABLE "PracticeUser" (
    "practiceId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PracticeUser_pkey" PRIMARY KEY ("practiceId","workspaceId","userId")
);

-- CreateTable
CREATE TABLE "IntercompanyTransaction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fromCompanyId" TEXT NOT NULL,
    "toCompanyId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT,
    "status" "IntercompanyTransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "fromJournalEntryId" TEXT,
    "toJournalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntercompanyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsolidationEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "journalEntryId" TEXT,
    "functionalCurrency" TEXT,
    "presentationCurrency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "translationMethod" TEXT,
    "translationAdjustment" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsolidationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAssetCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAsset" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "cost" DECIMAL(20,4) NOT NULL,
    "salvageValue" DECIMAL(20,4),
    "usefulLifeMonths" INTEGER,
    "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'STRAIGHT_LINE',
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "assetAccountId" TEXT,
    "accumulatedDepreciationId" TEXT,
    "depreciationExpenseAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAssetDepreciation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetDepreciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedAssetSchedule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDisposal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "disposalDate" TIMESTAMP(3) NOT NULL,
    "method" "AssetDisposalMethod" NOT NULL,
    "proceeds" DECIMAL(20,4),
    "gainLoss" DECIMAL(20,4),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDisposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetImpairment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "impairmentDate" TIMESTAMP(3) NOT NULL,
    "impairmentAmount" DECIMAL(20,4) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetImpairment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetRevaluation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "revaluationDate" TIMESTAMP(3) NOT NULL,
    "newValue" DECIMAL(20,4) NOT NULL,
    "revaluationAmount" DECIMAL(20,4) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetRevaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "description" TEXT,
    "cost" DECIMAL(20,4),
    "vendor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetInsurance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policyNumber" TEXT,
    "coverageAmount" DECIMAL(20,4),
    "premiumAmount" DECIMAL(20,4),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepreciationAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "expenseAccountId" TEXT NOT NULL,
    "accumAccountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepreciationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepreciationJournal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "journalEntryId" TEXT,
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "DepreciationJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "WorkspaceInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "roleId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "WorkspaceInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "remindAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRule" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "actionType" "WorkflowActionType" NOT NULL,
    "actionConfig" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'PENDING',
    "context" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRunStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" "WorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
    "output" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "WorkflowRunStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApproval" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "status" "DocumentApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "modelId" TEXT,
    "insightType" "AiInsightType" NOT NULL,
    "subType" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AiInsightSeverity" NOT NULL DEFAULT 'MEDIUM',
    "confidence" DECIMAL(5,2) NOT NULL,
    "impactScore" DECIMAL(10,2),
    "data" JSONB NOT NULL,
    "analysis" JSONB,
    "recommendations" JSONB,
    "predictedDate" TIMESTAMP(3),
    "predictedValue" DECIMAL(20,4),
    "sourceModel" TEXT,
    "sourceVersion" TEXT,
    "triggers" TEXT[],
    "status" "AiInsightStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedTo" TEXT,
    "actionTaken" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsightAttachment" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsightAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsightComment" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsightComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsightMetric" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(20,4),
    "unit" TEXT,
    "data" JSONB,

    CONSTRAINT "AiInsightMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModel" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelType" "AiModelType" NOT NULL,
    "version" TEXT NOT NULL,
    "status" "AiModelStatus" NOT NULL DEFAULT 'TRAINING',
    "config" JSONB NOT NULL,
    "features" TEXT[],
    "metrics" JSONB,
    "modelPath" TEXT,
    "checksum" TEXT,
    "trainedAt" TIMESTAMP(3),
    "trainedBy" TEXT,
    "trainingDataRangeStart" TIMESTAMP(3),
    "trainingDataRangeEnd" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelRun" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "runType" "AiRunType" NOT NULL,
    "status" "AiRunStatus" NOT NULL DEFAULT 'PENDING',
    "inputConfig" JSONB,
    "inputDataRef" TEXT,
    "output" JSONB,
    "metrics" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "resourceUsage" JSONB,
    "costEstimate" DECIMAL(10,2),
    "error" TEXT,
    "stackTrace" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiModelRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureStore" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataType" "FeatureDataType" NOT NULL,
    "category" TEXT,
    "value" JSONB,
    "historicalValues" JSONB,
    "sourceTable" TEXT,
    "sourceField" TEXT,
    "calculation" TEXT,
    "refreshFrequency" TEXT,
    "minValue" DECIMAL(20,4),
    "maxValue" DECIMAL(20,4),
    "avgValue" DECIMAL(20,4),
    "stdDev" DECIMAL(20,4),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRefreshedAt" TIMESTAMP(3),

    CONSTRAINT "FeatureStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureVector" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "features" JSONB NOT NULL,
    "predictionId" TEXT,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureVector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "predictionType" "PredictionType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "predictedValue" DECIMAL(20,4) NOT NULL,
    "lowerBound" DECIMAL(20,4),
    "upperBound" DECIMAL(20,4),
    "confidence" DECIMAL(5,2) NOT NULL,
    "actualValue" DECIMAL(20,4),
    "accuracy" DECIMAL(5,2),
    "modelId" TEXT,
    "modelVersion" TEXT,
    "features" JSONB,
    "status" "PredictionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAgent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "agentType" "AiAgentType" NOT NULL,
    "status" "AiAgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB NOT NULL,
    "capabilities" TEXT[],
    "modelId" TEXT,
    "modelConfig" JSONB,
    "successRate" DECIMAL(5,2),
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "failedTasks" INTEGER NOT NULL DEFAULT 0,
    "schedule" JSONB,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAgentTask" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" "AiAgentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "context" JSONB,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAgentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatSession" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT,
    "context" JSONB,
    "preferences" JSONB,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "status" "AiChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AiChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "queryType" TEXT,
    "entities" TEXT[],
    "dataSources" TEXT[],
    "confidence" DECIMAL(5,2),
    "tokenCount" INTEGER,
    "modelUsed" TEXT,
    "processingTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQueryLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "parsedQuery" JSONB,
    "sqlGenerated" TEXT,
    "dataSources" TEXT[],
    "resultCount" INTEGER,
    "processingTimeMs" INTEGER,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQueryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGovernanceRule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "AiGovernanceRuleType" NOT NULL,
    "scope" TEXT[],
    "condition" JSONB NOT NULL,
    "severity" "AiGovernanceSeverity" NOT NULL DEFAULT 'MEDIUM',
    "action" JSONB NOT NULL,
    "notificationChannels" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGovernanceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGovernanceTrigger" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" JSONB NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "actionsTaken" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGovernanceTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "actionType" "AiAuditActionType" NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "actorType" "AiAuditActorType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "details" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dimension" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionValue" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DimensionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityDimensionValue" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "dimensionValueId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityDimensionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataQualityScore" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "datasetType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "score" DECIMAL(5,2) NOT NULL,
    "issues" JSONB,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataQualityScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "balance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundAllocation" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "percentage" DECIMAL(5,2),

    CONSTRAINT "FundAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "fundId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "campaign" TEXT,
    "restriction" TEXT,
    "acknowledgmentSent" BOOLEAN NOT NULL DEFAULT false,
    "receiptNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "installmentFreq" TEXT NOT NULL,
    "amountPaid" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,

    CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyUnit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "marketRent" DECIMAL(20,4) NOT NULL,
    "currentLeaseId" TEXT,

    CONSTRAINT "PropertyUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentAmount" DECIMAL(20,4) NOT NULL,
    "securityDeposit" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRetention" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "retentionPercent" DECIMAL(5,2) NOT NULL,
    "totalWithheld" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "totalReleased" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractRetention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionEntry" (
    "id" TEXT NOT NULL,
    "retentionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "billId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RetentionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initialBalance" DECIMAL(20,4) NOT NULL,
    "currentBalance" DECIMAL(20,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "recipientEmail" TEXT,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pointsPerDollar" DECIMAL(10,2) NOT NULL,
    "redemptionRatio" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyAccount" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "currentTier" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyAccount_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "PaymentTerm" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDays" INTEGER NOT NULL,
    "discountDays" INTEGER,
    "discountPct" DECIMAL(5,2),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "ForeignCurrencyGainLoss" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "originalAmount" DECIMAL(20,4) NOT NULL,
    "originalCurrency" TEXT NOT NULL,
    "baseAmount" DECIMAL(20,4) NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(28,12) NOT NULL,
    "gainLoss" DECIMAL(20,4) NOT NULL,
    "realizedAt" TIMESTAMP(3),

    CONSTRAINT "ForeignCurrencyGainLoss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSubType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "AccountSubType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "balanceForeign" DECIMAL(20,4),

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalanceAudit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "oldBalance" DECIMAL(20,4) NOT NULL,
    "newBalance" DECIMAL(20,4) NOT NULL,
    "changeReason" TEXT NOT NULL,
    "referenceId" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBalanceAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "budgetAmount" DECIMAL(20,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLine" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionProject" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractNumber" TEXT,
    "contractType" TEXT,
    "contractAmount" DECIMAL(20,4) NOT NULL,
    "estimatedCost" DECIMAL(20,4),
    "actualCost" DECIMAL(20,4),
    "grossProfit" DECIMAL(20,4),
    "profitMargin" DECIMAL(10,6),
    "startDate" TIMESTAMP(3),
    "estimatedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "currentPhase" "ProjectPhase" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "projectManagerId" TEXT,
    "clientId" TEXT,
    "siteAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPhaseLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phase" "ProjectPhase" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(20,4),
    "actualCost" DECIMAL(20,4),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPhaseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "changeOrderNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT,
    "originalScope" TEXT,
    "changedScope" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "approvedAmount" DECIMAL(20,4),
    "status" "ChangeOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedDate" TIMESTAMP(3),
    "approvedDate" TIMESTAMP(3),
    "approvedById" TEXT,
    "impactSchedule" BOOLEAN NOT NULL DEFAULT false,
    "scheduleDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrderItem" (
    "id" TEXT NOT NULL,
    "changeOrderId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4),
    "unit" TEXT,
    "unitCost" DECIMAL(20,4),
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lien" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lienNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "claimant" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "propertyAddress" TEXT,
    "filedDate" TIMESTAMP(3),
    "releaseDate" TIMESTAMP(3),
    "status" "LienStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionSchedule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "billId" TEXT,
    "retentionPercent" DECIMAL(5,2) NOT NULL,
    "amountWithheld" DECIMAL(20,4) NOT NULL,
    "releasePercent" DECIMAL(5,2),
    "releaseAmount" DECIMAL(20,4),
    "dueDate" TIMESTAMP(3),
    "releasedDate" TIMESTAMP(3),
    "status" "RetentionStatus" NOT NULL DEFAULT 'WITHHELD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "description" TEXT,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "completionPct" DECIMAL(5,2),
    "budgetAllocated" DECIMAL(20,4),
    "actualCost" DECIMAL(20,4),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionCostCode" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionCostCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCodeAllocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "quantity" DECIMAL(12,4),
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostCodeAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "grantNumber" TEXT NOT NULL,
    "grantName" TEXT NOT NULL,
    "funderId" TEXT,
    "funderType" TEXT,
    "grantOfficer" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "awardAmount" DECIMAL(20,4) NOT NULL,
    "spentAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(20,4) NOT NULL,
    "status" "GrantStatus" NOT NULL DEFAULT 'DRAFT',
    "reportingPeriod" TEXT,
    "nextReportDue" TIMESTAMP(3),
    "complianceRules" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantBudget" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "budgetCode" TEXT,
    "description" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "spentAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrantBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantExpense" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "budgetId" TEXT,
    "transactionType" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrantExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantReport" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reportData" JSONB NOT NULL,
    "attachmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrantReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorManagement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "donorTier" "DonorTier" NOT NULL,
    "givingCapacity" DECIMAL(20,4),
    "firstGiftDate" TIMESTAMP(3),
    "lastGiftDate" TIMESTAMP(3),
    "totalGiven" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "lifetimeValue" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "preferredMethod" TEXT,
    "communicationPref" JSONB,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonorManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueRecognitionSchedule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "invoiceLineId" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "recognizedToDate" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "schedule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueRecognitionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueRecognitionPhase" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "percentage" DECIMAL(10,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "recognitionDate" TIMESTAMP(3) NOT NULL,
    "status" "RevenueRecognitionPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueRecognitionPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardCostVersion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "standardCost" DECIMAL(20,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardCostVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianceJournal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "VarianceType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "period" TEXT,
    "journalEntryId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VarianceJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandedCost" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "inventoryTxLineId" TEXT,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "status" "LandedCostStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandedCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandedCostLine" (
    "id" TEXT NOT NULL,
    "landedCostId" TEXT NOT NULL,
    "type" "LandedCostLineType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "description" TEXT,
    "allocatedToInventory" BOOLEAN NOT NULL DEFAULT true,
    "inventoryCostLayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandedCostLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "TimesheetApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT,
    "classId" TEXT,
    "month" INTEGER,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetVersion" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLineVersion" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "accountId" TEXT,
    "classId" TEXT,
    "month" INTEGER,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetLineVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRevaluationLine" (
    "id" TEXT NOT NULL,
    "revaluationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(20,4) NOT NULL,
    "credit" DECIMAL(20,4) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRevaluationLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingPeriod" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalThreshold" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "minAmount" DECIMAL(20,4),
    "maxAmount" DECIMAL(20,4),
    "approverCount" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingLock" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "module" "PostingModule" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostingLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reversal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "originalType" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "reversalEntry" TEXT NOT NULL,
    "reason" TEXT,
    "isAccountant" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reversal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialStatementSnapshot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialStatementSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRevaluation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalGainLoss" DECIMAL(20,4),
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRevaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRevaluationEntry" (
    "id" TEXT NOT NULL,
    "revaluationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "foreignBalance" DECIMAL(20,4) NOT NULL,
    "exchangeRate" DECIMAL(28,12) NOT NULL,
    "baseBalance" DECIMAL(20,4) NOT NULL,
    "unrealizedGainLoss" DECIMAL(20,4),

    CONSTRAINT "CurrencyRevaluationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlowCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" "CashFlowSection" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashFlowCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlowStatementSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashFlowStatementSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialStatementTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "countryCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialStatementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiDashboard" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "position" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialStatementLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "accountIds" TEXT[],
    "calculation" TEXT,
    "isTotal" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialStatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "prefix" TEXT,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "format" TEXT,
    "resetFrequency" TEXT,
    "lastUsed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosingEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journalEntryId" TEXT,

    CONSTRAINT "ClosingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearEndClose" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "retainedEarningsAccountId" TEXT,
    "incomeSummaryAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearEndClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquityAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "parValue" DECIMAL(20,4),
    "shares" DECIMAL(20,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquityAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dividend" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "declarationDate" TIMESTAMP(3) NOT NULL,
    "recordDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "amountPerShare" DECIMAL(20,4),
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dividend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTaxReturn" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "filedAt" TIMESTAMP(3),
    "totalTax" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollTaxReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTaxLiability" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollTaxLiability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTaxPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollTaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccrualSchedule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "offsetAccountId" TEXT,
    "description" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyAmount" DECIMAL(20,4) NOT NULL,
    "remainingAmount" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccrualSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccrualEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "journalEntryId" TEXT,
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "AccrualEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "statementDate" TIMESTAMP(3) NOT NULL,
    "closingBalance" DECIMAL(20,4) NOT NULL,
    "status" "BankReconciliationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliationLine" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "bankReconciliationId" TEXT NOT NULL,
    "bankTransactionId" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "matchType" TEXT NOT NULL DEFAULT 'MANUAL',
    "journalEntryLineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliationLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,

    CONSTRAINT "ContactCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AccountCategory",
    "normalSide" "NormalSide" NOT NULL DEFAULT 'DEBIT',

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSegment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "segmentName" TEXT NOT NULL,
    "segmentValue" TEXT NOT NULL,
    "parentAccountId" TEXT,
    "fundId" TEXT,

    CONSTRAINT "AccountSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "parentId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "cashFlowType" TEXT,
    "cashFlowCategoryId" TEXT,
    "normalSide" "NormalSide",
    "balance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountSubTypeId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entryNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(20,4),
    "deletedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "credit" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "costCenterId" TEXT,
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "paymentTermId" TEXT,
    "priceListId" TEXT,
    "creditLimit" DECIMAL(12,2),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "contactId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "paymentTermId" TEXT,
    "isNonResident" BOOLEAN NOT NULL DEFAULT false,
    "defaultWithholding" DECIMAL(5,2),

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "taxId" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorPayment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "billPaymentId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "method" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form1099" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "formType" TEXT NOT NULL DEFAULT '1099-NEC',
    "status" "Form1099Status" NOT NULL DEFAULT 'DRAFT',
    "filedAt" TIMESTAMP(3),
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Form1099_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form1099Box" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "boxNumber" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "Form1099Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "salesPrice" DECIMAL(20,4),
    "purchaseCost" DECIMAL(20,4),
    "standardCost" DECIMAL(20,4),
    "discountAllowed" BOOLEAN NOT NULL DEFAULT true,
    "maxDiscountPercent" DECIMAL(5,2),
    "trackingType" TEXT DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inventoryAssetAccountId" TEXT,
    "cogsAccountId" TEXT,
    "inventoryReserveAccountId" TEXT,
    "costMethod" TEXT DEFAULT 'FIFO',

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "PriceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCostLayer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
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
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "employeeNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "taxId" TEXT,
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
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "PayrollFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payScheduleId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRunEmployee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
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
    "companyId" TEXT NOT NULL,
    "payrollRunId" TEXT,
    "taxInfoId" TEXT,
    "i9FormId" TEXT,
    "employeeId" TEXT NOT NULL,
    "checkNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "grossAmount" DECIMAL(20,4) NOT NULL,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "templateId" TEXT,

    CONSTRAINT "Paycheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaycheckLine" (
    "id" TEXT NOT NULL,
    "paycheckId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "PaycheckLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaycheckTax" (
    "id" TEXT NOT NULL,
    "paycheckId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaycheckTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLoan" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "principalAmount" DECIMAL(20,4) NOT NULL,
    "interestRate" DECIMAL(10,6),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "balance" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLoanPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "interestAmount" DECIMAL(20,4),
    "principalAmount" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeLoanPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffBalance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "timeOffType" "TimeOffType" NOT NULL,
    "balance" DECIMAL(12,4) NOT NULL,
    "accrualRate" DECIMAL(12,6),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOffBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "timeOffType" "TimeOffType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(12,4),
    "status" "TimeOffRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approverId" TEXT,

    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThirteenthMonthPay" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThirteenthMonthPay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentContributionPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT,
    "contributionType" "GovernmentContributionType" NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernmentContributionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAccrual" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "accountId" TEXT,
    "status" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "transactionNumber" TEXT,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "purchaseOrderId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "journalEntryId" TEXT,
    "invoiceId" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransactionLine" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "transactionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "stockLocationId" TEXT,
    "qty" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6),
    "lineType" TEXT,
    "serialNumber" TEXT,
    "lotNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "InventoryTransactionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReserve" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT,
    "reserveType" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryReserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COGSRecognition" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceLineId" TEXT,
    "inventoryTxLineId" TEXT,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(28,6) NOT NULL,
    "unitCost" DECIMAL(28,6) NOT NULL,
    "totalCost" DECIMAL(20,4) NOT NULL,
    "journalEntryId" TEXT,
    "recognizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "COGSRecognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustmentRequest" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "transactionId" TEXT,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT,
    "status" "InventoryAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustmentApproval" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "InventoryAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustmentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyBuild" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "inventoryTxId" TEXT,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT "AssemblyBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyComponent" (
    "id" TEXT NOT NULL,
    "assemblyBuildId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityUsed" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "AssemblyComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "standardCost" DECIMAL(20,4),
    "actualCost" DECIMAL(20,4),
    "varianceAmount" DECIMAL(20,4),
    "varianceAccountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxJurisdiction" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxJurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAuthority" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "jurisdictionType" "TaxAuthorityJurisdictionType" NOT NULL,
    "contactInfo" JSONB,
    "filingMethods" "TaxFilingMethod"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxObligation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "TaxObligationStatus" NOT NULL DEFAULT 'PENDING',
    "filedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "taxReturnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAuditCase" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "taxReturnId" TEXT,
    "caseNumber" TEXT,
    "scope" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "status" "TaxAuditStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxAuditCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAuthorityCommunication" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "type" "TaxAuthorityCommunicationType" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "status" "TaxAuthorityCommunicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxAuthorityCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxOptimizationSuggestion" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "suggestionType" "TaxOptimizationSuggestionType" NOT NULL,
    "description" TEXT NOT NULL,
    "potentialSavings" DECIMAL(20,4) NOT NULL,
    "confidence" DECIMAL(5,2) NOT NULL,
    "status" "TaxOptimizationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxOptimizationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRiskScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "components" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReturn" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "philForm" "BirFormType",
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "filingDeadline" TIMESTAMP(3) NOT NULL,
    "status" "FilingStatus" NOT NULL DEFAULT 'DRAFT',
    "filedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "totalTax" DECIMAL(20,4) NOT NULL,
    "totalPenalty" DECIMAL(20,4),
    "totalInterest" DECIMAL(20,4),
    "paymentDeadline" TIMESTAMP(3),
    "referenceNumber" TEXT,
    "efilingReference" TEXT,
    "efilingStatus" TEXT,
    "efilingSubmittedAt" TIMESTAMP(3),
    "efilingResponse" JSONB,
    "attachmentId" TEXT,
    "filingMethod" "TaxFilingMethod",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReturnLine" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "taxRateId" TEXT,
    "jurisdictionId" TEXT,
    "taxableAmount" DECIMAL(20,4),
    "taxAmount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "TaxReturnLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxPayment" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "method" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReturnAmendment" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "amendmentNumber" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "filedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxReturnAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCalculationAudit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "rulesApplied" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedById" TEXT,

    CONSTRAINT "TaxCalculationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxPeriodLock" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedById" TEXT,
    "reason" TEXT,

    CONSTRAINT "TaxPeriodLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxFilingPackage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "documents" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "acknowledgementNumber" TEXT,

    CONSTRAINT "TaxFilingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithholdingTaxCertificate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "periodCovered" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "dateIssued" TIMESTAMP(3) NOT NULL,
    "dateReceived" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "WithholdingTaxCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCalendar" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "obligation" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaxCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActionAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "UserActionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxFilingBatch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "batchType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalForms" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxFilingBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDeadline" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderDays" INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ComplianceDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxClearanceCertificate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fileUrl" TEXT,

    CONSTRAINT "TaxClearanceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPermit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL,
    "permitType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "renewalDeadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fileUrl" TEXT,

    CONSTRAINT "BusinessPermit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAttributeCarryforward" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "surrenderedToCompanyId" TEXT,
    "countryId" TEXT,
    "jurisdictionId" TEXT,
    "attributeType" "TaxAttributeType" NOT NULL,
    "taxType" TEXT,
    "originPeriod" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "originalAmount" DECIMAL(20,4) NOT NULL,
    "remainingAmount" DECIMAL(20,4) NOT NULL,
    "surrenderedAmount" DECIMAL(20,4),
    "status" "TaxAttributeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxAttributeCarryforward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UncertainTaxPosition" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "probableAmount" DECIMAL(20,4) NOT NULL,
    "possibleRangeLow" DECIMAL(20,4),
    "possibleRangeHigh" DECIMAL(20,4),
    "recognitionStatus" TEXT NOT NULL,
    "taxAuthorityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UncertainTaxPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxIncentive" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "incentiveType" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "reducedRate" DECIMAL(10,6),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxIncentive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferPricingDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relatedPartyId" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "documentType" "TransferPricingDocumentType" NOT NULL,
    "fileUrl" TEXT,
    "armLengthTestResult" JSONB,
    "riskLevel" TEXT,
    "complianceStatus" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "referenceNumber" TEXT,
    "description" TEXT,
    "attachmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferPricingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvancePricingAgreement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taxAuthorityId" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "coveredTransactions" JSONB NOT NULL,
    "terms" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "renewalDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvancePricingAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeferredTax" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "temporaryDifference" DECIMAL(20,4) NOT NULL,
    "taxRate" DECIMAL(10,6) NOT NULL,
    "deferredAmount" DECIMAL(20,4) NOT NULL,
    "type" "DeferredTaxType" NOT NULL,
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "reversalPeriod" TEXT,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeferredTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRatio" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "ratioType" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "benchmark" DECIMAL(10,4),
    "industryAverage" DECIMAL(10,4),
    "trend" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EsgMetric" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DECIMAL(20,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT,
    "verification" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EsgMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT,
    "jurisdictionId" TEXT,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "jurisdictionLevel" TEXT,
    "taxType" TEXT,
    "globalTaxType" "GlobalTaxType",
    "thresholdAmount" DECIMAL(20,4),
    "exemptionAmount" DECIMAL(20,4),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isCompound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
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
    "companyId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "ratePct" DECIMAL(10,6) NOT NULL,

    CONSTRAINT "TaxCodeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineTax" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceLineId" TEXT,
    "billLineId" TEXT,
    "purchaseOrderLineId" TEXT,
    "quoteLineId" TEXT,
    "taxCodeId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "LineTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueSchedule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceLineId" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "recognizedAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "recognitionType" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCodeAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taxCodeId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "TaxCodeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTaxReturn" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "filedAt" TIMESTAMP(3),
    "totalTax" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filedById" TEXT,

    CONSTRAINT "SalesTaxReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTaxReturnLine" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "taxRateId" TEXT,
    "taxJurisdictionId" TEXT,
    "taxableAmount" DECIMAL(20,4),
    "taxAmount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "SalesTaxReturnLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTaxPayment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "returnId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesTaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entries" JSONB NOT NULL,

    CONSTRAINT "Revaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalTaxTypeConfig" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "taxType" "LocalTaxType" NOT NULL,
    "description" TEXT,
    "defaultRate" DECIMAL(10,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LocalTaxTypeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithholdingTaxDeduction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "deductionType" "WithholdingTaxType" NOT NULL,
    "accountId" TEXT,
    "rate" DECIMAL(10,6) NOT NULL,
    "jurisdictionId" TEXT,
    "jurisdictionText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithholdingTaxDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalTaxDeduction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "deductionType" "FinalTaxType" NOT NULL,
    "accountId" TEXT,
    "rate" DECIMAL(10,6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalTaxDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PercentageTax" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taxType" "PercentageTaxType" NOT NULL,
    "accountId" TEXT,
    "rate" DECIMAL(10,6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PercentageTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhilippinePayrollDeduction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deductionType" "PhilippinePayrollDeductionType" NOT NULL,
    "employeeShare" DECIMAL(12,2) NOT NULL,
    "employerShare" DECIMAL(12,2),
    "period" TEXT NOT NULL,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhilippinePayrollDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalTaxObligation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "taxType" "LocalTaxType" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "estimatedAmount" DECIMAL(20,4),
    "paidAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "status" "LocalTaxObligationStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "LocalTaxObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VatLedger" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vatRegistrationId" TEXT,
    "period" TEXT NOT NULL,
    "openingBalance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "inputVat" DECIMAL(20,4) NOT NULL,
    "outputVat" DECIMAL(20,4) NOT NULL,
    "reverseChargeVat" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "nonRecoverableVat" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "vatPayable" DECIMAL(20,4) NOT NULL,
    "vatReceivable" DECIMAL(20,4) NOT NULL,
    "netPosition" DECIMAL(20,4) NOT NULL,
    "creditableWithholding" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VatLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VatRegistration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "registrationType" TEXT NOT NULL,
    "vatCategory" "VatCategory",
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "filingFrequency" TEXT NOT NULL,
    "thresholdAmount" DECIMAL(20,4),
    "quarterlyThreshold" DECIMAL(20,4),
    "annualThreshold" DECIMAL(20,4),
    "isLargeTaxpayer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VatRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VatTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vatRegistrationId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "vatAmount" DECIMAL(20,4) NOT NULL,
    "vatRate" DECIMAL(10,6) NOT NULL,
    "vatCode" TEXT,
    "isReverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "isRecoverable" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VatTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirFormTemplate" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "formType" "BirFormType" NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "requiredFields" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirFormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirFormSubmission" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "formType" "BirFormType" NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" "FilingStatus" NOT NULL DEFAULT 'DRAFT',
    "filedAt" TIMESTAMP(3),
    "birReferenceNumber" TEXT,
    "efpsReferenceNumber" TEXT,
    "efpsSubmissionId" TEXT,
    "efpsStatus" TEXT,
    "efpsSubmittedAt" TIMESTAMP(3),
    "efpsResponse" JSONB,
    "attachmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT,

    CONSTRAINT "BirFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form2307" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "withheldAmount" DECIMAL(20,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "journalEntryId" TEXT,

    CONSTRAINT "Form2307_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlphalistEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payeeType" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL,
    "taxId" TEXT,
    "totalIncome" DECIMAL(20,4) NOT NULL,
    "withholdings" DECIMAL(20,4) NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlphalistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartOfAccountsTemplate" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartOfAccountsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyChartOfAccounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CompanyChartOfAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultAccountMapping" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "DefaultAccountMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhilippineFinancialStatementTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhilippineFinancialStatementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "quoteNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "convertedToInvoiceId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "templateId" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unitPrice" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(20,4) NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(20,4),
    "transactionType" "TransactionType",
    "discountAmount" DECIMAL(20,4),
    "shippingAmount" DECIMAL(20,4),
    "otherCharges" DECIMAL(20,4),
    "withholdingTaxAmount" DECIMAL(20,4),
    "finalTaxAmount" DECIMAL(20,4),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paymentTermId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "templateId" TEXT,
    "journalEntryId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT,
    "reason" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journalEntryId" TEXT,
    "templateId" TEXT,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebitNote" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "debitNoteNumber" TEXT NOT NULL,
    "billId" TEXT,
    "reason" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "status" "DebitNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journalEntryId" TEXT,

    CONSTRAINT "DebitNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringInvoice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3) NOT NULL,
    "lastRun" TIMESTAMP(3),
    "status" "RecurringInvoiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "templateData" JSONB NOT NULL,
    "recurrenceRule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecurringInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringSchedule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "recurrencePattern" JSONB NOT NULL,
    "lastExecutedAt" TIMESTAMP(3),
    "nextScheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "RecurringScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "processId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringExecutionLog" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RecurringExecutionStatus" NOT NULL,
    "message" TEXT,
    "executedBy" TEXT,
    "retriesAttempted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecurringExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseClaim" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "paycheckId" TEXT,
    "reimbursementMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "reimbursedAt" TIMESTAMP(3),

    CONSTRAINT "ExpenseClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseClaimLine" (
    "id" TEXT NOT NULL,
    "expenseClaimId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "accountId" TEXT,
    "merchant" TEXT,

    CONSTRAINT "ExpenseClaimLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGatewaySettlement" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "gatewayName" TEXT NOT NULL,
    "externalId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossAmount" DECIMAL(20,4) NOT NULL,
    "feeAmount" DECIMAL(20,4) NOT NULL,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT,
    "settledAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentGatewaySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGatewayPayout" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "payoutDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "externalPayoutId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,

    CONSTRAINT "PaymentGatewayPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "baseReportType" TEXT NOT NULL,
    "filterConfig" JSONB NOT NULL,
    "layoutConfig" JSONB,
    "displayConfig" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "schedule" JSONB,
    "lastScheduledRun" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomReportBuilder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "selectFields" TEXT[],
    "aggregates" JSONB,
    "groupBy" TEXT[],
    "sampleQuery" JSONB,
    "exampleOutput" JSONB,
    "sharedWithRoles" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomReportBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeTaxInfo" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "filingStatus" TEXT,
    "allowances" INTEGER,
    "extraWithholding" DECIMAL(10,2),
    "stateFilingStatus" TEXT,
    "stateAllowances" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTaxInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormI9" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormI9_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(20,4),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceived" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethodId" TEXT,
    "bankAccountId" TEXT,
    "referenceNumber" TEXT,
    "isDeposited" BOOLEAN NOT NULL DEFAULT false,
    "undepositedBatchId" TEXT,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(20,4),
    "deletedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePaymentApplication" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoicePaymentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DunningProfile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DunningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DunningStep" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DunningStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DunningRun" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "companyId" TEXT,
    "runDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DunningRunStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DunningRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DunningNotice" (
    "id" TEXT NOT NULL,
    "runId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stepId" TEXT,
    "sentAt" TIMESTAMP(3),
    "status" "DunningNoticeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT,

    CONSTRAINT "DunningNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerStatement" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT,
    "fileUrl" TEXT,

    CONSTRAINT "CustomerStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReminder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "status" "PaymentReminderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionReminder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "subscriptionId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeReason" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DisputeReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "reasonId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "amount" DECIMAL(20,4),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chargeback" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "ChargebackStatus" NOT NULL DEFAULT 'OPEN',
    "amount" DECIMAL(20,4) NOT NULL,
    "reason" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Chargeback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFeedRule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "matchType" TEXT NOT NULL,
    "matchString" TEXT NOT NULL,
    "amountRangeMin" DECIMAL(65,30),
    "amountRangeMax" DECIMAL(65,30),
    "assignmentAccountId" TEXT,
    "assignmentPayee" TEXT,
    "assignmentClassId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BankFeedRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFeedConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankFeedConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFeedAccount" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "companyId" TEXT,
    "currency" TEXT,
    "nickname" TEXT,

    CONSTRAINT "BankFeedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFeedImport" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rawCount" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT,

    CONSTRAINT "BankFeedImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransactionRaw" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "bankFeedAccountId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "bankTransactionId" TEXT,

    CONSTRAINT "BankTransactionRaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "accountNumber" TEXT,
    "routingNumber" TEXT,
    "swiftCode" TEXT,
    "iban" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "checkStartingNumber" INTEGER,
    "lastCheckNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDeposit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "depositDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(20,4),
    "status" "BankDepositStatus" NOT NULL DEFAULT 'DRAFT',
    "referenceNumber" TEXT,
    "journalEntryId" TEXT,

    CONSTRAINT "BankDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UndepositedFundsBatch" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "status" "UndepositedFundsBatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depositedAt" TIMESTAMP(3),

    CONSTRAINT "UndepositedFundsBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDepositLine" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "paymentReceivedId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "BankDepositLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositSlip" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "depositId" TEXT NOT NULL,
    "slipNumber" TEXT,
    "preparedById" TEXT,
    "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedAt" TIMESTAMP(3),
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT,
    "layoutConfig" JSONB,
    "lastPrintedById" TEXT,
    "notes" TEXT,

    CONSTRAINT "DepositSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashOverShortEntry" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "ruleId" TEXT,
    "accountId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "CashOverShortEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashOverShortRule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "accountId" TEXT,
    "direction" TEXT NOT NULL,
    "thresholdAmount" DECIMAL(20,4),
    "autoPost" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashOverShortRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PettyCashFund" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "custodianId" TEXT,
    "accountId" TEXT NOT NULL,
    "location" TEXT,
    "maxAmount" DECIMAL(20,4) NOT NULL,
    "currentAmount" DECIMAL(20,4) NOT NULL,
    "status" "PettyCashStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PettyCashVoucher" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "payee" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "accountId" TEXT,
    "approvedById" TEXT,
    "receiptAttached" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),

    CONSTRAINT "PettyCashVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "payee" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,
    "status" "CheckStatus" NOT NULL DEFAULT 'DRAFT',
    "printedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "stopPaymentAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "templateId" TEXT,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "billNumber" TEXT,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(20,4) NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseTotal" DECIMAL(20,4),
    "transactionType" "TransactionType",
    "discountAmount" DECIMAL(20,4),
    "shippingAmount" DECIMAL(20,4),
    "otherCharges" DECIMAL(20,4),
    "withholdingTaxAmount" DECIMAL(20,4),
    "creditableWithholding" DECIMAL(20,4),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paymentTermId" TEXT,
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "taxCodeId" TEXT,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(20,4),
    "classId" TEXT,
    "locationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "BillLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poNumber" TEXT,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'OPEN',
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "inventoryTransactionId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "templateId" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterOfCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "lcNumber" TEXT NOT NULL,
    "issuingBank" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "purchaseOrderId" TEXT,

    CONSTRAINT "LetterOfCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(16,6) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "creditNumber" TEXT,
    "total" DECIMAL(20,4) NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "VendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "creditNumber" TEXT,
    "total" DECIMAL(20,4) NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "CustomerCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCreditLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "customerCreditId" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "CustomerCreditLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCreditApplication" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerCreditApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCreditLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "vendorCreditId" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "VendorCreditLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "bankAccountId" TEXT,
    "vendorPaymentMethodId" TEXT,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(20,4),
    "deletedAt" TIMESTAMP(3),
    "journalEntryId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPaymentApplication" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillPaymentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPaymentMethod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerRefund" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "paymentReceivedId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "refundDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "reasonId" TEXT,
    "approvalStatus" "RefundApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountId" TEXT,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(20,4),
    "journalEntryId" TEXT,

    CONSTRAINT "CustomerRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorRefund" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "billPaymentId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "refundDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "reasonId" TEXT,
    "approvalStatus" "RefundApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountId" TEXT,
    "currency" TEXT,
    "exchangeRate" DECIMAL(28,12),
    "baseAmount" DECIMAL(20,4),
    "journalEntryId" TEXT,

    CONSTRAINT "VendorRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriteOff" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "billId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "writeOffDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "accountId" TEXT,
    "journalEntryId" TEXT,

    CONSTRAINT "WriteOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundApproval" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerRefundId" TEXT,
    "vendorRefundId" TEXT,
    "approverId" TEXT NOT NULL,
    "status" "RefundApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundReason" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RefundReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "practiceId" TEXT,
    "userId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
    "indexableType" TEXT NOT NULL,
    "indexableId" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "indexedPayload" JSONB NOT NULL,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndexedDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBillingInvoice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "WorkspaceBillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBillingUsage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "invoicesCount" INTEGER NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "WorkspaceBillingUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsrExportRequest" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
    "workspaceId" TEXT NOT NULL,
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
CREATE TABLE "ArchiveJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "year" INTEGER NOT NULL,
    "modules" TEXT[],
    "status" "ArchiveJobStatus" NOT NULL DEFAULT 'PLANNED',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityVersion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMetric" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DECIMAL(20,4) NOT NULL,
    "benchmark" DECIMAL(20,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRetentionPolicy" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "retentionYears" INTEGER NOT NULL DEFAULT 7,
    "archiveAfterYears" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRetention" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "retentionYears" INTEGER NOT NULL,
    "legalRequirement" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRetention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentTemplateType" NOT NULL,
    "industry" TEXT,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "design" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "previewThumbnailUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRenderLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "templateId" TEXT,
    "userId" TEXT,
    "renderedBy" TEXT,
    "renderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" TEXT NOT NULL,
    "outputUrl" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "renderAttempts" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "meta" JSONB,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),

    CONSTRAINT "DocumentRenderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "design" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSignature" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "templateId" TEXT,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerId" TEXT,
    "signatureType" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialControl" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "controlType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlViolation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "severity" "ControlSeverity" NOT NULL,
    "status" "ControlStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "mitigation" TEXT NOT NULL,
    "ownerId" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "reviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingValidation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "validationType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "passed" BOOLEAN,
    "issues" JSONB,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubsidiaryLedger" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "SubsidiaryLedgerType" NOT NULL,
    "controlAccountId" TEXT NOT NULL,
    "totalBalance" DECIMAL(20,4) NOT NULL,
    "lastReconciledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubsidiaryLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetActualComparison" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "budgetAmount" DECIMAL(20,4) NOT NULL,
    "actualAmount" DECIMAL(20,4) NOT NULL,
    "varianceAmount" DECIMAL(20,4) NOT NULL,
    "variancePercent" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetActualComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlowForecast" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenario" "CashFlowScenario" NOT NULL DEFAULT 'BASE',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalInflow" DECIMAL(20,4) NOT NULL,
    "totalOutflow" DECIMAL(20,4) NOT NULL,
    "netFlow" DECIMAL(20,4) NOT NULL,
    "openingBalance" DECIMAL(20,4) NOT NULL,
    "closingBalance" DECIMAL(20,4) NOT NULL,
    "confidence" DECIMAL(5,2),
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashFlowForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlowForecastItem" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "CashFlowForecastItemCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "isActual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CashFlowForecastItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationException" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subledgerReconciliationId" TEXT,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReconciliationExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ReconciliationExceptionPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubledgerReconciliation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subledgerType" "SubledgerType" NOT NULL,
    "subledgerId" TEXT,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "glAccountId" TEXT,
    "glBalance" DECIMAL(20,4),
    "subledgerBalance" DECIMAL(20,4),
    "difference" DECIMAL(20,4),
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "SubledgerReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimateType" "EstimateType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "method" TEXT,
    "assumptions" JSONB,
    "impactedAccounts" JSONB,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
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

-- CreateTable
CREATE TABLE "ExternalSystemConfig" (
    "id" TEXT NOT NULL,
    "systemType" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "configJson" JSONB NOT NULL,
    "encryptedConfig" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "rateLimitRequests" INTEGER,
    "rateLimitPeriodSeconds" INTEGER,
    "notificationChannels" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "ExternalSystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSystemAudit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "systemConfigId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "payload" JSONB,
    "response" JSONB,
    "status" "IntegrationActionStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalSystemAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "channels" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ownerId" TEXT,
    "systemType" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSystemAccessLog" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "response" JSONB,
    "status" "IntegrationActionStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalSystemAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "integrationConfigId" TEXT NOT NULL,
    "jobType" "SyncJobType" NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'QUEUED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemHealthStatus" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "systemType" "IntegrationType" NOT NULL,
    "status" "SystemHealthState" NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "SystemHealthStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalEntity" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "integrationConfigId" TEXT,
    "localEntityType" TEXT,
    "localEntityId" TEXT,
    "entityType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "systemType" "IntegrationType" NOT NULL,
    "data" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "lastLocalUpdate" TIMESTAMP(3),
    "lastExternalUpdate" TIMESTAMP(3),
    "conflictResolution" "IntegrationConflictResolution",
    "conflictNotes" TEXT,
    "status" "ExternalEntitySyncStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ExternalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "entityType" TEXT NOT NULL,
    "parentEntityId" TEXT,
    "taxId" TEXT,
    "registrationNo" TEXT,
    "jurisdiction" TEXT,
    "incorporatedDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing_calendars" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dueDay" INTEGER,
    "dueMonth" INTEGER,
    "agencyId" TEXT,
    "formType" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filing_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing_deadlines" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "filedAt" TIMESTAMP(3),
    "filedById" TEXT,
    "penaltyAmount" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filing_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_lines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "lenderName" TEXT NOT NULL,
    "lineNumber" TEXT,
    "creditLimit" DECIMAL(65,30) NOT NULL,
    "availableAmount" DECIMAL(65,30) NOT NULL,
    "usedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "interestRate" DECIMAL(65,30),
    "startDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "collateral" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_line_drawdowns" (
    "id" TEXT NOT NULL,
    "creditLineId" TEXT NOT NULL,
    "drawdownDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "repaidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'outstanding',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_line_drawdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flow_forecast_lines" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "forecastAmount" DECIMAL(65,30) NOT NULL,
    "actualAmount" DECIMAL(65,30),
    "variance" DECIMAL(65,30),
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_flow_forecast_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_approvals" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amountToApprove" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "payment_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_entries" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "minQuantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "discountPct" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_list_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_recognition_entries" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "recognitionDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "journalEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_recognition_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "daysOverdue" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "emailTemplateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dunning_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_logs" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "response" TEXT,

    CONSTRAINT "dunning_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "merchantName" TEXT,
    "receiptDate" TIMESTAMP(3),
    "amount" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "categoryId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "ocrData" JSONB,
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "expenseId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mileage_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT,
    "userId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "miles" DECIMAL(65,30) NOT NULL,
    "ratePerMile" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "purpose" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT,
    "projectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mileage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_cards" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardHolder" TEXT,
    "employeeId" TEXT,
    "issuer" TEXT,
    "cardType" TEXT NOT NULL DEFAULT 'credit',
    "creditLimit" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_card_activities" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "employeeId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "merchantName" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "category" TEXT,
    "description" TEXT,
    "receiptId" TEXT,
    "expenseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unreviewed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_card_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_serial_numbers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "type" TEXT NOT NULL,
    "lotNumber" TEXT,
    "serialNumber" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "quantityOnHand" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "expiryDate" TIMESTAMP(3),
    "manufacturingDate" TIMESTAMP(3),
    "supplierId" TEXT,
    "receivedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reorder_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "reorderPoint" DECIMAL(65,30) NOT NULL,
    "safetyStockLevel" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reorderQty" DECIMAL(65,30) NOT NULL,
    "maxStockLevel" DECIMAL(65,30),
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "preferredVendorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "back_orders" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "customerId" TEXT,
    "quantityOrdered" DECIMAL(65,30) NOT NULL,
    "quantityOnHand" DECIMAL(65,30) NOT NULL,
    "backorderQty" DECIMAL(65,30) NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "back_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_billings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3) NOT NULL,
    "billingType" TEXT NOT NULL,
    "percentage" DECIMAL(65,30),
    "milestoneId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "invoiceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_in_progress" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalCosts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "billedToDate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estimatedTotal" DECIMAL(65,30) NOT NULL,
    "percentComplete" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "wipAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "overbilling" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "underbilling" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "journalEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_in_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_retainers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "usedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_retainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structure_components" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL DEFAULT 'fixed',
    "value" DECIMAL(65,30),
    "formula" TEXT,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_structure_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_loan_repayments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "paycheckId" TEXT,
    "repaymentDate" TIMESTAMP(3) NOT NULL,
    "principal" DECIMAL(65,30) NOT NULL,
    "interest" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "provider" TEXT,
    "description" TEXT,
    "employeeContributionAmt" DECIMAL(65,30),
    "employerContributionAmt" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benefit_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_enrollments" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" TIMESTAMP(3),
    "employeeContrib" DECIMAL(65,30),
    "employerContrib" DECIMAL(65,30),
    "coverageLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "benefit_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_remittances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "remittanceType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "employeeShare" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerShare" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "penaltyAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "referenceNo" TEXT,
    "bankAccountId" TEXT,
    "paidAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_remittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_schedules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL DEFAULT 'fixed',
    "startTime" TEXT,
    "endTime" TEXT,
    "breakMins" INTEGER NOT NULL DEFAULT 60,
    "workDays" JSONB,
    "isNightShift" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_close_checklists" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'open',
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "signedOffAt" TIMESTAMP(3),
    "signedOffById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "period_close_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_close_checklist_items" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedToId" TEXT,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "period_close_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_controls" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "controlType" TEXT NOT NULL,
    "frequency" TEXT,
    "ownerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastTestedAt" TIMESTAMP(3),
    "nextTestDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_tests" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "testedById" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "evidence" TEXT,
    "findings" TEXT,
    "remediation" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "effectiveDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "fileUrl" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_issues" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "reportedById" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" TEXT,
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_detection_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "action" TEXT NOT NULL DEFAULT 'flag',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_detection_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_alerts" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolution" TEXT,

    CONSTRAINT "fraud_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_loans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "loanNumber" TEXT,
    "loanType" TEXT NOT NULL,
    "principalAmount" DECIMAL(65,30) NOT NULL,
    "outstandingAmt" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3),
    "monthlyPayment" DECIMAL(65,30),
    "collateral" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_loan_payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "principal" DECIMAL(65,30) NOT NULL,
    "interest" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "referenceNo" TEXT,
    "bankAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "merchantId" TEXT,
    "accountName" TEXT NOT NULL,
    "settlementBankId" TEXT,
    "processingFeeRate" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "status" TEXT NOT NULL DEFAULT 'active',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_health_scores" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scoreDate" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "cashFlowScore" INTEGER,
    "debtRatioScore" INTEGER,
    "paymentHistScore" INTEGER,
    "profitScore" INTEGER,
    "currentRatio" DECIMAL(65,30),
    "debtToEquity" DECIMAL(65,30),
    "daysPayable" DECIMAL(65,30),
    "daysReceivable" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "failReason" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepreciationJournalToTaxAttributeCarryforward" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DepreciationJournalToUncertainTaxPosition" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TaxAttributeSurrenderedTo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ConstructionCostCodeToConstructionProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TaxReturnToUncertainTaxPosition" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_hmac_idx" ON "User"("phone_hmac");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_isemailverified_idx" ON "User"("email", "isemailverified");

-- CreateIndex
CREATE INDEX "User_phone_isphoneverified_idx" ON "User"("phone", "isphoneverified");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");

-- CreateIndex
CREATE INDEX "Otp_phone_idx" ON "Otp"("phone");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "UserSecurityEvent_userId_idx" ON "UserSecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "UserSecurityEvent_email_idx" ON "UserSecurityEvent"("email");

-- CreateIndex
CREATE INDEX "OnboardingStep_companyId_idx" ON "OnboardingStep"("companyId");

-- CreateIndex
CREATE INDEX "OnboardingStep_practiceId_idx" ON "OnboardingStep"("practiceId");

-- CreateIndex
CREATE INDEX "OnboardingStep_companyId_practiceId_idx" ON "OnboardingStep"("companyId", "practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_locale_idx" ON "Country"("locale");

-- CreateIndex
CREATE INDEX "CountryTaxModule_countryId_isEnabled_idx" ON "CountryTaxModule"("countryId", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "CountryTaxModule_countryId_moduleType_key" ON "CountryTaxModule"("countryId", "moduleType");

-- CreateIndex
CREATE INDEX "Nexus_companyId_isActive_idx" ON "Nexus"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Nexus_companyId_countryId_stateCode_city_nexusType_key" ON "Nexus"("companyId", "countryId", "stateCode", "city", "nexusType");

-- CreateIndex
CREATE INDEX "RelatedParty_companyId_isActive_idx" ON "RelatedParty"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedParty_companyId_relatedCompanyId_relationshipType_key" ON "RelatedParty"("companyId", "relatedCompanyId", "relationshipType");

-- CreateIndex
CREATE INDEX "TaxTreaty_countryFromId_countryToId_idx" ON "TaxTreaty"("countryFromId", "countryToId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxTreaty_countryFromId_countryToId_treatyName_key" ON "TaxTreaty"("countryFromId", "countryToId", "treatyName");

-- CreateIndex
CREATE INDEX "TaxProvision_companyId_period_idx" ON "TaxProvision"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TaxProvision_companyId_period_key" ON "TaxProvision"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_ownerUserId_key" ON "Workspace"("ownerUserId");

-- CreateIndex
CREATE INDEX "Workspace_ownerUserId_idx" ON "Workspace"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "Subscription_practiceId_idx" ON "Subscription"("practiceId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_practiceId_key" ON "Subscription"("practiceId");

-- CreateIndex
CREATE INDEX "Practice_workspaceId_idx" ON "Practice"("workspaceId");

-- CreateIndex
CREATE INDEX "Practice_isActive_idx" ON "Practice"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceCapabilities_workspaceId_key" ON "WorkspaceCapabilities"("workspaceId");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE INDEX "Plan_sortOrder_idx" ON "Plan"("sortOrder");

-- CreateIndex
CREATE INDEX "Feature_category_idx" ON "Feature"("category");

-- CreateIndex
CREATE INDEX "Company_workspaceId_idx" ON "Company"("workspaceId");

-- CreateIndex
CREATE INDEX "Company_workspaceId_isActive_idx" ON "Company"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "Company_countryId_idx" ON "Company"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_workspaceId_name_key" ON "Company"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "ConsolidationGroup_workspaceId_idx" ON "ConsolidationGroup"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationGroup_workspaceId_name_key" ON "ConsolidationGroup"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "ConsolidationGroupMember_companyId_idx" ON "ConsolidationGroupMember"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationGroupMember_groupId_companyId_key" ON "ConsolidationGroupMember"("groupId", "companyId");

-- CreateIndex
CREATE INDEX "AccountingFirm_workspaceId_idx" ON "AccountingFirm"("workspaceId");

-- CreateIndex
CREATE INDEX "FirmData_workspaceId_accountingFirmId_idx" ON "FirmData"("workspaceId", "accountingFirmId");

-- CreateIndex
CREATE INDEX "CompanyFirmAccess_workspaceId_companyId_idx" ON "CompanyFirmAccess"("workspaceId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFirmAccess_companyId_accountingFirmId_key" ON "CompanyFirmAccess"("companyId", "accountingFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingFirmSubscription_accountingFirmId_key" ON "AccountingFirmSubscription"("accountingFirmId");

-- CreateIndex
CREATE INDEX "CompanyUser_companyId_idx" ON "CompanyUser"("companyId");

-- CreateIndex
CREATE INDEX "CompanyUser_workspaceId_userId_idx" ON "CompanyUser"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "PracticeUser_practiceId_idx" ON "PracticeUser"("practiceId");

-- CreateIndex
CREATE INDEX "PracticeUser_workspaceId_userId_idx" ON "PracticeUser"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_workspaceId_transactionDate_idx" ON "IntercompanyTransaction"("workspaceId", "transactionDate");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_fromCompanyId_transactionDate_idx" ON "IntercompanyTransaction"("fromCompanyId", "transactionDate");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_toCompanyId_transactionDate_idx" ON "IntercompanyTransaction"("toCompanyId", "transactionDate");

-- CreateIndex
CREATE INDEX "ConsolidationEntry_workspaceId_period_idx" ON "ConsolidationEntry"("workspaceId", "period");

-- CreateIndex
CREATE INDEX "ConsolidationEntry_companyId_period_idx" ON "ConsolidationEntry"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAssetCategory_companyId_name_key" ON "FixedAssetCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "FixedAsset_companyId_idx" ON "FixedAsset"("companyId");

-- CreateIndex
CREATE INDEX "FixedAssetDepreciation_assetId_idx" ON "FixedAssetDepreciation"("assetId");

-- CreateIndex
CREATE INDEX "FixedAssetDepreciation_companyId_idx" ON "FixedAssetDepreciation"("companyId");

-- CreateIndex
CREATE INDEX "FixedAssetSchedule_companyId_idx" ON "FixedAssetSchedule"("companyId");

-- CreateIndex
CREATE INDEX "FixedAssetSchedule_assetId_idx" ON "FixedAssetSchedule"("assetId");

-- CreateIndex
CREATE INDEX "AssetDisposal_companyId_disposalDate_idx" ON "AssetDisposal"("companyId", "disposalDate");

-- CreateIndex
CREATE INDEX "AssetDisposal_assetId_idx" ON "AssetDisposal"("assetId");

-- CreateIndex
CREATE INDEX "AssetImpairment_companyId_impairmentDate_idx" ON "AssetImpairment"("companyId", "impairmentDate");

-- CreateIndex
CREATE INDEX "AssetImpairment_assetId_idx" ON "AssetImpairment"("assetId");

-- CreateIndex
CREATE INDEX "AssetRevaluation_companyId_revaluationDate_idx" ON "AssetRevaluation"("companyId", "revaluationDate");

-- CreateIndex
CREATE INDEX "AssetRevaluation_assetId_idx" ON "AssetRevaluation"("assetId");

-- CreateIndex
CREATE INDEX "AssetMaintenance_companyId_scheduledAt_idx" ON "AssetMaintenance"("companyId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AssetMaintenance_assetId_idx" ON "AssetMaintenance"("assetId");

-- CreateIndex
CREATE INDEX "AssetInsurance_companyId_expiryDate_idx" ON "AssetInsurance"("companyId", "expiryDate");

-- CreateIndex
CREATE INDEX "AssetInsurance_assetId_idx" ON "AssetInsurance"("assetId");

-- CreateIndex
CREATE INDEX "DepreciationAccount_companyId_idx" ON "DepreciationAccount"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DepreciationAccount_companyId_assetId_key" ON "DepreciationAccount"("companyId", "assetId");

-- CreateIndex
CREATE INDEX "DepreciationJournal_companyId_periodStart_idx" ON "DepreciationJournal"("companyId", "periodStart");

-- CreateIndex
CREATE INDEX "DepreciationJournal_journalEntryId_idx" ON "DepreciationJournal"("journalEntryId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_roleId_idx" ON "WorkspaceUser"("roleId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_status_idx" ON "WorkspaceUser"("status");

-- CreateIndex
CREATE INDEX "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_workspaceId_lastAccessedAt_idx" ON "WorkspaceUser"("workspaceId", "lastAccessedAt");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_idx" ON "WorkspaceInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_status_idx" ON "WorkspaceInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_workspaceId_email_key" ON "WorkspaceInvite"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Task_workspaceId_assigneeId_idx" ON "Task"("workspaceId", "assigneeId");

-- CreateIndex
CREATE INDEX "Task_workspaceId_dueDate_idx" ON "Task"("workspaceId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_workspaceId_priority_idx" ON "Task"("workspaceId", "priority");

-- CreateIndex
CREATE INDEX "Task_remindAt_idx" ON "Task"("remindAt");

-- CreateIndex
CREATE INDEX "Task_workspaceId_archivedAt_idx" ON "Task"("workspaceId", "archivedAt");

-- CreateIndex
CREATE INDEX "Task_companyId_idx" ON "Task"("companyId");

-- CreateIndex
CREATE INDEX "Task_practiceId_idx" ON "Task"("practiceId");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE INDEX "Workflow_workspaceId_status_idx" ON "Workflow"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Workflow_companyId_idx" ON "Workflow"("companyId");

-- CreateIndex
CREATE INDEX "Workflow_practiceId_idx" ON "Workflow"("practiceId");

-- CreateIndex
CREATE INDEX "WorkflowRule_workflowId_isActive_sortOrder_idx" ON "WorkflowRule"("workflowId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_status_idx" ON "WorkflowRun"("workflowId", "status");

-- CreateIndex
CREATE INDEX "WorkflowRun_createdAt_idx" ON "WorkflowRun"("createdAt");

-- CreateIndex
CREATE INDEX "WorkflowRunStep_runId_status_idx" ON "WorkflowRunStep"("runId", "status");

-- CreateIndex
CREATE INDEX "WorkflowRunStep_ruleId_idx" ON "WorkflowRunStep"("ruleId");

-- CreateIndex
CREATE INDEX "DocumentApproval_companyId_status_idx" ON "DocumentApproval"("companyId", "status");

-- CreateIndex
CREATE INDEX "DocumentApproval_approverId_idx" ON "DocumentApproval"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApproval_documentType_documentId_approverId_level_key" ON "DocumentApproval"("documentType", "documentId", "approverId", "level");

-- CreateIndex
CREATE INDEX "AiInsight_workspaceId_insightType_status_idx" ON "AiInsight"("workspaceId", "insightType", "status");

-- CreateIndex
CREATE INDEX "AiInsight_companyId_insightType_status_idx" ON "AiInsight"("companyId", "insightType", "status");

-- CreateIndex
CREATE INDEX "AiInsight_workspaceId_severity_status_idx" ON "AiInsight"("workspaceId", "severity", "status");

-- CreateIndex
CREATE INDEX "AiInsight_predictedDate_idx" ON "AiInsight"("predictedDate");

-- CreateIndex
CREATE INDEX "AiInsight_createdAt_idx" ON "AiInsight"("createdAt");

-- CreateIndex
CREATE INDEX "AiInsightAttachment_insightId_idx" ON "AiInsightAttachment"("insightId");

-- CreateIndex
CREATE INDEX "AiInsightComment_insightId_idx" ON "AiInsightComment"("insightId");

-- CreateIndex
CREATE INDEX "AiInsightComment_userId_idx" ON "AiInsightComment"("userId");

-- CreateIndex
CREATE INDEX "AiInsightMetric_insightId_idx" ON "AiInsightMetric"("insightId");

-- CreateIndex
CREATE INDEX "AiModel_workspaceId_modelType_isActive_idx" ON "AiModel"("workspaceId", "modelType", "isActive");

-- CreateIndex
CREATE INDEX "AiModel_companyId_modelType_isActive_idx" ON "AiModel"("companyId", "modelType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_workspaceId_companyId_name_version_key" ON "AiModel"("workspaceId", "companyId", "name", "version");

-- CreateIndex
CREATE INDEX "AiModelRun_modelId_status_idx" ON "AiModelRun"("modelId", "status");

-- CreateIndex
CREATE INDEX "AiModelRun_startedAt_idx" ON "AiModelRun"("startedAt");

-- CreateIndex
CREATE INDEX "AiModelRun_runType_status_idx" ON "AiModelRun"("runType", "status");

-- CreateIndex
CREATE INDEX "FeatureStore_workspaceId_companyId_category_idx" ON "FeatureStore"("workspaceId", "companyId", "category");

-- CreateIndex
CREATE INDEX "FeatureStore_workspaceId_companyId_isActive_idx" ON "FeatureStore"("workspaceId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureStore_workspaceId_companyId_name_version_key" ON "FeatureStore"("workspaceId", "companyId", "name", "version");

-- CreateIndex
CREATE INDEX "FeatureVector_workspaceId_companyId_entityType_timestamp_idx" ON "FeatureVector"("workspaceId", "companyId", "entityType", "timestamp");

-- CreateIndex
CREATE INDEX "FeatureVector_predictionId_idx" ON "FeatureVector"("predictionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureVector_workspaceId_companyId_entityType_entityId_tim_key" ON "FeatureVector"("workspaceId", "companyId", "entityType", "entityId", "timestamp");

-- CreateIndex
CREATE INDEX "Prediction_workspaceId_companyId_predictionType_targetDate_idx" ON "Prediction"("workspaceId", "companyId", "predictionType", "targetDate");

-- CreateIndex
CREATE INDEX "Prediction_workspaceId_companyId_entityType_entityId_idx" ON "Prediction"("workspaceId", "companyId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Prediction_predictionDate_idx" ON "Prediction"("predictionDate");

-- CreateIndex
CREATE INDEX "AiAgent_workspaceId_agentType_status_idx" ON "AiAgent"("workspaceId", "agentType", "status");

-- CreateIndex
CREATE INDEX "AiAgent_nextRunAt_idx" ON "AiAgent"("nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiAgent_workspaceId_companyId_name_key" ON "AiAgent"("workspaceId", "companyId", "name");

-- CreateIndex
CREATE INDEX "AiAgentTask_agentId_status_idx" ON "AiAgentTask"("agentId", "status");

-- CreateIndex
CREATE INDEX "AiAgentTask_status_scheduledAt_idx" ON "AiAgentTask"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "AiAgentTask_relatedType_relatedId_idx" ON "AiAgentTask"("relatedType", "relatedId");

-- CreateIndex
CREATE UNIQUE INDEX "AiChatSession_sessionId_key" ON "AiChatSession"("sessionId");

-- CreateIndex
CREATE INDEX "AiChatSession_workspaceId_userId_status_idx" ON "AiChatSession"("workspaceId", "userId", "status");

-- CreateIndex
CREATE INDEX "AiChatSession_createdAt_idx" ON "AiChatSession"("createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_sessionId_createdAt_idx" ON "AiChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_role_idx" ON "AiChatMessage"("role");

-- CreateIndex
CREATE INDEX "AiQueryLog_workspaceId_queryType_createdAt_idx" ON "AiQueryLog"("workspaceId", "queryType", "createdAt");

-- CreateIndex
CREATE INDEX "AiQueryLog_userId_createdAt_idx" ON "AiQueryLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiQueryLog_createdAt_idx" ON "AiQueryLog"("createdAt");

-- CreateIndex
CREATE INDEX "AiGovernanceRule_workspaceId_ruleType_isActive_idx" ON "AiGovernanceRule"("workspaceId", "ruleType", "isActive");

-- CreateIndex
CREATE INDEX "AiGovernanceRule_companyId_ruleType_isActive_idx" ON "AiGovernanceRule"("companyId", "ruleType", "isActive");

-- CreateIndex
CREATE INDEX "AiGovernanceTrigger_ruleId_triggeredAt_idx" ON "AiGovernanceTrigger"("ruleId", "triggeredAt");

-- CreateIndex
CREATE INDEX "AiGovernanceTrigger_entityType_entityId_idx" ON "AiGovernanceTrigger"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AiAuditLog_workspaceId_actionType_createdAt_idx" ON "AiAuditLog"("workspaceId", "actionType", "createdAt");

-- CreateIndex
CREATE INDEX "AiAuditLog_companyId_actionType_createdAt_idx" ON "AiAuditLog"("companyId", "actionType", "createdAt");

-- CreateIndex
CREATE INDEX "AiAuditLog_actorType_actorId_idx" ON "AiAuditLog"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "Dimension_companyId_isActive_idx" ON "Dimension"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Dimension_companyId_name_key" ON "Dimension"("companyId", "name");

-- CreateIndex
CREATE INDEX "DimensionValue_companyId_dimensionId_idx" ON "DimensionValue"("companyId", "dimensionId");

-- CreateIndex
CREATE INDEX "DimensionValue_parentId_idx" ON "DimensionValue"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionValue_dimensionId_code_key" ON "DimensionValue"("dimensionId", "code");

-- CreateIndex
CREATE INDEX "EntityDimensionValue_companyId_entityType_entityId_idx" ON "EntityDimensionValue"("companyId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityDimensionValue_dimensionValueId_idx" ON "EntityDimensionValue"("dimensionValueId");

-- CreateIndex
CREATE INDEX "DataQualityScore_workspaceId_datasetType_measuredAt_idx" ON "DataQualityScore"("workspaceId", "datasetType", "measuredAt");

-- CreateIndex
CREATE INDEX "DataQualityScore_companyId_datasetType_measuredAt_idx" ON "DataQualityScore"("companyId", "datasetType", "measuredAt");

-- CreateIndex
CREATE INDEX "DataQualityScore_entityType_entityId_idx" ON "DataQualityScore"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Fund_code_key" ON "Fund"("code");

-- CreateIndex
CREATE INDEX "Fund_companyId_type_idx" ON "Fund"("companyId", "type");

-- CreateIndex
CREATE INDEX "FundAllocation_transactionId_transactionType_idx" ON "FundAllocation"("transactionId", "transactionType");

-- CreateIndex
CREATE INDEX "FundAllocation_fundId_idx" ON "FundAllocation"("fundId");

-- CreateIndex
CREATE INDEX "Donation_companyId_date_idx" ON "Donation"("companyId", "date");

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateIndex
CREATE INDEX "Pledge_donorId_idx" ON "Pledge"("donorId");

-- CreateIndex
CREATE INDEX "Property_companyId_idx" ON "Property"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyUnit_propertyId_unitNumber_key" ON "PropertyUnit"("propertyId", "unitNumber");

-- CreateIndex
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE INDEX "Lease_unitId_idx" ON "Lease"("unitId");

-- CreateIndex
CREATE INDEX "ContractRetention_companyId_idx" ON "ContractRetention"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractRetention_projectId_key" ON "ContractRetention"("projectId");

-- CreateIndex
CREATE INDEX "RetentionEntry_retentionId_idx" ON "RetentionEntry"("retentionId");

-- CreateIndex
CREATE INDEX "RetentionEntry_invoiceId_idx" ON "RetentionEntry"("invoiceId");

-- CreateIndex
CREATE INDEX "RetentionEntry_billId_idx" ON "RetentionEntry"("billId");

-- CreateIndex
CREATE INDEX "GiftCard_companyId_status_idx" ON "GiftCard"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_companyId_code_key" ON "GiftCard"("companyId", "code");

-- CreateIndex
CREATE INDEX "LoyaltyProgram_companyId_idx" ON "LoyaltyProgram"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyAccount_programId_customerId_key" ON "LoyaltyAccount"("programId", "customerId");

-- CreateIndex
CREATE INDEX "PaymentTerm_workspaceId_idx" ON "PaymentTerm"("workspaceId");

-- CreateIndex
CREATE INDEX "PaymentMethod_workspaceId_idx" ON "PaymentMethod"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_toCurrency_date_key" ON "ExchangeRate"("baseCurrency", "toCurrency", "date");

-- CreateIndex
CREATE INDEX "ForeignCurrencyGainLoss_companyId_realizedAt_idx" ON "ForeignCurrencyGainLoss"("companyId", "realizedAt");

-- CreateIndex
CREATE INDEX "ForeignCurrencyGainLoss_transactionType_transactionId_idx" ON "ForeignCurrencyGainLoss"("transactionType", "transactionId");

-- CreateIndex
CREATE INDEX "AccountSubType_companyId_typeId_idx" ON "AccountSubType"("companyId", "typeId");

-- CreateIndex
CREATE INDEX "AccountBalance_companyId_yearMonth_idx" ON "AccountBalance"("companyId", "yearMonth");

-- CreateIndex
CREATE INDEX "AccountBalance_companyId_yearMonth_accountId_idx" ON "AccountBalance"("companyId", "yearMonth", "accountId");

-- CreateIndex
CREATE INDEX "AccountBalance_companyId_yearMonth_balance_idx" ON "AccountBalance"("companyId", "yearMonth", "balance");

-- CreateIndex
CREATE INDEX "AccountBalance_accountId_yearMonth_idx" ON "AccountBalance"("accountId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_companyId_accountId_yearMonth_key" ON "AccountBalance"("companyId", "accountId", "yearMonth");

-- CreateIndex
CREATE INDEX "AccountBalanceAudit_companyId_accountId_period_idx" ON "AccountBalanceAudit"("companyId", "accountId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_companyId_accountId_key" ON "OpeningBalance"("companyId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_companyId_name_key" ON "Class"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_companyId_name_key" ON "Location"("companyId", "name");

-- CreateIndex
CREATE INDEX "Project_companyId_status_idx" ON "Project"("companyId", "status");

-- CreateIndex
CREATE INDEX "ProjectLine_projectId_idx" ON "ProjectLine"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLine_workspaceId_idx" ON "ProjectLine"("workspaceId");

-- CreateIndex
CREATE INDEX "ProjectLine_sourceType_sourceId_idx" ON "ProjectLine"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructionProject_projectId_key" ON "ConstructionProject"("projectId");

-- CreateIndex
CREATE INDEX "ConstructionProject_companyId_status_idx" ON "ConstructionProject"("companyId", "status");

-- CreateIndex
CREATE INDEX "ConstructionProject_companyId_currentPhase_idx" ON "ConstructionProject"("companyId", "currentPhase");

-- CreateIndex
CREATE INDEX "ConstructionProject_companyId_startDate_idx" ON "ConstructionProject"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "ConstructionProject_clientId_idx" ON "ConstructionProject"("clientId");

-- CreateIndex
CREATE INDEX "ConstructionProject_projectManagerId_idx" ON "ConstructionProject"("projectManagerId");

-- CreateIndex
CREATE INDEX "ProjectPhaseLog_projectId_phase_idx" ON "ProjectPhaseLog"("projectId", "phase");

-- CreateIndex
CREATE INDEX "ChangeOrder_companyId_status_idx" ON "ChangeOrder"("companyId", "status");

-- CreateIndex
CREATE INDEX "ChangeOrder_projectId_status_idx" ON "ChangeOrder"("projectId", "status");

-- CreateIndex
CREATE INDEX "ChangeOrder_approvedById_idx" ON "ChangeOrder"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeOrder_companyId_projectId_changeOrderNo_key" ON "ChangeOrder"("companyId", "projectId", "changeOrderNo");

-- CreateIndex
CREATE INDEX "ChangeOrderItem_changeOrderId_idx" ON "ChangeOrderItem"("changeOrderId");

-- CreateIndex
CREATE INDEX "Lien_companyId_status_idx" ON "Lien"("companyId", "status");

-- CreateIndex
CREATE INDEX "Lien_projectId_status_idx" ON "Lien"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Lien_companyId_projectId_lienNumber_key" ON "Lien"("companyId", "projectId", "lienNumber");

-- CreateIndex
CREATE INDEX "RetentionSchedule_companyId_status_idx" ON "RetentionSchedule"("companyId", "status");

-- CreateIndex
CREATE INDEX "RetentionSchedule_projectId_status_idx" ON "RetentionSchedule"("projectId", "status");

-- CreateIndex
CREATE INDEX "RetentionSchedule_invoiceId_idx" ON "RetentionSchedule"("invoiceId");

-- CreateIndex
CREATE INDEX "RetentionSchedule_billId_idx" ON "RetentionSchedule"("billId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_companyId_projectId_idx" ON "ProjectMilestone"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_plannedDate_idx" ON "ProjectMilestone"("plannedDate");

-- CreateIndex
CREATE INDEX "ProjectMilestone_status_idx" ON "ProjectMilestone"("status");

-- CreateIndex
CREATE INDEX "ConstructionCostCode_companyId_isActive_idx" ON "ConstructionCostCode"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "ConstructionCostCode_parentId_idx" ON "ConstructionCostCode"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructionCostCode_companyId_code_key" ON "ConstructionCostCode"("companyId", "code");

-- CreateIndex
CREATE INDEX "CostCodeAllocation_companyId_projectId_costCodeId_idx" ON "CostCodeAllocation"("companyId", "projectId", "costCodeId");

-- CreateIndex
CREATE INDEX "CostCodeAllocation_transactionType_transactionId_idx" ON "CostCodeAllocation"("transactionType", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CostCodeAllocation_companyId_transactionType_transactionId__key" ON "CostCodeAllocation"("companyId", "transactionType", "transactionId", "costCodeId");

-- CreateIndex
CREATE INDEX "Grant_companyId_status_idx" ON "Grant"("companyId", "status");

-- CreateIndex
CREATE INDEX "Grant_funderId_idx" ON "Grant"("funderId");

-- CreateIndex
CREATE INDEX "Grant_endDate_idx" ON "Grant"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Grant_companyId_grantNumber_key" ON "Grant"("companyId", "grantNumber");

-- CreateIndex
CREATE INDEX "GrantBudget_grantId_idx" ON "GrantBudget"("grantId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantBudget_grantId_category_budgetCode_key" ON "GrantBudget"("grantId", "category", "budgetCode");

-- CreateIndex
CREATE INDEX "GrantExpense_grantId_expenseDate_idx" ON "GrantExpense"("grantId", "expenseDate");

-- CreateIndex
CREATE INDEX "GrantExpense_transactionType_transactionId_idx" ON "GrantExpense"("transactionType", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantExpense_companyId_grantId_transactionType_transactionI_key" ON "GrantExpense"("companyId", "grantId", "transactionType", "transactionId");

-- CreateIndex
CREATE INDEX "GrantReport_grantId_dueDate_idx" ON "GrantReport"("grantId", "dueDate");

-- CreateIndex
CREATE INDEX "GrantReport_submittedById_idx" ON "GrantReport"("submittedById");

-- CreateIndex
CREATE INDEX "GrantReport_approvedById_idx" ON "GrantReport"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "GrantReport_grantId_reportPeriod_reportType_key" ON "GrantReport"("grantId", "reportPeriod", "reportType");

-- CreateIndex
CREATE INDEX "DonorManagement_companyId_donorTier_idx" ON "DonorManagement"("companyId", "donorTier");

-- CreateIndex
CREATE INDEX "DonorManagement_donorId_idx" ON "DonorManagement"("donorId");

-- CreateIndex
CREATE UNIQUE INDEX "DonorManagement_companyId_donorId_key" ON "DonorManagement"("companyId", "donorId");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueRecognitionSchedule_invoiceLineId_key" ON "RevenueRecognitionSchedule"("invoiceLineId");

-- CreateIndex
CREATE INDEX "RevenueRecognitionSchedule_workspaceId_idx" ON "RevenueRecognitionSchedule"("workspaceId");

-- CreateIndex
CREATE INDEX "RevenueRecognitionSchedule_invoiceLineId_idx" ON "RevenueRecognitionSchedule"("invoiceLineId");

-- CreateIndex
CREATE INDEX "RevenueRecognitionPhase_workspaceId_idx" ON "RevenueRecognitionPhase"("workspaceId");

-- CreateIndex
CREATE INDEX "RevenueRecognitionPhase_scheduleId_idx" ON "RevenueRecognitionPhase"("scheduleId");

-- CreateIndex
CREATE INDEX "RevenueRecognitionPhase_journalEntryId_idx" ON "RevenueRecognitionPhase"("journalEntryId");

-- CreateIndex
CREATE INDEX "StandardCostVersion_itemId_idx" ON "StandardCostVersion"("itemId");

-- CreateIndex
CREATE INDEX "StandardCostVersion_workspaceId_idx" ON "StandardCostVersion"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardCostVersion_itemId_effectiveAt_key" ON "StandardCostVersion"("itemId", "effectiveAt");

-- CreateIndex
CREATE INDEX "VarianceJournal_workspaceId_idx" ON "VarianceJournal"("workspaceId");

-- CreateIndex
CREATE INDEX "VarianceJournal_journalEntryId_idx" ON "VarianceJournal"("journalEntryId");

-- CreateIndex
CREATE INDEX "LandedCost_workspaceId_idx" ON "LandedCost"("workspaceId");

-- CreateIndex
CREATE INDEX "LandedCost_purchaseOrderId_idx" ON "LandedCost"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "LandedCostLine_landedCostId_idx" ON "LandedCostLine"("landedCostId");

-- CreateIndex
CREATE INDEX "LandedCostLine_inventoryCostLayerId_idx" ON "LandedCostLine"("inventoryCostLayerId");

-- CreateIndex
CREATE INDEX "Timesheet_workspaceId_employeeId_idx" ON "Timesheet"("workspaceId", "employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_timesheetId_idx" ON "TimeEntry"("timesheetId");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_workspaceId_idx" ON "TimeEntry"("workspaceId");

-- CreateIndex
CREATE INDEX "TimesheetApproval_timesheetId_idx" ON "TimesheetApproval"("timesheetId");

-- CreateIndex
CREATE INDEX "TimesheetApproval_workspaceId_idx" ON "TimesheetApproval"("workspaceId");

-- CreateIndex
CREATE INDEX "Budget_workspaceId_fiscalYear_idx" ON "Budget"("workspaceId", "fiscalYear");

-- CreateIndex
CREATE INDEX "BudgetLine_budgetId_idx" ON "BudgetLine"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetLine_accountId_idx" ON "BudgetLine"("accountId");

-- CreateIndex
CREATE INDEX "BudgetLine_workspaceId_idx" ON "BudgetLine"("workspaceId");

-- CreateIndex
CREATE INDEX "BudgetVersion_workspaceId_idx" ON "BudgetVersion"("workspaceId");

-- CreateIndex
CREATE INDEX "BudgetVersion_budgetId_idx" ON "BudgetVersion"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetLineVersion_versionId_idx" ON "BudgetLineVersion"("versionId");

-- CreateIndex
CREATE INDEX "BudgetLineVersion_accountId_idx" ON "BudgetLineVersion"("accountId");

-- CreateIndex
CREATE INDEX "CurrencyRevaluationLine_revaluationId_idx" ON "CurrencyRevaluationLine"("revaluationId");

-- CreateIndex
CREATE INDEX "CurrencyRevaluationLine_accountId_idx" ON "CurrencyRevaluationLine"("accountId");

-- CreateIndex
CREATE INDEX "AccountingPeriod_workspaceId_startDate_idx" ON "AccountingPeriod"("workspaceId", "startDate");

-- CreateIndex
CREATE INDEX "ApprovalThreshold_companyId_type_idx" ON "ApprovalThreshold"("companyId", "type");

-- CreateIndex
CREATE INDEX "ApprovalThreshold_companyId_isActive_idx" ON "ApprovalThreshold"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "PostingLock_companyId_module_isActive_idx" ON "PostingLock"("companyId", "module", "isActive");

-- CreateIndex
CREATE INDEX "PostingLock_workspaceId_startDate_endDate_idx" ON "PostingLock"("workspaceId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Reversal_workspaceId_idx" ON "Reversal"("workspaceId");

-- CreateIndex
CREATE INDEX "FinancialStatementSnapshot_workspaceId_type_period_idx" ON "FinancialStatementSnapshot"("workspaceId", "type", "period");

-- CreateIndex
CREATE INDEX "CurrencyRevaluation_companyId_period_idx" ON "CurrencyRevaluation"("companyId", "period");

-- CreateIndex
CREATE INDEX "CurrencyRevaluationEntry_revaluationId_idx" ON "CurrencyRevaluationEntry"("revaluationId");

-- CreateIndex
CREATE INDEX "CurrencyRevaluationEntry_accountId_idx" ON "CurrencyRevaluationEntry"("accountId");

-- CreateIndex
CREATE INDEX "CashFlowCategory_companyId_section_idx" ON "CashFlowCategory"("companyId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "CashFlowCategory_companyId_code_key" ON "CashFlowCategory"("companyId", "code");

-- CreateIndex
CREATE INDEX "CashFlowStatementSnapshot_companyId_period_idx" ON "CashFlowStatementSnapshot"("companyId", "period");

-- CreateIndex
CREATE INDEX "FinancialStatementTemplate_companyId_type_idx" ON "FinancialStatementTemplate"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialStatementTemplate_companyId_type_name_key" ON "FinancialStatementTemplate"("companyId", "type", "name");

-- CreateIndex
CREATE INDEX "ReportSection_templateId_order_idx" ON "ReportSection"("templateId", "order");

-- CreateIndex
CREATE INDEX "KpiDashboard_companyId_idx" ON "KpiDashboard"("companyId");

-- CreateIndex
CREATE INDEX "KpiDashboard_workspaceId_idx" ON "KpiDashboard"("workspaceId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- CreateIndex
CREATE INDEX "FinancialStatementLine_companyId_statementType_idx" ON "FinancialStatementLine"("companyId", "statementType");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialStatementLine_companyId_statementType_lineNumber_key" ON "FinancialStatementLine"("companyId", "statementType", "lineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_companyId_documentType_key" ON "DocumentSequence"("companyId", "documentType");

-- CreateIndex
CREATE INDEX "ClosingEntry_companyId_period_idx" ON "ClosingEntry"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "ClosingEntry_companyId_period_type_key" ON "ClosingEntry"("companyId", "period", "type");

-- CreateIndex
CREATE INDEX "YearEndClose_companyId_status_idx" ON "YearEndClose"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "YearEndClose_companyId_fiscalYear_key" ON "YearEndClose"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "EquityAccount_companyId_idx" ON "EquityAccount"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EquityAccount_companyId_type_key" ON "EquityAccount"("companyId", "type");

-- CreateIndex
CREATE INDEX "Dividend_companyId_paymentDate_idx" ON "Dividend"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "PayrollTaxReturn_companyId_period_idx" ON "PayrollTaxReturn"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollTaxReturn_companyId_period_formType_key" ON "PayrollTaxReturn"("companyId", "period", "formType");

-- CreateIndex
CREATE INDEX "PayrollTaxLiability_companyId_period_idx" ON "PayrollTaxLiability"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollTaxLiability_companyId_type_jurisdiction_period_key" ON "PayrollTaxLiability"("companyId", "type", "jurisdiction", "period");

-- CreateIndex
CREATE INDEX "PayrollTaxPayment_liabilityId_idx" ON "PayrollTaxPayment"("liabilityId");

-- CreateIndex
CREATE INDEX "PayrollTaxPayment_companyId_paymentDate_idx" ON "PayrollTaxPayment"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "AccrualSchedule_companyId_status_idx" ON "AccrualSchedule"("companyId", "status");

-- CreateIndex
CREATE INDEX "AccrualEntry_journalEntryId_idx" ON "AccrualEntry"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "AccrualEntry_scheduleId_periodStart_key" ON "AccrualEntry"("scheduleId", "periodStart");

-- CreateIndex
CREATE INDEX "BankReconciliation_workspaceId_bankAccountId_statementDate_idx" ON "BankReconciliation"("workspaceId", "bankAccountId", "statementDate");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_workspaceId_bankReconciliationId_idx" ON "BankReconciliationLine"("workspaceId", "bankReconciliationId");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_bankTransactionId_idx" ON "BankReconciliationLine"("bankTransactionId");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_journalEntryLineId_idx" ON "BankReconciliationLine"("journalEntryLineId");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_bankReconciliationId_bankTransaction_idx" ON "BankReconciliationLine"("bankReconciliationId", "bankTransactionId");

-- CreateIndex
CREATE INDEX "ContactAddress_workspaceId_contactId_idx" ON "ContactAddress"("workspaceId", "contactId");

-- CreateIndex
CREATE INDEX "ContactCustomField_workspaceId_contactId_idx" ON "ContactCustomField"("workspaceId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSegment_companyId_segmentName_segmentValue_key" ON "AccountSegment"("companyId", "segmentName", "segmentValue");

-- CreateIndex
CREATE INDEX "Account_companyId_name_idx" ON "Account"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntry_workspaceId_date_idx" ON "JournalEntry"("workspaceId", "date");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_date_idx" ON "JournalEntry"("companyId", "date");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_postingStatus_idx" ON "JournalEntry"("companyId", "postingStatus");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_postingStatus_date_idx" ON "JournalEntry"("companyId", "postingStatus", "date");

-- CreateIndex
CREATE INDEX "JournalEntry_deletedAt_idx" ON "JournalEntry"("deletedAt");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_date_postingStatus_deletedAt_idx" ON "JournalEntry"("companyId", "date", "postingStatus", "deletedAt");

-- CreateIndex
CREATE INDEX "JournalEntry_createdById_idx" ON "JournalEntry"("createdById");

-- CreateIndex
CREATE INDEX "JournalEntry_updatedById_idx" ON "JournalEntry"("updatedById");

-- CreateIndex
CREATE INDEX "JournalEntry_reviewedById_idx" ON "JournalEntry"("reviewedById");

-- CreateIndex
CREATE INDEX "JournalEntry_approvedById_idx" ON "JournalEntry"("approvedById");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalId_idx" ON "JournalEntryLine"("journalId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_workspaceId_idx" ON "JournalEntryLine"("workspaceId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_workspaceId_accountId_idx" ON "JournalEntryLine"("workspaceId", "accountId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_workspaceId_accountId_journalId_idx" ON "JournalEntryLine"("workspaceId", "accountId", "journalId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_companyId_accountId_journalId_idx" ON "JournalEntryLine"("companyId", "accountId", "journalId");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_id_idx" ON "Contact"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "ContactEmail_contactId_idx" ON "ContactEmail"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEmail_contactId_email_key" ON "ContactEmail"("contactId", "email");

-- CreateIndex
CREATE INDEX "ContactPhone_contactId_idx" ON "ContactPhone"("contactId");

-- CreateIndex
CREATE INDEX "Customer_workspaceId_idx" ON "Customer"("workspaceId");

-- CreateIndex
CREATE INDEX "Vendor_workspaceId_idx" ON "Vendor"("workspaceId");

-- CreateIndex
CREATE INDEX "Contractor_workspaceId_idx" ON "Contractor"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_companyId_vendorId_key" ON "Contractor"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "ContractorPayment_companyId_paymentDate_idx" ON "ContractorPayment"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "ContractorPayment_contractorId_taxYear_idx" ON "ContractorPayment"("contractorId", "taxYear");

-- CreateIndex
CREATE INDEX "ContractorPayment_vendorId_idx" ON "ContractorPayment"("vendorId");

-- CreateIndex
CREATE INDEX "Form1099_workspaceId_taxYear_idx" ON "Form1099"("workspaceId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "Form1099_companyId_contractorId_taxYear_formType_key" ON "Form1099"("companyId", "contractorId", "taxYear", "formType");

-- CreateIndex
CREATE UNIQUE INDEX "Form1099Box_formId_boxNumber_key" ON "Form1099Box"("formId", "boxNumber");

-- CreateIndex
CREATE INDEX "Item_companyId_idx" ON "Item"("companyId");

-- CreateIndex
CREATE INDEX "PriceList_workspaceId_idx" ON "PriceList"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_workspaceId_name_key" ON "PriceList"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListItem_priceListId_itemId_key" ON "PriceListItem"("priceListId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryCostLayer_companyId_itemId_idx" ON "InventoryCostLayer"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "StockLocation_companyId_name_idx" ON "StockLocation"("companyId", "name");

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_employeeNumber_key" ON "Employee"("companyId", "employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_taxId_key" ON "Employee"("companyId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_ssnHash_key" ON "Employee"("companyId", "ssnHash");

-- CreateIndex
CREATE INDEX "PaySchedule_companyId_idx" ON "PaySchedule"("companyId");

-- CreateIndex
CREATE INDEX "PayrollRun_companyId_status_idx" ON "PayrollRun"("companyId", "status");

-- CreateIndex
CREATE INDEX "PayrollRun_deletedAt_idx" ON "PayrollRun"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_companyId_startDate_endDate_key" ON "PayrollRun"("companyId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PayrollRunEmployee_companyId_idx" ON "PayrollRunEmployee"("companyId");

-- CreateIndex
CREATE INDEX "PayrollRunEmployee_employeeId_idx" ON "PayrollRunEmployee"("employeeId");

-- CreateIndex
CREATE INDEX "Paycheck_companyId_employeeId_idx" ON "Paycheck"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "Paycheck_companyId_templateId_idx" ON "Paycheck"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "Paycheck_deletedAt_idx" ON "Paycheck"("deletedAt");

-- CreateIndex
CREATE INDEX "PaycheckLine_paycheckId_idx" ON "PaycheckLine"("paycheckId");

-- CreateIndex
CREATE INDEX "PaycheckLine_companyId_idx" ON "PaycheckLine"("companyId");

-- CreateIndex
CREATE INDEX "PaycheckTax_paycheckId_idx" ON "PaycheckTax"("paycheckId");

-- CreateIndex
CREATE INDEX "PaycheckTax_companyId_idx" ON "PaycheckTax"("companyId");

-- CreateIndex
CREATE INDEX "EmployeeLoan_companyId_status_idx" ON "EmployeeLoan"("companyId", "status");

-- CreateIndex
CREATE INDEX "EmployeeLoan_employeeId_idx" ON "EmployeeLoan"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLoan_companyId_loanNumber_key" ON "EmployeeLoan"("companyId", "loanNumber");

-- CreateIndex
CREATE INDEX "EmployeeLoanPayment_companyId_employeeId_paymentDate_idx" ON "EmployeeLoanPayment"("companyId", "employeeId", "paymentDate");

-- CreateIndex
CREATE INDEX "EmployeeLoanPayment_loanId_idx" ON "EmployeeLoanPayment"("loanId");

-- CreateIndex
CREATE INDEX "TimeOffBalance_companyId_employeeId_idx" ON "TimeOffBalance"("companyId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeOffBalance_companyId_employeeId_timeOffType_key" ON "TimeOffBalance"("companyId", "employeeId", "timeOffType");

-- CreateIndex
CREATE INDEX "TimeOffRequest_companyId_status_idx" ON "TimeOffRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "TimeOffRequest_employeeId_status_idx" ON "TimeOffRequest"("employeeId", "status");

-- CreateIndex
CREATE INDEX "TimeOffRequest_approverId_idx" ON "TimeOffRequest"("approverId");

-- CreateIndex
CREATE INDEX "ThirteenthMonthPay_companyId_taxYear_idx" ON "ThirteenthMonthPay"("companyId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "ThirteenthMonthPay_companyId_employeeId_taxYear_key" ON "ThirteenthMonthPay"("companyId", "employeeId", "taxYear");

-- CreateIndex
CREATE INDEX "GovernmentContributionPayment_companyId_period_contribution_idx" ON "GovernmentContributionPayment"("companyId", "period", "contributionType");

-- CreateIndex
CREATE INDEX "GovernmentContributionPayment_employeeId_idx" ON "GovernmentContributionPayment"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollAccrual_companyId_periodEnd_idx" ON "PayrollAccrual"("companyId", "periodEnd");

-- CreateIndex
CREATE INDEX "PayrollAccrual_employeeId_idx" ON "PayrollAccrual"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollAccrual_journalEntryId_idx" ON "PayrollAccrual"("journalEntryId");

-- CreateIndex
CREATE INDEX "StockLevel_companyId_itemId_idx" ON "StockLevel"("companyId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_companyId_itemId_stockLocationId_key" ON "StockLevel"("companyId", "itemId", "stockLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_workspaceId_transactionNumber_idx" ON "InventoryTransaction"("workspaceId", "transactionNumber");

-- CreateIndex
CREATE INDEX "InventoryTransaction_workspaceId_createdAt_idx" ON "InventoryTransaction"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryTransaction_journalEntryId_idx" ON "InventoryTransaction"("journalEntryId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_deletedAt_idx" ON "InventoryTransaction"("deletedAt");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_workspaceId_itemId_idx" ON "InventoryTransactionLine"("workspaceId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_workspaceId_transactionId_idx" ON "InventoryTransactionLine"("workspaceId", "transactionId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_companyId_itemId_idx" ON "InventoryTransactionLine"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_itemId_stockLocationId_idx" ON "InventoryTransactionLine"("itemId", "stockLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_transactionId_itemId_idx" ON "InventoryTransactionLine"("transactionId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_serialNumber_idx" ON "InventoryTransactionLine"("serialNumber");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_lotNumber_idx" ON "InventoryTransactionLine"("lotNumber");

-- CreateIndex
CREATE INDEX "InventoryTransactionLine_expirationDate_idx" ON "InventoryTransactionLine"("expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransactionLine_itemId_serialNumber_key" ON "InventoryTransactionLine"("itemId", "serialNumber");

-- CreateIndex
CREATE INDEX "InventoryReserve_companyId_itemId_idx" ON "InventoryReserve"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "COGSRecognition_companyId_recognizedAt_idx" ON "COGSRecognition"("companyId", "recognizedAt");

-- CreateIndex
CREATE INDEX "COGSRecognition_invoiceLineId_idx" ON "COGSRecognition"("invoiceLineId");

-- CreateIndex
CREATE INDEX "COGSRecognition_inventoryTxLineId_idx" ON "COGSRecognition"("inventoryTxLineId");

-- CreateIndex
CREATE INDEX "COGSRecognition_journalEntryId_idx" ON "COGSRecognition"("journalEntryId");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentRequest_workspaceId_status_idx" ON "InventoryAdjustmentRequest"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentRequest_companyId_status_idx" ON "InventoryAdjustmentRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentRequest_transactionId_idx" ON "InventoryAdjustmentRequest"("transactionId");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentApproval_requestId_idx" ON "InventoryAdjustmentApproval"("requestId");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentApproval_approverId_idx" ON "InventoryAdjustmentApproval"("approverId");

-- CreateIndex
CREATE INDEX "AssemblyBuild_companyId_idx" ON "AssemblyBuild"("companyId");

-- CreateIndex
CREATE INDEX "AssemblyBuild_itemId_idx" ON "AssemblyBuild"("itemId");

-- CreateIndex
CREATE INDEX "AssemblyComponent_assemblyBuildId_idx" ON "AssemblyComponent"("assemblyBuildId");

-- CreateIndex
CREATE INDEX "AssemblyComponent_itemId_idx" ON "AssemblyComponent"("itemId");

-- CreateIndex
CREATE INDEX "ProductionRun_companyId_itemId_idx" ON "ProductionRun"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "ProductionRun_journalEntryId_idx" ON "ProductionRun"("journalEntryId");

-- CreateIndex
CREATE INDEX "TaxJurisdiction_countryId_idx" ON "TaxJurisdiction"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_countryId_region_code_key" ON "TaxJurisdiction"("countryId", "region", "code");

-- CreateIndex
CREATE INDEX "TaxAuthority_countryId_idx" ON "TaxAuthority"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxAuthority_countryId_name_key" ON "TaxAuthority"("countryId", "name");

-- CreateIndex
CREATE INDEX "TaxObligation_companyId_dueDate_status_idx" ON "TaxObligation"("companyId", "dueDate", "status");

-- CreateIndex
CREATE INDEX "TaxObligation_authorityId_status_idx" ON "TaxObligation"("authorityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TaxObligation_companyId_authorityId_formType_periodStart_key" ON "TaxObligation"("companyId", "authorityId", "formType", "periodStart");

-- CreateIndex
CREATE INDEX "TaxAuditCase_companyId_status_idx" ON "TaxAuditCase"("companyId", "status");

-- CreateIndex
CREATE INDEX "TaxAuditCase_authorityId_status_idx" ON "TaxAuditCase"("authorityId", "status");

-- CreateIndex
CREATE INDEX "TaxAuthorityCommunication_companyId_authorityId_idx" ON "TaxAuthorityCommunication"("companyId", "authorityId");

-- CreateIndex
CREATE INDEX "TaxAuthorityCommunication_authorityId_status_idx" ON "TaxAuthorityCommunication"("authorityId", "status");

-- CreateIndex
CREATE INDEX "TaxOptimizationSuggestion_companyId_status_idx" ON "TaxOptimizationSuggestion"("companyId", "status");

-- CreateIndex
CREATE INDEX "TaxRiskScore_companyId_period_idx" ON "TaxRiskScore"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRiskScore_companyId_period_key" ON "TaxRiskScore"("companyId", "period");

-- CreateIndex
CREATE INDEX "TaxReturn_companyId_periodStart_periodEnd_idx" ON "TaxReturn"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "TaxReturn_filingDeadline_idx" ON "TaxReturn"("filingDeadline");

-- CreateIndex
CREATE INDEX "TaxReturn_attachmentId_idx" ON "TaxReturn"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxReturn_companyId_authorityId_formType_periodStart_key" ON "TaxReturn"("companyId", "authorityId", "formType", "periodStart");

-- CreateIndex
CREATE INDEX "TaxReturnLine_taxReturnId_idx" ON "TaxReturnLine"("taxReturnId");

-- CreateIndex
CREATE INDEX "TaxReturnLine_taxRateId_idx" ON "TaxReturnLine"("taxRateId");

-- CreateIndex
CREATE INDEX "TaxReturnLine_jurisdictionId_idx" ON "TaxReturnLine"("jurisdictionId");

-- CreateIndex
CREATE INDEX "TaxPayment_taxReturnId_paymentDate_idx" ON "TaxPayment"("taxReturnId", "paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaxReturnAmendment_taxReturnId_amendmentNumber_key" ON "TaxReturnAmendment"("taxReturnId", "amendmentNumber");

-- CreateIndex
CREATE INDEX "TaxCalculationAudit_companyId_calculatedAt_idx" ON "TaxCalculationAudit"("companyId", "calculatedAt");

-- CreateIndex
CREATE INDEX "TaxCalculationAudit_calculationType_calculationId_idx" ON "TaxCalculationAudit"("calculationType", "calculationId");

-- CreateIndex
CREATE INDEX "TaxCalculationAudit_calculatedById_idx" ON "TaxCalculationAudit"("calculatedById");

-- CreateIndex
CREATE INDEX "TaxPeriodLock_companyId_period_idx" ON "TaxPeriodLock"("companyId", "period");

-- CreateIndex
CREATE INDEX "TaxPeriodLock_countryId_taxType_period_idx" ON "TaxPeriodLock"("countryId", "taxType", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TaxPeriodLock_companyId_countryId_taxType_period_key" ON "TaxPeriodLock"("companyId", "countryId", "taxType", "period");

-- CreateIndex
CREATE INDEX "TaxFilingPackage_companyId_submittedAt_idx" ON "TaxFilingPackage"("companyId", "submittedAt");

-- CreateIndex
CREATE INDEX "TaxFilingPackage_companyId_packageType_idx" ON "TaxFilingPackage"("companyId", "packageType");

-- CreateIndex
CREATE INDEX "WithholdingTaxCertificate_vendorId_periodCovered_idx" ON "WithholdingTaxCertificate"("vendorId", "periodCovered");

-- CreateIndex
CREATE UNIQUE INDEX "WithholdingTaxCertificate_companyId_certificateNumber_key" ON "WithholdingTaxCertificate"("companyId", "certificateNumber");

-- CreateIndex
CREATE INDEX "TaxCalendar_companyId_dueDate_completedAt_idx" ON "TaxCalendar"("companyId", "dueDate", "completedAt");

-- CreateIndex
CREATE INDEX "TaxCalendar_countryId_taxType_dueDate_idx" ON "TaxCalendar"("countryId", "taxType", "dueDate");

-- CreateIndex
CREATE INDEX "UserActionAudit_userId_timestamp_idx" ON "UserActionAudit"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "UserActionAudit_companyId_timestamp_idx" ON "UserActionAudit"("companyId", "timestamp");

-- CreateIndex
CREATE INDEX "TaxFilingBatch_companyId_batchType_period_idx" ON "TaxFilingBatch"("companyId", "batchType", "period");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_companyId_dueDate_status_idx" ON "ComplianceDeadline"("companyId", "dueDate", "status");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_countryId_deadlineType_dueDate_idx" ON "ComplianceDeadline"("countryId", "deadlineType", "dueDate");

-- CreateIndex
CREATE INDEX "TaxClearanceCertificate_companyId_expiryDate_idx" ON "TaxClearanceCertificate"("companyId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaxClearanceCertificate_companyId_certificateNumber_key" ON "TaxClearanceCertificate"("companyId", "certificateNumber");

-- CreateIndex
CREATE INDEX "BusinessPermit_companyId_expiryDate_idx" ON "BusinessPermit"("companyId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPermit_companyId_permitNumber_key" ON "BusinessPermit"("companyId", "permitNumber");

-- CreateIndex
CREATE INDEX "TaxAttributeCarryforward_companyId_attributeType_status_idx" ON "TaxAttributeCarryforward"("companyId", "attributeType", "status");

-- CreateIndex
CREATE INDEX "TaxAttributeCarryforward_countryId_jurisdictionId_idx" ON "TaxAttributeCarryforward"("countryId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "UncertainTaxPosition_companyId_period_idx" ON "UncertainTaxPosition"("companyId", "period");

-- CreateIndex
CREATE INDEX "UncertainTaxPosition_taxAuthorityId_idx" ON "UncertainTaxPosition"("taxAuthorityId");

-- CreateIndex
CREATE INDEX "TaxIncentive_companyId_status_idx" ON "TaxIncentive"("companyId", "status");

-- CreateIndex
CREATE INDEX "TaxIncentive_countryId_idx" ON "TaxIncentive"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxIncentive_companyId_incentiveType_effectiveDate_key" ON "TaxIncentive"("companyId", "incentiveType", "effectiveDate");

-- CreateIndex
CREATE INDEX "TransferPricingDocument_companyId_fiscalYear_idx" ON "TransferPricingDocument"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "TransferPricingDocument_relatedPartyId_idx" ON "TransferPricingDocument"("relatedPartyId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferPricingDocument_companyId_relatedPartyId_fiscalYear_key" ON "TransferPricingDocument"("companyId", "relatedPartyId", "fiscalYear", "documentType");

-- CreateIndex
CREATE INDEX "AdvancePricingAgreement_companyId_status_idx" ON "AdvancePricingAgreement"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancePricingAgreement_companyId_taxAuthorityId_agreementN_key" ON "AdvancePricingAgreement"("companyId", "taxAuthorityId", "agreementNumber");

-- CreateIndex
CREATE INDEX "DeferredTax_companyId_period_idx" ON "DeferredTax"("companyId", "period");

-- CreateIndex
CREATE INDEX "DeferredTax_companyId_type_idx" ON "DeferredTax"("companyId", "type");

-- CreateIndex
CREATE INDEX "DeferredTax_companyId_reversalPeriod_idx" ON "DeferredTax"("companyId", "reversalPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "DeferredTax_companyId_period_sourceType_sourceId_key" ON "DeferredTax"("companyId", "period", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "FinancialRatio_companyId_period_idx" ON "FinancialRatio"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialRatio_companyId_period_ratioType_key" ON "FinancialRatio"("companyId", "period", "ratioType");

-- CreateIndex
CREATE INDEX "EsgMetric_companyId_period_idx" ON "EsgMetric"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "EsgMetric_companyId_metricType_period_key" ON "EsgMetric"("companyId", "metricType", "period");

-- CreateIndex
CREATE INDEX "TaxRate_companyId_jurisdictionId_effectiveFrom_idx" ON "TaxRate"("companyId", "jurisdictionId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TaxRate_countryId_jurisdictionId_idx" ON "TaxRate"("countryId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "TaxRate_taxType_idx" ON "TaxRate"("taxType");

-- CreateIndex
CREATE INDEX "TaxRate_globalTaxType_idx" ON "TaxRate"("globalTaxType");

-- CreateIndex
CREATE INDEX "TaxRate_jurisdictionLevel_idx" ON "TaxRate"("jurisdictionLevel");

-- CreateIndex
CREATE INDEX "TaxRate_companyId_taxType_effectiveFrom_idx" ON "TaxRate"("companyId", "taxType", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TaxRate_countryId_jurisdictionId_taxType_effectiveFrom_idx" ON "TaxRate"("countryId", "jurisdictionId", "taxType", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TaxRule_countryId_jurisdictionId_idx" ON "TaxRule"("countryId", "jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_companyId_code_key" ON "TaxCode"("companyId", "code");

-- CreateIndex
CREATE INDEX "TaxCodeRate_taxCodeId_taxRateId_idx" ON "TaxCodeRate"("taxCodeId", "taxRateId");

-- CreateIndex
CREATE INDEX "TaxCodeRate_companyId_taxCodeId_idx" ON "TaxCodeRate"("companyId", "taxCodeId");

-- CreateIndex
CREATE INDEX "LineTax_companyId_invoiceLineId_billLineId_idx" ON "LineTax"("companyId", "invoiceLineId", "billLineId");

-- CreateIndex
CREATE INDEX "LineTax_companyId_purchaseOrderLineId_idx" ON "LineTax"("companyId", "purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "LineTax_quoteLineId_idx" ON "LineTax"("quoteLineId");

-- CreateIndex
CREATE INDEX "LineTax_taxCodeId_taxRateId_idx" ON "LineTax"("taxCodeId", "taxRateId");

-- CreateIndex
CREATE INDEX "LineTax_companyId_invoiceLineId_idx" ON "LineTax"("companyId", "invoiceLineId");

-- CreateIndex
CREATE INDEX "LineTax_companyId_billLineId_idx" ON "LineTax"("companyId", "billLineId");

-- CreateIndex
CREATE INDEX "RevenueSchedule_companyId_status_idx" ON "RevenueSchedule"("companyId", "status");

-- CreateIndex
CREATE INDEX "RevenueSchedule_invoiceLineId_idx" ON "RevenueSchedule"("invoiceLineId");

-- CreateIndex
CREATE INDEX "TaxCodeAccount_companyId_taxCodeId_accountId_idx" ON "TaxCodeAccount"("companyId", "taxCodeId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCodeAccount_companyId_taxCodeId_accountId_key" ON "TaxCodeAccount"("companyId", "taxCodeId", "accountId");

-- CreateIndex
CREATE INDEX "SalesTaxReturn_workspaceId_periodStart_periodEnd_idx" ON "SalesTaxReturn"("workspaceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SalesTaxReturn_companyId_periodStart_periodEnd_idx" ON "SalesTaxReturn"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SalesTaxReturn_status_idx" ON "SalesTaxReturn"("status");

-- CreateIndex
CREATE INDEX "SalesTaxReturnLine_returnId_idx" ON "SalesTaxReturnLine"("returnId");

-- CreateIndex
CREATE INDEX "SalesTaxReturnLine_taxRateId_idx" ON "SalesTaxReturnLine"("taxRateId");

-- CreateIndex
CREATE INDEX "SalesTaxReturnLine_taxJurisdictionId_idx" ON "SalesTaxReturnLine"("taxJurisdictionId");

-- CreateIndex
CREATE INDEX "SalesTaxPayment_workspaceId_paymentDate_idx" ON "SalesTaxPayment"("workspaceId", "paymentDate");

-- CreateIndex
CREATE INDEX "SalesTaxPayment_companyId_paymentDate_idx" ON "SalesTaxPayment"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "SalesTaxPayment_returnId_idx" ON "SalesTaxPayment"("returnId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_workspaceId_name_key" ON "Role"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Approval_workspaceId_entityType_entityId_idx" ON "Approval"("workspaceId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Revaluation_workspaceId_period_idx" ON "Revaluation"("workspaceId", "period");

-- CreateIndex
CREATE INDEX "LocalTaxTypeConfig_countryId_idx" ON "LocalTaxTypeConfig"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "LocalTaxTypeConfig_countryId_taxType_key" ON "LocalTaxTypeConfig"("countryId", "taxType");

-- CreateIndex
CREATE INDEX "WithholdingTaxDeduction_companyId_idx" ON "WithholdingTaxDeduction"("companyId");

-- CreateIndex
CREATE INDEX "WithholdingTaxDeduction_jurisdictionId_idx" ON "WithholdingTaxDeduction"("jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "WithholdingTaxDeduction_companyId_vendorId_deductionType_key" ON "WithholdingTaxDeduction"("companyId", "vendorId", "deductionType");

-- CreateIndex
CREATE INDEX "FinalTaxDeduction_companyId_idx" ON "FinalTaxDeduction"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalTaxDeduction_companyId_vendorId_deductionType_key" ON "FinalTaxDeduction"("companyId", "vendorId", "deductionType");

-- CreateIndex
CREATE INDEX "PercentageTax_companyId_idx" ON "PercentageTax"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PercentageTax_companyId_taxType_key" ON "PercentageTax"("companyId", "taxType");

-- CreateIndex
CREATE INDEX "PhilippinePayrollDeduction_companyId_employeeId_period_idx" ON "PhilippinePayrollDeduction"("companyId", "employeeId", "period");

-- CreateIndex
CREATE INDEX "PhilippinePayrollDeduction_deductionType_idx" ON "PhilippinePayrollDeduction"("deductionType");

-- CreateIndex
CREATE UNIQUE INDEX "PhilippinePayrollDeduction_companyId_employeeId_period_dedu_key" ON "PhilippinePayrollDeduction"("companyId", "employeeId", "period", "deductionType");

-- CreateIndex
CREATE INDEX "LocalTaxObligation_companyId_jurisdiction_taxType_idx" ON "LocalTaxObligation"("companyId", "jurisdiction", "taxType");

-- CreateIndex
CREATE INDEX "LocalTaxObligation_companyId_dueDate_idx" ON "LocalTaxObligation"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "LocalTaxObligation_companyId_status_idx" ON "LocalTaxObligation"("companyId", "status");

-- CreateIndex
CREATE INDEX "VatLedger_companyId_period_idx" ON "VatLedger"("companyId", "period");

-- CreateIndex
CREATE INDEX "VatLedger_vatRegistrationId_period_idx" ON "VatLedger"("vatRegistrationId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "VatLedger_companyId_vatRegistrationId_period_key" ON "VatLedger"("companyId", "vatRegistrationId", "period");

-- CreateIndex
CREATE INDEX "VatRegistration_companyId_isActive_idx" ON "VatRegistration"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VatRegistration_companyId_countryId_vatNumber_key" ON "VatRegistration"("companyId", "countryId", "vatNumber");

-- CreateIndex
CREATE INDEX "VatTransaction_companyId_transactionDate_idx" ON "VatTransaction"("companyId", "transactionDate");

-- CreateIndex
CREATE INDEX "VatTransaction_vatRegistrationId_transactionDate_idx" ON "VatTransaction"("vatRegistrationId", "transactionDate");

-- CreateIndex
CREATE INDEX "VatTransaction_sourceType_sourceId_idx" ON "VatTransaction"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "BirFormTemplate_countryId_idx" ON "BirFormTemplate"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "BirFormTemplate_countryId_formType_key" ON "BirFormTemplate"("countryId", "formType");

-- CreateIndex
CREATE INDEX "BirFormSubmission_companyId_formType_idx" ON "BirFormSubmission"("companyId", "formType");

-- CreateIndex
CREATE INDEX "BirFormSubmission_companyId_period_idx" ON "BirFormSubmission"("companyId", "period");

-- CreateIndex
CREATE INDEX "BirFormSubmission_status_idx" ON "BirFormSubmission"("status");

-- CreateIndex
CREATE INDEX "BirFormSubmission_attachmentId_idx" ON "BirFormSubmission"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "BirFormSubmission_companyId_formType_period_key" ON "BirFormSubmission"("companyId", "formType", "period");

-- CreateIndex
CREATE INDEX "Form2307_companyId_period_idx" ON "Form2307"("companyId", "period");

-- CreateIndex
CREATE INDEX "Form2307_supplierId_period_idx" ON "Form2307"("supplierId", "period");

-- CreateIndex
CREATE INDEX "Form2307_journalEntryId_idx" ON "Form2307"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Form2307_companyId_certificateNumber_key" ON "Form2307"("companyId", "certificateNumber");

-- CreateIndex
CREATE INDEX "AlphalistEntry_companyId_taxYear_idx" ON "AlphalistEntry"("companyId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "AlphalistEntry_companyId_taxId_taxYear_key" ON "AlphalistEntry"("companyId", "taxId", "taxYear");

-- CreateIndex
CREATE INDEX "ChartOfAccountsTemplate_countryId_isDefault_idx" ON "ChartOfAccountsTemplate"("countryId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccountsTemplate_countryId_name_key" ON "ChartOfAccountsTemplate"("countryId", "name");

-- CreateIndex
CREATE INDEX "CompanyChartOfAccounts_companyId_appliedAt_idx" ON "CompanyChartOfAccounts"("companyId", "appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyChartOfAccounts_companyId_templateId_version_key" ON "CompanyChartOfAccounts"("companyId", "templateId", "version");

-- CreateIndex
CREATE INDEX "DefaultAccountMapping_accountId_idx" ON "DefaultAccountMapping"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultAccountMapping_companyId_accountType_key" ON "DefaultAccountMapping"("companyId", "accountType");

-- CreateIndex
CREATE INDEX "PhilippineFinancialStatementTemplate_companyId_idx" ON "PhilippineFinancialStatementTemplate"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PhilippineFinancialStatementTemplate_companyId_statementTyp_key" ON "PhilippineFinancialStatementTemplate"("companyId", "statementType");

-- CreateIndex
CREATE INDEX "Attachment_workspaceId_idx" ON "Attachment"("workspaceId");

-- CreateIndex
CREATE INDEX "Attachment_workspaceId_entityType_entityId_idx" ON "Attachment"("workspaceId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Attachment_isPublic_idx" ON "Attachment"("isPublic");

-- CreateIndex
CREATE INDEX "Attachment_uploadedAt_idx" ON "Attachment"("uploadedAt");

-- CreateIndex
CREATE INDEX "Quote_workspaceId_status_idx" ON "Quote"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Quote_companyId_customerId_idx" ON "Quote"("companyId", "customerId");

-- CreateIndex
CREATE INDEX "Quote_deletedAt_idx" ON "Quote"("deletedAt");

-- CreateIndex
CREATE INDEX "QuoteLine_quoteId_idx" ON "QuoteLine"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteLine_companyId_idx" ON "QuoteLine"("companyId");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_status_dueDate_idx" ON "Invoice"("workspaceId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_issuedAt_idx" ON "Invoice"("workspaceId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_workspaceId_customerId_status_idx" ON "Invoice"("workspaceId", "customerId", "status");

-- CreateIndex
CREATE INDEX "Invoice_companyId_customerId_status_idx" ON "Invoice"("companyId", "customerId", "status");

-- CreateIndex
CREATE INDEX "Invoice_companyId_issuedAt_idx" ON "Invoice"("companyId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_createdById_idx" ON "Invoice"("createdById");

-- CreateIndex
CREATE INDEX "Invoice_updatedById_idx" ON "Invoice"("updatedById");

-- CreateIndex
CREATE INDEX "Invoice_companyId_postingStatus_issuedAt_idx" ON "Invoice"("companyId", "postingStatus", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_deletedAt_idx" ON "Invoice"("deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_dueDate_deletedAt_idx" ON "Invoice"("companyId", "status", "dueDate", "deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_companyId_dueDate_balance_status_idx" ON "Invoice"("companyId", "dueDate", "balance", "status");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_dueDate_balance_idx" ON "Invoice"("companyId", "status", "dueDate", "balance");

-- CreateIndex
CREATE INDEX "Invoice_companyId_paymentStatus_dueDate_idx" ON "Invoice"("companyId", "paymentStatus", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_companyId_deletedAt_idx" ON "Invoice"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_companyId_dueDate_balance_status_deletedAt_idx" ON "Invoice"("companyId", "dueDate", "balance", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_companyId_customerId_dueDate_balance_idx" ON "Invoice"("companyId", "customerId", "dueDate", "balance");

-- CreateIndex
CREATE INDEX "Invoice_companyId_templateId_idx" ON "Invoice"("companyId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_invoiceNumber_key" ON "Invoice"("companyId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "CreditNote_companyId_customerId_idx" ON "CreditNote"("companyId", "customerId");

-- CreateIndex
CREATE INDEX "CreditNote_journalEntryId_idx" ON "CreditNote"("journalEntryId");

-- CreateIndex
CREATE INDEX "CreditNote_companyId_templateId_idx" ON "CreditNote"("companyId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditNote_companyId_creditNoteNumber_key" ON "CreditNote"("companyId", "creditNoteNumber");

-- CreateIndex
CREATE INDEX "DebitNote_companyId_vendorId_idx" ON "DebitNote"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "DebitNote_journalEntryId_idx" ON "DebitNote"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "DebitNote_companyId_debitNoteNumber_key" ON "DebitNote"("companyId", "debitNoteNumber");

-- CreateIndex
CREATE INDEX "RecurringInvoice_workspaceId_nextRun_idx" ON "RecurringInvoice"("workspaceId", "nextRun");

-- CreateIndex
CREATE INDEX "RecurringInvoice_companyId_nextRun_idx" ON "RecurringInvoice"("companyId", "nextRun");

-- CreateIndex
CREATE INDEX "RecurringInvoice_deletedAt_idx" ON "RecurringInvoice"("deletedAt");

-- CreateIndex
CREATE INDEX "RecurringSchedule_workspaceId_status_idx" ON "RecurringSchedule"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "RecurringSchedule_nextScheduledAt_idx" ON "RecurringSchedule"("nextScheduledAt");

-- CreateIndex
CREATE INDEX "RecurringSchedule_entityType_entityId_idx" ON "RecurringSchedule"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "RecurringSchedule_companyId_idx" ON "RecurringSchedule"("companyId");

-- CreateIndex
CREATE INDEX "RecurringSchedule_practiceId_idx" ON "RecurringSchedule"("practiceId");

-- CreateIndex
CREATE INDEX "RecurringExecutionLog_scheduleId_executedAt_idx" ON "RecurringExecutionLog"("scheduleId", "executedAt");

-- CreateIndex
CREATE INDEX "RecurringExecutionLog_status_idx" ON "RecurringExecutionLog"("status");

-- CreateIndex
CREATE INDEX "ExpenseClaim_workspaceId_employeeId_idx" ON "ExpenseClaim"("workspaceId", "employeeId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_companyId_status_idx" ON "ExpenseClaim"("companyId", "status");

-- CreateIndex
CREATE INDEX "ExpenseClaimLine_expenseClaimId_idx" ON "ExpenseClaimLine"("expenseClaimId");

-- CreateIndex
CREATE INDEX "Payout_workspaceId_idx" ON "Payout"("workspaceId");

-- CreateIndex
CREATE INDEX "Payout_companyId_idx" ON "Payout"("companyId");

-- CreateIndex
CREATE INDEX "PaymentGatewaySettlement_workspaceId_companyId_gatewayName_idx" ON "PaymentGatewaySettlement"("workspaceId", "companyId", "gatewayName");

-- CreateIndex
CREATE INDEX "PaymentGatewaySettlement_companyId_periodStart_periodEnd_idx" ON "PaymentGatewaySettlement"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGatewaySettlement_gatewayName_externalId_key" ON "PaymentGatewaySettlement"("gatewayName", "externalId");

-- CreateIndex
CREATE INDEX "PaymentGatewayPayout_settlementId_idx" ON "PaymentGatewayPayout"("settlementId");

-- CreateIndex
CREATE INDEX "PaymentGatewayPayout_externalPayoutId_idx" ON "PaymentGatewayPayout"("externalPayoutId");

-- CreateIndex
CREATE INDEX "SavedReport_workspaceId_category_idx" ON "SavedReport"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "SavedReport_companyId_idx" ON "SavedReport"("companyId");

-- CreateIndex
CREATE INDEX "SavedReport_workspaceId_companyId_isFavorite_createdBy_idx" ON "SavedReport"("workspaceId", "companyId", "isFavorite", "createdBy");

-- CreateIndex
CREATE INDEX "SavedReport_workspaceId_companyId_category_createdAt_idx" ON "SavedReport"("workspaceId", "companyId", "category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedReport_workspaceId_companyId_name_key" ON "SavedReport"("workspaceId", "companyId", "name");

-- CreateIndex
CREATE INDEX "CustomReportBuilder_companyId_idx" ON "CustomReportBuilder"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTaxInfo_employeeId_key" ON "EmployeeTaxInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "FormI9_employeeId_key" ON "FormI9"("employeeId");

-- CreateIndex
CREATE INDEX "InvoiceLine_workspaceId_idx" ON "InvoiceLine"("workspaceId");

-- CreateIndex
CREATE INDEX "InvoiceLine_workspaceId_itemId_idx" ON "InvoiceLine"("workspaceId", "itemId");

-- CreateIndex
CREATE INDEX "InvoiceLine_workspaceId_invoiceId_idx" ON "InvoiceLine"("workspaceId", "invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceLine_companyId_invoiceId_idx" ON "InvoiceLine"("companyId", "invoiceId");

-- CreateIndex
CREATE INDEX "PaymentReceived_workspaceId_paymentDate_idx" ON "PaymentReceived"("workspaceId", "paymentDate");

-- CreateIndex
CREATE INDEX "PaymentReceived_createdById_idx" ON "PaymentReceived"("createdById");

-- CreateIndex
CREATE INDEX "PaymentReceived_updatedById_idx" ON "PaymentReceived"("updatedById");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_idx" ON "PaymentReceived"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "PaymentReceived_bankAccountId_idx" ON "PaymentReceived"("bankAccountId");

-- CreateIndex
CREATE INDEX "PaymentReceived_journalEntryId_idx" ON "PaymentReceived"("journalEntryId");

-- CreateIndex
CREATE INDEX "PaymentReceived_undepositedBatchId_idx" ON "PaymentReceived"("undepositedBatchId");

-- CreateIndex
CREATE INDEX "PaymentReceived_deletedAt_idx" ON "PaymentReceived"("deletedAt");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_deletedAt_idx" ON "PaymentReceived"("companyId", "paymentDate", "deletedAt");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_isDeposited_deletedAt_idx" ON "PaymentReceived"("companyId", "paymentDate", "isDeposited", "deletedAt");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_workspaceId_invoiceId_idx" ON "InvoicePaymentApplication"("workspaceId", "invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_workspaceId_paymentId_idx" ON "InvoicePaymentApplication"("workspaceId", "paymentId");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_paymentId_idx" ON "InvoicePaymentApplication"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoicePaymentApplication_invoiceId_paymentId_key" ON "InvoicePaymentApplication"("invoiceId", "paymentId");

-- CreateIndex
CREATE INDEX "DunningProfile_workspaceId_idx" ON "DunningProfile"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "DunningProfile_companyId_name_key" ON "DunningProfile"("companyId", "name");

-- CreateIndex
CREATE INDEX "DunningStep_profileId_idx" ON "DunningStep"("profileId");

-- CreateIndex
CREATE INDEX "DunningRun_profileId_runDate_idx" ON "DunningRun"("profileId", "runDate");

-- CreateIndex
CREATE INDEX "DunningRun_companyId_idx" ON "DunningRun"("companyId");

-- CreateIndex
CREATE INDEX "DunningNotice_workspaceId_status_idx" ON "DunningNotice"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "DunningNotice_companyId_sentAt_idx" ON "DunningNotice"("companyId", "sentAt");

-- CreateIndex
CREATE INDEX "DunningNotice_invoiceId_idx" ON "DunningNotice"("invoiceId");

-- CreateIndex
CREATE INDEX "DunningNotice_customerId_idx" ON "DunningNotice"("customerId");

-- CreateIndex
CREATE INDEX "CustomerStatement_workspaceId_customerId_idx" ON "CustomerStatement"("workspaceId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerStatement_companyId_periodStart_periodEnd_idx" ON "CustomerStatement"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "CustomerStatement_companyId_templateId_idx" ON "CustomerStatement"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "PaymentReminder_workspaceId_remindAt_idx" ON "PaymentReminder"("workspaceId", "remindAt");

-- CreateIndex
CREATE INDEX "PaymentReminder_companyId_remindAt_idx" ON "PaymentReminder"("companyId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_workspaceId_remindAt_idx" ON "SubscriptionReminder"("workspaceId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_companyId_remindAt_idx" ON "SubscriptionReminder"("companyId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_practiceId_remindAt_idx" ON "SubscriptionReminder"("practiceId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_subscriptionId_remindAt_idx" ON "SubscriptionReminder"("subscriptionId", "remindAt");

-- CreateIndex
CREATE INDEX "DisputeReason_workspaceId_idx" ON "DisputeReason"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeReason_workspaceId_name_key" ON "DisputeReason"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Dispute_workspaceId_status_idx" ON "Dispute"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Dispute_companyId_status_idx" ON "Dispute"("companyId", "status");

-- CreateIndex
CREATE INDEX "Dispute_invoiceId_idx" ON "Dispute"("invoiceId");

-- CreateIndex
CREATE INDEX "Chargeback_workspaceId_status_idx" ON "Chargeback"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Chargeback_companyId_status_idx" ON "Chargeback"("companyId", "status");

-- CreateIndex
CREATE INDEX "Chargeback_invoiceId_idx" ON "Chargeback"("invoiceId");

-- CreateIndex
CREATE INDEX "Chargeback_paymentId_idx" ON "Chargeback"("paymentId");

-- CreateIndex
CREATE INDEX "BankFeedRule_companyId_isActive_idx" ON "BankFeedRule"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "BankFeedConnection_workspaceId_idx" ON "BankFeedConnection"("workspaceId");

-- CreateIndex
CREATE INDEX "BankFeedConnection_companyId_idx" ON "BankFeedConnection"("companyId");

-- CreateIndex
CREATE INDEX "BankFeedConnection_status_idx" ON "BankFeedConnection"("status");

-- CreateIndex
CREATE INDEX "BankFeedAccount_bankAccountId_idx" ON "BankFeedAccount"("bankAccountId");

-- CreateIndex
CREATE INDEX "BankFeedAccount_companyId_idx" ON "BankFeedAccount"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "BankFeedAccount_connectionId_externalAccountId_key" ON "BankFeedAccount"("connectionId", "externalAccountId");

-- CreateIndex
CREATE INDEX "BankFeedImport_connectionId_startedAt_idx" ON "BankFeedImport"("connectionId", "startedAt");

-- CreateIndex
CREATE INDEX "BankFeedImport_status_idx" ON "BankFeedImport"("status");

-- CreateIndex
CREATE INDEX "BankFeedImport_companyId_idx" ON "BankFeedImport"("companyId");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_companyId_date_idx" ON "BankTransactionRaw"("companyId", "date");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_companyId_date_amount_idx" ON "BankTransactionRaw"("companyId", "date", "amount");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_companyId_bankAccountId_date_idx" ON "BankTransactionRaw"("companyId", "bankAccountId", "date");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_companyId_bankAccountId_amount_date_desc_idx" ON "BankTransactionRaw"("companyId", "bankAccountId", "amount", "date", "description");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_bankAccountId_date_idx" ON "BankTransactionRaw"("bankAccountId", "date");

-- CreateIndex
CREATE INDEX "BankTransactionRaw_bankTransactionId_idx" ON "BankTransactionRaw"("bankTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransactionRaw_bankFeedAccountId_externalId_key" ON "BankTransactionRaw"("bankFeedAccountId", "externalId");

-- CreateIndex
CREATE INDEX "BankAccount_workspaceId_idx" ON "BankAccount"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_workspaceId_institution_accountNumber_key" ON "BankAccount"("workspaceId", "institution", "accountNumber");

-- CreateIndex
CREATE INDEX "BankTransaction_workspaceId_idx" ON "BankTransaction"("workspaceId");

-- CreateIndex
CREATE INDEX "BankTransaction_workspaceId_date_idx" ON "BankTransaction"("workspaceId", "date");

-- CreateIndex
CREATE INDEX "BankTransaction_bankAccountId_date_amount_idx" ON "BankTransaction"("bankAccountId", "date", "amount");

-- CreateIndex
CREATE INDEX "BankTransaction_bankAccountId_date_description_idx" ON "BankTransaction"("bankAccountId", "date", "description");

-- CreateIndex
CREATE INDEX "BankDeposit_workspaceId_depositDate_idx" ON "BankDeposit"("workspaceId", "depositDate");

-- CreateIndex
CREATE INDEX "BankDeposit_companyId_depositDate_idx" ON "BankDeposit"("companyId", "depositDate");

-- CreateIndex
CREATE INDEX "BankDeposit_bankAccountId_idx" ON "BankDeposit"("bankAccountId");

-- CreateIndex
CREATE INDEX "BankDeposit_journalEntryId_idx" ON "BankDeposit"("journalEntryId");

-- CreateIndex
CREATE INDEX "UndepositedFundsBatch_workspaceId_idx" ON "UndepositedFundsBatch"("workspaceId");

-- CreateIndex
CREATE INDEX "UndepositedFundsBatch_companyId_status_idx" ON "UndepositedFundsBatch"("companyId", "status");

-- CreateIndex
CREATE INDEX "UndepositedFundsBatch_bankAccountId_idx" ON "UndepositedFundsBatch"("bankAccountId");

-- CreateIndex
CREATE INDEX "BankDepositLine_depositId_idx" ON "BankDepositLine"("depositId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDepositLine_depositId_paymentReceivedId_key" ON "BankDepositLine"("depositId", "paymentReceivedId");

-- CreateIndex
CREATE UNIQUE INDEX "DepositSlip_depositId_key" ON "DepositSlip"("depositId");

-- CreateIndex
CREATE INDEX "DepositSlip_workspaceId_idx" ON "DepositSlip"("workspaceId");

-- CreateIndex
CREATE INDEX "DepositSlip_preparedById_idx" ON "DepositSlip"("preparedById");

-- CreateIndex
CREATE INDEX "DepositSlip_lastPrintedById_idx" ON "DepositSlip"("lastPrintedById");

-- CreateIndex
CREATE INDEX "CashOverShortEntry_depositId_idx" ON "CashOverShortEntry"("depositId");

-- CreateIndex
CREATE INDEX "CashOverShortEntry_ruleId_idx" ON "CashOverShortEntry"("ruleId");

-- CreateIndex
CREATE INDEX "CashOverShortEntry_accountId_idx" ON "CashOverShortEntry"("accountId");

-- CreateIndex
CREATE INDEX "CashOverShortRule_companyId_isActive_idx" ON "CashOverShortRule"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "CashOverShortRule_bankAccountId_idx" ON "CashOverShortRule"("bankAccountId");

-- CreateIndex
CREATE INDEX "CashOverShortRule_accountId_idx" ON "CashOverShortRule"("accountId");

-- CreateIndex
CREATE INDEX "PettyCashFund_companyId_status_idx" ON "PettyCashFund"("companyId", "status");

-- CreateIndex
CREATE INDEX "PettyCashVoucher_fundId_date_idx" ON "PettyCashVoucher"("fundId", "date");

-- CreateIndex
CREATE INDEX "PettyCashVoucher_approvedById_idx" ON "PettyCashVoucher"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "PettyCashVoucher_fundId_voucherNumber_key" ON "PettyCashVoucher"("fundId", "voucherNumber");

-- CreateIndex
CREATE INDEX "Check_companyId_status_idx" ON "Check"("companyId", "status");

-- CreateIndex
CREATE INDEX "Check_checkNumber_idx" ON "Check"("checkNumber");

-- CreateIndex
CREATE INDEX "Check_companyId_templateId_idx" ON "Check"("companyId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Check_companyId_bankAccountId_checkNumber_key" ON "Check"("companyId", "bankAccountId", "checkNumber");

-- CreateIndex
CREATE INDEX "Bill_createdById_idx" ON "Bill"("createdById");

-- CreateIndex
CREATE INDEX "Bill_updatedById_idx" ON "Bill"("updatedById");

-- CreateIndex
CREATE INDEX "Bill_workspaceId_status_idx" ON "Bill"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Bill_workspaceId_vendorId_idx" ON "Bill"("workspaceId", "vendorId");

-- CreateIndex
CREATE INDEX "Bill_workspaceId_vendorId_status_idx" ON "Bill"("workspaceId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "Bill_companyId_vendorId_status_idx" ON "Bill"("companyId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "Bill_companyId_idx" ON "Bill"("companyId");

-- CreateIndex
CREATE INDEX "Bill_workspaceId_issuedAt_idx" ON "Bill"("workspaceId", "issuedAt");

-- CreateIndex
CREATE INDEX "Bill_deletedAt_idx" ON "Bill"("deletedAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_status_dueAt_deletedAt_idx" ON "Bill"("companyId", "status", "dueAt", "deletedAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_postingStatus_issuedAt_idx" ON "Bill"("companyId", "postingStatus", "issuedAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_status_dueAt_balance_idx" ON "Bill"("companyId", "status", "dueAt", "balance");

-- CreateIndex
CREATE INDEX "Bill_companyId_paymentStatus_dueAt_idx" ON "Bill"("companyId", "paymentStatus", "dueAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_deletedAt_idx" ON "Bill"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_dueAt_balance_status_deletedAt_idx" ON "Bill"("companyId", "dueAt", "balance", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Bill_companyId_vendorId_dueAt_balance_idx" ON "Bill"("companyId", "vendorId", "dueAt", "balance");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_companyId_vendorId_billNumber_key" ON "Bill"("companyId", "vendorId", "billNumber");

-- CreateIndex
CREATE INDEX "BillLine_billId_idx" ON "BillLine"("billId");

-- CreateIndex
CREATE INDEX "BillLine_workspaceId_idx" ON "BillLine"("workspaceId");

-- CreateIndex
CREATE INDEX "BillLine_companyId_idx" ON "BillLine"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_workspaceId_status_idx" ON "PurchaseOrder"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_workspaceId_vendorId_idx" ON "PurchaseOrder"("workspaceId", "vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_templateId_idx" ON "PurchaseOrder"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_deletedAt_idx" ON "PurchaseOrder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_workspaceId_poNumber_key" ON "PurchaseOrder"("workspaceId", "poNumber");

-- CreateIndex
CREATE INDEX "LetterOfCredit_companyId_expiryDate_idx" ON "LetterOfCredit"("companyId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "LetterOfCredit_companyId_lcNumber_key" ON "LetterOfCredit"("companyId", "lcNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_workspaceId_idx" ON "PurchaseOrderLine"("workspaceId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_purchaseOrderId_idx" ON "PurchaseOrderLine"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_companyId_idx" ON "PurchaseOrderLine"("companyId");

-- CreateIndex
CREATE INDEX "VendorCredit_workspaceId_status_idx" ON "VendorCredit"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "VendorCredit_workspaceId_vendorId_idx" ON "VendorCredit"("workspaceId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_idx" ON "VendorCredit"("companyId");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_templateId_idx" ON "VendorCredit"("companyId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCredit_workspaceId_creditNumber_key" ON "VendorCredit"("workspaceId", "creditNumber");

-- CreateIndex
CREATE INDEX "CustomerCredit_workspaceId_status_idx" ON "CustomerCredit"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "CustomerCredit_workspaceId_customerId_idx" ON "CustomerCredit"("workspaceId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerCredit_companyId_idx" ON "CustomerCredit"("companyId");

-- CreateIndex
CREATE INDEX "CustomerCredit_companyId_templateId_idx" ON "CustomerCredit"("companyId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCredit_workspaceId_creditNumber_key" ON "CustomerCredit"("workspaceId", "creditNumber");

-- CreateIndex
CREATE INDEX "CustomerCreditLine_customerCreditId_idx" ON "CustomerCreditLine"("customerCreditId");

-- CreateIndex
CREATE INDEX "CustomerCreditLine_workspaceId_idx" ON "CustomerCreditLine"("workspaceId");

-- CreateIndex
CREATE INDEX "CustomerCreditApplication_workspaceId_creditId_idx" ON "CustomerCreditApplication"("workspaceId", "creditId");

-- CreateIndex
CREATE INDEX "CustomerCreditApplication_workspaceId_invoiceId_idx" ON "CustomerCreditApplication"("workspaceId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCreditApplication_creditId_invoiceId_key" ON "CustomerCreditApplication"("creditId", "invoiceId");

-- CreateIndex
CREATE INDEX "VendorCreditLine_vendorCreditId_idx" ON "VendorCreditLine"("vendorCreditId");

-- CreateIndex
CREATE INDEX "VendorCreditLine_workspaceId_idx" ON "VendorCreditLine"("workspaceId");

-- CreateIndex
CREATE INDEX "BillPayment_workspaceId_billId_idx" ON "BillPayment"("workspaceId", "billId");

-- CreateIndex
CREATE INDEX "BillPayment_createdById_idx" ON "BillPayment"("createdById");

-- CreateIndex
CREATE INDEX "BillPayment_updatedById_idx" ON "BillPayment"("updatedById");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_billId_idx" ON "BillPayment"("companyId", "billId");

-- CreateIndex
CREATE INDEX "BillPayment_journalEntryId_idx" ON "BillPayment"("journalEntryId");

-- CreateIndex
CREATE INDEX "BillPayment_deletedAt_idx" ON "BillPayment"("deletedAt");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_paymentDate_deletedAt_idx" ON "BillPayment"("companyId", "paymentDate", "deletedAt");

-- CreateIndex
CREATE INDEX "BillPaymentApplication_workspaceId_billId_idx" ON "BillPaymentApplication"("workspaceId", "billId");

-- CreateIndex
CREATE INDEX "BillPaymentApplication_workspaceId_paymentId_idx" ON "BillPaymentApplication"("workspaceId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "BillPaymentApplication_billId_paymentId_key" ON "BillPaymentApplication"("billId", "paymentId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_workspaceId_vendorId_idx" ON "VendorPaymentMethod"("workspaceId", "vendorId");

-- CreateIndex
CREATE INDEX "VendorPaymentMethod_companyId_vendorId_idx" ON "VendorPaymentMethod"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "CustomerRefund_workspaceId_refundDate_idx" ON "CustomerRefund"("workspaceId", "refundDate");

-- CreateIndex
CREATE INDEX "CustomerRefund_companyId_refundDate_idx" ON "CustomerRefund"("companyId", "refundDate");

-- CreateIndex
CREATE INDEX "CustomerRefund_bankAccountId_idx" ON "CustomerRefund"("bankAccountId");

-- CreateIndex
CREATE INDEX "CustomerRefund_journalEntryId_idx" ON "CustomerRefund"("journalEntryId");

-- CreateIndex
CREATE INDEX "CustomerRefund_approvalStatus_idx" ON "CustomerRefund"("approvalStatus");

-- CreateIndex
CREATE INDEX "VendorRefund_workspaceId_refundDate_idx" ON "VendorRefund"("workspaceId", "refundDate");

-- CreateIndex
CREATE INDEX "VendorRefund_companyId_refundDate_idx" ON "VendorRefund"("companyId", "refundDate");

-- CreateIndex
CREATE INDEX "VendorRefund_bankAccountId_idx" ON "VendorRefund"("bankAccountId");

-- CreateIndex
CREATE INDEX "VendorRefund_journalEntryId_idx" ON "VendorRefund"("journalEntryId");

-- CreateIndex
CREATE INDEX "VendorRefund_approvalStatus_idx" ON "VendorRefund"("approvalStatus");

-- CreateIndex
CREATE INDEX "WriteOff_workspaceId_writeOffDate_idx" ON "WriteOff"("workspaceId", "writeOffDate");

-- CreateIndex
CREATE INDEX "WriteOff_companyId_writeOffDate_idx" ON "WriteOff"("companyId", "writeOffDate");

-- CreateIndex
CREATE INDEX "WriteOff_invoiceId_idx" ON "WriteOff"("invoiceId");

-- CreateIndex
CREATE INDEX "WriteOff_billId_idx" ON "WriteOff"("billId");

-- CreateIndex
CREATE INDEX "WriteOff_accountId_idx" ON "WriteOff"("accountId");

-- CreateIndex
CREATE INDEX "WriteOff_journalEntryId_idx" ON "WriteOff"("journalEntryId");

-- CreateIndex
CREATE INDEX "RefundApproval_workspaceId_status_idx" ON "RefundApproval"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "RefundApproval_companyId_status_idx" ON "RefundApproval"("companyId", "status");

-- CreateIndex
CREATE INDEX "RefundApproval_customerRefundId_idx" ON "RefundApproval"("customerRefundId");

-- CreateIndex
CREATE INDEX "RefundApproval_vendorRefundId_idx" ON "RefundApproval"("vendorRefundId");

-- CreateIndex
CREATE INDEX "RefundReason_workspaceId_idx" ON "RefundReason"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundReason_workspaceId_name_type_key" ON "RefundReason"("workspaceId", "name", "type");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_tableName_createdAt_idx" ON "AuditLog"("workspaceId", "tableName", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_tableName_createdAt_idx" ON "AuditLog"("companyId", "tableName", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_practiceId_tableName_createdAt_idx" ON "AuditLog"("practiceId", "tableName", "createdAt");

-- CreateIndex
CREATE INDEX "EventLog_workspaceId_type_createdAt_idx" ON "EventLog"("workspaceId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "JobAttempt_jobId_status_idx" ON "JobAttempt"("jobId", "status");

-- CreateIndex
CREATE INDEX "DeadLetter_jobId_idx" ON "DeadLetter"("jobId");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_workspaceId_status_nextRetryAt_idx" ON "SearchIndexingQueue"("workspaceId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_workspaceId_createdAt_idx" ON "SearchIndexingQueue"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchIndexedDoc_workspaceId_indexName_indexedAt_idx" ON "SearchIndexedDoc"("workspaceId", "indexName", "indexedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBillingInvoice_invoiceNumber_key" ON "WorkspaceBillingInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "WorkspaceBillingInvoice_workspaceId_status_idx" ON "WorkspaceBillingInvoice"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBillingUsage_workspaceId_period_key" ON "WorkspaceBillingUsage"("workspaceId", "period");

-- CreateIndex
CREATE INDEX "DsrExportRequest_workspaceId_status_idx" ON "DsrExportRequest"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "ConsentRecord_workspaceId_userId_consentType_idx" ON "ConsentRecord"("workspaceId", "userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "OutboxEvent_workspaceId_status_nextRetryAt_idx" ON "OutboxEvent"("workspaceId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "ArchiveJob_workspaceId_year_idx" ON "ArchiveJob"("workspaceId", "year");

-- CreateIndex
CREATE INDEX "ArchiveJob_companyId_year_idx" ON "ArchiveJob"("companyId", "year");

-- CreateIndex
CREATE INDEX "ArchiveJob_status_idx" ON "ArchiveJob"("status");

-- CreateIndex
CREATE INDEX "EntityVersion_workspaceId_entityType_idx" ON "EntityVersion"("workspaceId", "entityType");

-- CreateIndex
CREATE INDEX "EntityVersion_companyId_entityType_idx" ON "EntityVersion"("companyId", "entityType");

-- CreateIndex
CREATE INDEX "EntityVersion_entityType_entityId_idx" ON "EntityVersion"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityVersion_entityType_entityId_version_key" ON "EntityVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMetric_companyId_metricType_period_key" ON "FinancialMetric"("companyId", "metricType", "period");

-- CreateIndex
CREATE INDEX "DataRetentionPolicy_workspaceId_idx" ON "DataRetentionPolicy"("workspaceId");

-- CreateIndex
CREATE INDEX "DataRetentionPolicy_companyId_idx" ON "DataRetentionPolicy"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DataRetentionPolicy_workspaceId_companyId_entityType_key" ON "DataRetentionPolicy"("workspaceId", "companyId", "entityType");

-- CreateIndex
CREATE INDEX "DocumentRetention_companyId_idx" ON "DocumentRetention"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRetention_companyId_countryId_documentType_key" ON "DocumentRetention"("companyId", "countryId", "documentType");

-- CreateIndex
CREATE INDEX "DocumentTemplate_companyId_type_isDefault_idx" ON "DocumentTemplate"("companyId", "type", "isDefault");

-- CreateIndex
CREATE INDEX "DocumentTemplate_companyId_industry_idx" ON "DocumentTemplate"("companyId", "industry");

-- CreateIndex
CREATE INDEX "DocumentTemplate_companyId_idx" ON "DocumentTemplate"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_companyId_type_name_key" ON "DocumentTemplate"("companyId", "type", "name");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_workspaceId_companyId_idx" ON "DocumentRenderLog"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_workspaceId_companyId_renderedAt_idx" ON "DocumentRenderLog"("workspaceId", "companyId", "renderedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_workspaceId_userId_renderedAt_idx" ON "DocumentRenderLog"("workspaceId", "userId", "renderedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_templateId_idx" ON "DocumentRenderLog"("templateId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_workspaceId_documentType_documentId_idx" ON "DocumentRenderLog"("workspaceId", "documentType", "documentId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_documentType_documentId_idx" ON "DocumentRenderLog"("documentType", "documentId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_status_idx" ON "DocumentRenderLog"("status");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_status_renderedAt_idx" ON "DocumentRenderLog"("status", "renderedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_userId_idx" ON "DocumentRenderLog"("userId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_deletedAt_idx" ON "DocumentRenderLog"("deletedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_templateId_documentType_idx" ON "DocumentRenderLog"("templateId", "documentType");

-- CreateIndex
CREATE INDEX "DocumentTemplateVersion_workspaceId_idx" ON "DocumentTemplateVersion"("workspaceId");

-- CreateIndex
CREATE INDEX "DocumentTemplateVersion_templateId_idx" ON "DocumentTemplateVersion"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplateVersion_templateId_versionNumber_key" ON "DocumentTemplateVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "DocumentSignature_workspaceId_idx" ON "DocumentSignature"("workspaceId");

-- CreateIndex
CREATE INDEX "DocumentSignature_templateId_idx" ON "DocumentSignature"("templateId");

-- CreateIndex
CREATE INDEX "DocumentSignature_documentType_documentId_idx" ON "DocumentSignature"("documentType", "documentId");

-- CreateIndex
CREATE INDEX "DocumentSignature_signerId_idx" ON "DocumentSignature"("signerId");

-- CreateIndex
CREATE INDEX "FinancialControl_workspaceId_idx" ON "FinancialControl"("workspaceId");

-- CreateIndex
CREATE INDEX "FinancialControl_companyId_controlType_idx" ON "FinancialControl"("companyId", "controlType");

-- CreateIndex
CREATE INDEX "ControlViolation_companyId_status_idx" ON "ControlViolation"("companyId", "status");

-- CreateIndex
CREATE INDEX "ControlViolation_controlId_idx" ON "ControlViolation"("controlId");

-- CreateIndex
CREATE INDEX "Risk_companyId_status_idx" ON "Risk"("companyId", "status");

-- CreateIndex
CREATE INDEX "Risk_companyId_riskScore_idx" ON "Risk"("companyId", "riskScore");

-- CreateIndex
CREATE INDEX "Risk_companyId_category_idx" ON "Risk"("companyId", "category");

-- CreateIndex
CREATE INDEX "AccountingValidation_companyId_status_idx" ON "AccountingValidation"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingValidation_companyId_validationType_period_key" ON "AccountingValidation"("companyId", "validationType", "period");

-- CreateIndex
CREATE INDEX "SubsidiaryLedger_companyId_idx" ON "SubsidiaryLedger"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "SubsidiaryLedger_companyId_type_key" ON "SubsidiaryLedger"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetActualComparison_companyId_budgetId_period_accountId_key" ON "BudgetActualComparison"("companyId", "budgetId", "period", "accountId");

-- CreateIndex
CREATE INDEX "CashFlowForecast_companyId_periodStart_idx" ON "CashFlowForecast"("companyId", "periodStart");

-- CreateIndex
CREATE INDEX "CashFlowForecast_companyId_scenario_periodStart_idx" ON "CashFlowForecast"("companyId", "scenario", "periodStart");

-- CreateIndex
CREATE INDEX "CashFlowForecastItem_forecastId_date_idx" ON "CashFlowForecastItem"("forecastId", "date");

-- CreateIndex
CREATE INDEX "ReconciliationException_companyId_status_idx" ON "ReconciliationException"("companyId", "status");

-- CreateIndex
CREATE INDEX "ReconciliationException_companyId_type_idx" ON "ReconciliationException"("companyId", "type");

-- CreateIndex
CREATE INDEX "ReconciliationException_subledgerReconciliationId_idx" ON "ReconciliationException"("subledgerReconciliationId");

-- CreateIndex
CREATE INDEX "SubledgerReconciliation_workspaceId_companyId_subledgerType_idx" ON "SubledgerReconciliation"("workspaceId", "companyId", "subledgerType", "asOfDate");

-- CreateIndex
CREATE INDEX "SubledgerReconciliation_companyId_status_idx" ON "SubledgerReconciliation"("companyId", "status");

-- CreateIndex
CREATE INDEX "Estimate_workspaceId_companyId_status_idx" ON "Estimate"("workspaceId", "companyId", "status");

-- CreateIndex
CREATE INDEX "ApiRateLimit_workspaceId_apiKeyId_windowStart_idx" ON "ApiRateLimit"("workspaceId", "apiKeyId", "windowStart");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_systemType_idx" ON "ExternalSystemConfig"("systemType");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_workspaceId_idx" ON "ExternalSystemConfig"("workspaceId");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_companyId_idx" ON "ExternalSystemConfig"("companyId");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_status_idx" ON "ExternalSystemConfig"("status");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_workspaceId_idx" ON "ExternalSystemAudit"("workspaceId");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_systemConfigId_timestamp_idx" ON "ExternalSystemAudit"("systemConfigId", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_systemConfigId_status_timestamp_idx" ON "ExternalSystemAudit"("systemConfigId", "status", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_status_idx" ON "ExternalSystemAudit"("status");

-- CreateIndex
CREATE INDEX "NotificationPreference_workspaceId_idx" ON "NotificationPreference"("workspaceId");

-- CreateIndex
CREATE INDEX "NotificationPreference_companyId_idx" ON "NotificationPreference"("companyId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_workspaceId_companyId_userId_key" ON "NotificationPreference"("workspaceId", "companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId");

-- CreateIndex
CREATE INDEX "ApiKey_ownerId_idx" ON "ApiKey"("ownerId");

-- CreateIndex
CREATE INDEX "ApiKey_systemType_idx" ON "ApiKey"("systemType");

-- CreateIndex
CREATE INDEX "ExternalSystemAccessLog_apiKeyId_timestamp_idx" ON "ExternalSystemAccessLog"("apiKeyId", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAccessLog_userId_timestamp_idx" ON "ExternalSystemAccessLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAccessLog_status_idx" ON "ExternalSystemAccessLog"("status");

-- CreateIndex
CREATE INDEX "ExternalSystemAccessLog_apiKeyId_status_timestamp_idx" ON "ExternalSystemAccessLog"("apiKeyId", "status", "timestamp");

-- CreateIndex
CREATE INDEX "SyncJob_workspaceId_idx" ON "SyncJob"("workspaceId");

-- CreateIndex
CREATE INDEX "SyncJob_integrationConfigId_status_idx" ON "SyncJob"("integrationConfigId", "status");

-- CreateIndex
CREATE INDEX "SyncJob_scheduledAt_idx" ON "SyncJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "SyncJob_status_idx" ON "SyncJob"("status");

-- CreateIndex
CREATE INDEX "SystemHealthStatus_workspaceId_idx" ON "SystemHealthStatus"("workspaceId");

-- CreateIndex
CREATE INDEX "SystemHealthStatus_systemType_checkedAt_idx" ON "SystemHealthStatus"("systemType", "checkedAt");

-- CreateIndex
CREATE INDEX "WebhookSubscription_workspaceId_idx" ON "WebhookSubscription"("workspaceId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_companyId_idx" ON "WebhookSubscription"("companyId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_eventType_idx" ON "WebhookSubscription"("eventType");

-- CreateIndex
CREATE INDEX "WebhookDelivery_workspaceId_idx" ON "WebhookDelivery"("workspaceId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_subscriptionId_status_idx" ON "WebhookDelivery"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_nextRetryAt_idx" ON "WebhookDelivery"("nextRetryAt");

-- CreateIndex
CREATE INDEX "ExternalEntity_workspaceId_idx" ON "ExternalEntity"("workspaceId");

-- CreateIndex
CREATE INDEX "ExternalEntity_entityType_externalId_idx" ON "ExternalEntity"("entityType", "externalId");

-- CreateIndex
CREATE INDEX "ExternalEntity_entityType_systemType_idx" ON "ExternalEntity"("entityType", "systemType");

-- CreateIndex
CREATE INDEX "ExternalEntity_systemType_idx" ON "ExternalEntity"("systemType");

-- CreateIndex
CREATE INDEX "ExternalEntity_status_idx" ON "ExternalEntity"("status");

-- CreateIndex
CREATE INDEX "ExternalEntity_integrationConfigId_idx" ON "ExternalEntity"("integrationConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEntity_localEntityType_localEntityId_key" ON "ExternalEntity"("localEntityType", "localEntityId");

-- CreateIndex
CREATE INDEX "legal_entities_companyId_idx" ON "legal_entities"("companyId");

-- CreateIndex
CREATE INDEX "legal_entities_parentEntityId_idx" ON "legal_entities"("parentEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entities_companyId_name_key" ON "legal_entities"("companyId", "name");

-- CreateIndex
CREATE INDEX "filing_calendars_companyId_idx" ON "filing_calendars"("companyId");

-- CreateIndex
CREATE INDEX "filing_deadlines_calendarId_idx" ON "filing_deadlines"("calendarId");

-- CreateIndex
CREATE INDEX "filing_deadlines_dueDate_idx" ON "filing_deadlines"("dueDate");

-- CreateIndex
CREATE INDEX "filing_deadlines_status_idx" ON "filing_deadlines"("status");

-- CreateIndex
CREATE INDEX "credit_lines_companyId_idx" ON "credit_lines"("companyId");

-- CreateIndex
CREATE INDEX "credit_line_drawdowns_creditLineId_idx" ON "credit_line_drawdowns"("creditLineId");

-- CreateIndex
CREATE INDEX "cash_flow_forecast_lines_forecastId_idx" ON "cash_flow_forecast_lines"("forecastId");

-- CreateIndex
CREATE INDEX "cash_flow_forecast_lines_forecastDate_idx" ON "cash_flow_forecast_lines"("forecastDate");

-- CreateIndex
CREATE INDEX "payment_approvals_companyId_status_idx" ON "payment_approvals"("companyId", "status");

-- CreateIndex
CREATE INDEX "payment_approvals_paymentType_paymentId_idx" ON "payment_approvals"("paymentType", "paymentId");

-- CreateIndex
CREATE INDEX "price_list_entries_priceListId_idx" ON "price_list_entries"("priceListId");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_entries_priceListId_itemId_key" ON "price_list_entries"("priceListId", "itemId");

-- CreateIndex
CREATE INDEX "revenue_recognition_entries_scheduleId_idx" ON "revenue_recognition_entries"("scheduleId");

-- CreateIndex
CREATE INDEX "revenue_recognition_entries_recognitionDate_idx" ON "revenue_recognition_entries"("recognitionDate");

-- CreateIndex
CREATE INDEX "dunning_rules_companyId_idx" ON "dunning_rules"("companyId");

-- CreateIndex
CREATE INDEX "dunning_logs_ruleId_idx" ON "dunning_logs"("ruleId");

-- CreateIndex
CREATE INDEX "dunning_logs_companyId_customerId_idx" ON "dunning_logs"("companyId", "customerId");

-- CreateIndex
CREATE INDEX "receipts_companyId_idx" ON "receipts"("companyId");

-- CreateIndex
CREATE INDEX "receipts_uploadedById_idx" ON "receipts"("uploadedById");

-- CreateIndex
CREATE INDEX "mileage_logs_companyId_idx" ON "mileage_logs"("companyId");

-- CreateIndex
CREATE INDEX "mileage_logs_userId_idx" ON "mileage_logs"("userId");

-- CreateIndex
CREATE INDEX "mileage_logs_logDate_idx" ON "mileage_logs"("logDate");

-- CreateIndex
CREATE INDEX "company_cards_companyId_idx" ON "company_cards"("companyId");

-- CreateIndex
CREATE INDEX "company_card_activities_companyId_idx" ON "company_card_activities"("companyId");

-- CreateIndex
CREATE INDEX "company_card_activities_cardId_idx" ON "company_card_activities"("cardId");

-- CreateIndex
CREATE INDEX "company_card_activities_transactionDate_idx" ON "company_card_activities"("transactionDate");

-- CreateIndex
CREATE INDEX "lot_serial_numbers_companyId_itemId_idx" ON "lot_serial_numbers"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "lot_serial_numbers_lotNumber_idx" ON "lot_serial_numbers"("lotNumber");

-- CreateIndex
CREATE INDEX "lot_serial_numbers_serialNumber_idx" ON "lot_serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX "lot_serial_numbers_expiryDate_idx" ON "lot_serial_numbers"("expiryDate");

-- CreateIndex
CREATE INDEX "reorder_rules_companyId_idx" ON "reorder_rules"("companyId");

-- CreateIndex
CREATE INDEX "reorder_rules_itemId_idx" ON "reorder_rules"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "reorder_rules_companyId_itemId_warehouseId_key" ON "reorder_rules"("companyId", "itemId", "warehouseId");

-- CreateIndex
CREATE INDEX "back_orders_companyId_idx" ON "back_orders"("companyId");

-- CreateIndex
CREATE INDEX "back_orders_itemId_idx" ON "back_orders"("itemId");

-- CreateIndex
CREATE INDEX "back_orders_status_idx" ON "back_orders"("status");

-- CreateIndex
CREATE INDEX "project_billings_companyId_idx" ON "project_billings"("companyId");

-- CreateIndex
CREATE INDEX "project_billings_projectId_idx" ON "project_billings"("projectId");

-- CreateIndex
CREATE INDEX "work_in_progress_companyId_idx" ON "work_in_progress"("companyId");

-- CreateIndex
CREATE INDEX "work_in_progress_projectId_idx" ON "work_in_progress"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "work_in_progress_companyId_projectId_period_key" ON "work_in_progress"("companyId", "projectId", "period");

-- CreateIndex
CREATE INDEX "project_retainers_companyId_idx" ON "project_retainers"("companyId");

-- CreateIndex
CREATE INDEX "project_retainers_projectId_idx" ON "project_retainers"("projectId");

-- CreateIndex
CREATE INDEX "salary_structures_companyId_idx" ON "salary_structures"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_companyId_name_key" ON "salary_structures"("companyId", "name");

-- CreateIndex
CREATE INDEX "salary_structure_components_structureId_idx" ON "salary_structure_components"("structureId");

-- CreateIndex
CREATE INDEX "employee_loan_repayments_loanId_idx" ON "employee_loan_repayments"("loanId");

-- CreateIndex
CREATE INDEX "benefit_plans_companyId_idx" ON "benefit_plans"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "benefit_plans_companyId_name_key" ON "benefit_plans"("companyId", "name");

-- CreateIndex
CREATE INDEX "benefit_enrollments_planId_idx" ON "benefit_enrollments"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "benefit_enrollments_planId_employeeId_key" ON "benefit_enrollments"("planId", "employeeId");

-- CreateIndex
CREATE INDEX "government_remittances_companyId_idx" ON "government_remittances"("companyId");

-- CreateIndex
CREATE INDEX "government_remittances_dueDate_idx" ON "government_remittances"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "government_remittances_companyId_remittanceType_period_key" ON "government_remittances"("companyId", "remittanceType", "period");

-- CreateIndex
CREATE INDEX "shift_schedules_companyId_idx" ON "shift_schedules"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "shift_schedules_companyId_name_key" ON "shift_schedules"("companyId", "name");

-- CreateIndex
CREATE INDEX "shift_assignments_scheduleId_idx" ON "shift_assignments"("scheduleId");

-- CreateIndex
CREATE INDEX "shift_assignments_employeeId_idx" ON "shift_assignments"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "shift_assignments_scheduleId_employeeId_effectiveFrom_key" ON "shift_assignments"("scheduleId", "employeeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "period_close_checklists_companyId_idx" ON "period_close_checklists"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "period_close_checklists_companyId_period_periodType_key" ON "period_close_checklists"("companyId", "period", "periodType");

-- CreateIndex
CREATE INDEX "period_close_checklist_items_checklistId_idx" ON "period_close_checklist_items"("checklistId");

-- CreateIndex
CREATE INDEX "internal_controls_companyId_idx" ON "internal_controls"("companyId");

-- CreateIndex
CREATE INDEX "internal_controls_riskLevel_idx" ON "internal_controls"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "internal_controls_companyId_controlRef_key" ON "internal_controls"("companyId", "controlRef");

-- CreateIndex
CREATE INDEX "control_tests_controlId_idx" ON "control_tests"("controlId");

-- CreateIndex
CREATE INDEX "control_tests_testDate_idx" ON "control_tests"("testDate");

-- CreateIndex
CREATE INDEX "policy_documents_companyId_idx" ON "policy_documents"("companyId");

-- CreateIndex
CREATE INDEX "policy_documents_category_idx" ON "policy_documents"("category");

-- CreateIndex
CREATE INDEX "compliance_issues_companyId_idx" ON "compliance_issues"("companyId");

-- CreateIndex
CREATE INDEX "compliance_issues_status_idx" ON "compliance_issues"("status");

-- CreateIndex
CREATE INDEX "compliance_issues_severity_idx" ON "compliance_issues"("severity");

-- CreateIndex
CREATE INDEX "fraud_detection_rules_companyId_idx" ON "fraud_detection_rules"("companyId");

-- CreateIndex
CREATE INDEX "fraud_alerts_ruleId_idx" ON "fraud_alerts"("ruleId");

-- CreateIndex
CREATE INDEX "fraud_alerts_companyId_status_idx" ON "fraud_alerts"("companyId", "status");

-- CreateIndex
CREATE INDEX "fraud_alerts_entityType_entityId_idx" ON "fraud_alerts"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "business_loans_companyId_idx" ON "business_loans"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "business_loans_companyId_loanNumber_key" ON "business_loans"("companyId", "loanNumber");

-- CreateIndex
CREATE INDEX "business_loan_payments_loanId_idx" ON "business_loan_payments"("loanId");

-- CreateIndex
CREATE INDEX "merchant_accounts_companyId_idx" ON "merchant_accounts"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_accounts_companyId_provider_merchantId_key" ON "merchant_accounts"("companyId", "provider", "merchantId");

-- CreateIndex
CREATE INDEX "credit_health_scores_companyId_idx" ON "credit_health_scores"("companyId");

-- CreateIndex
CREATE INDEX "credit_health_scores_scoreDate_idx" ON "credit_health_scores"("scoreDate");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "teams_companyId_idx" ON "teams"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_companyId_name_key" ON "teams"("companyId", "name");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_loginAt_idx" ON "login_history"("loginAt");

-- CreateIndex
CREATE UNIQUE INDEX "_DepreciationJournalToTaxAttributeCarryforward_AB_unique" ON "_DepreciationJournalToTaxAttributeCarryforward"("A", "B");

-- CreateIndex
CREATE INDEX "_DepreciationJournalToTaxAttributeCarryforward_B_index" ON "_DepreciationJournalToTaxAttributeCarryforward"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepreciationJournalToUncertainTaxPosition_AB_unique" ON "_DepreciationJournalToUncertainTaxPosition"("A", "B");

-- CreateIndex
CREATE INDEX "_DepreciationJournalToUncertainTaxPosition_B_index" ON "_DepreciationJournalToUncertainTaxPosition"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TaxAttributeSurrenderedTo_AB_unique" ON "_TaxAttributeSurrenderedTo"("A", "B");

-- CreateIndex
CREATE INDEX "_TaxAttributeSurrenderedTo_B_index" ON "_TaxAttributeSurrenderedTo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConstructionCostCodeToConstructionProject_AB_unique" ON "_ConstructionCostCodeToConstructionProject"("A", "B");

-- CreateIndex
CREATE INDEX "_ConstructionCostCodeToConstructionProject_B_index" ON "_ConstructionCostCodeToConstructionProject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TaxReturnToUncertainTaxPosition_AB_unique" ON "_TaxReturnToUncertainTaxPosition"("A", "B");

-- CreateIndex
CREATE INDEX "_TaxReturnToUncertainTaxPosition_B_index" ON "_TaxReturnToUncertainTaxPosition"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSecurityEvent" ADD CONSTRAINT "UserSecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTaxModule" ADD CONSTRAINT "CountryTaxModule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nexus" ADD CONSTRAINT "Nexus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nexus" ADD CONSTRAINT "Nexus_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedParty" ADD CONSTRAINT "RelatedParty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedParty" ADD CONSTRAINT "RelatedParty_relatedCompanyId_fkey" FOREIGN KEY ("relatedCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTreaty" ADD CONSTRAINT "TaxTreaty_countryFromId_fkey" FOREIGN KEY ("countryFromId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTreaty" ADD CONSTRAINT "TaxTreaty_countryToId_fkey" FOREIGN KEY ("countryToId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxProvision" ADD CONSTRAINT "TaxProvision_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCapabilities" ADD CONSTRAINT "WorkspaceCapabilities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroup" ADD CONSTRAINT "ConsolidationGroup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroupMember" ADD CONSTRAINT "ConsolidationGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ConsolidationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroupMember" ADD CONSTRAINT "ConsolidationGroupMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingFirm" ADD CONSTRAINT "AccountingFirm_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmData" ADD CONSTRAINT "FirmData_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmData" ADD CONSTRAINT "FirmData_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingFirmSubscription" ADD CONSTRAINT "AccountingFirmSubscription_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingFirmSubscription" ADD CONSTRAINT "AccountingFirmSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_workspaceId_userId_fkey" FOREIGN KEY ("workspaceId", "userId") REFERENCES "WorkspaceUser"("workspaceId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_workspaceId_userId_fkey" FOREIGN KEY ("workspaceId", "userId") REFERENCES "WorkspaceUser"("workspaceId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_fromCompanyId_fkey" FOREIGN KEY ("fromCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_toCompanyId_fkey" FOREIGN KEY ("toCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_fromJournalEntryId_fkey" FOREIGN KEY ("fromJournalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_toJournalEntryId_fkey" FOREIGN KEY ("toJournalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FixedAssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_assetAccountId_fkey" FOREIGN KEY ("assetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_accumulatedDepreciationId_fkey" FOREIGN KEY ("accumulatedDepreciationId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_depreciationExpenseAccountId_fkey" FOREIGN KEY ("depreciationExpenseAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "FixedAssetSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetDepreciation" ADD CONSTRAINT "FixedAssetDepreciation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetSchedule" ADD CONSTRAINT "FixedAssetSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetSchedule" ADD CONSTRAINT "FixedAssetSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDisposal" ADD CONSTRAINT "AssetDisposal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDisposal" ADD CONSTRAINT "AssetDisposal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetImpairment" ADD CONSTRAINT "AssetImpairment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetImpairment" ADD CONSTRAINT "AssetImpairment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRevaluation" ADD CONSTRAINT "AssetRevaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRevaluation" ADD CONSTRAINT "AssetRevaluation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetInsurance" ADD CONSTRAINT "AssetInsurance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetInsurance" ADD CONSTRAINT "AssetInsurance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationAccount" ADD CONSTRAINT "DepreciationAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationAccount" ADD CONSTRAINT "DepreciationAccount_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationAccount" ADD CONSTRAINT "DepreciationAccount_expenseAccountId_fkey" FOREIGN KEY ("expenseAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationAccount" ADD CONSTRAINT "DepreciationAccount_accumAccountId_fkey" FOREIGN KEY ("accumAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationJournal" ADD CONSTRAINT "DepreciationJournal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationJournal" ADD CONSTRAINT "DepreciationJournal_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "FixedAssetSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationJournal" ADD CONSTRAINT "DepreciationJournal_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_assigneeId_fkey" FOREIGN KEY ("workspaceId", "assigneeId") REFERENCES "WorkspaceUser"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRule" ADD CONSTRAINT "WorkflowRule_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunStep" ADD CONSTRAINT "WorkflowRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunStep" ADD CONSTRAINT "WorkflowRunStep_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "WorkflowRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsightAttachment" ADD CONSTRAINT "AiInsightAttachment_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "AiInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsightComment" ADD CONSTRAINT "AiInsightComment_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "AiInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsightComment" ADD CONSTRAINT "AiInsightComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsightMetric" ADD CONSTRAINT "AiInsightMetric_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "AiInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModel" ADD CONSTRAINT "AiModel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModel" ADD CONSTRAINT "AiModel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelRun" ADD CONSTRAINT "AiModelRun_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureStore" ADD CONSTRAINT "FeatureStore_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureStore" ADD CONSTRAINT "FeatureStore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgentTask" ADD CONSTRAINT "AiAgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceRule" ADD CONSTRAINT "AiGovernanceRule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceRule" ADD CONSTRAINT "AiGovernanceRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceTrigger" ADD CONSTRAINT "AiGovernanceTrigger_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AiGovernanceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dimension" ADD CONSTRAINT "Dimension_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionValue" ADD CONSTRAINT "DimensionValue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionValue" ADD CONSTRAINT "DimensionValue_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "Dimension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionValue" ADD CONSTRAINT "DimensionValue_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DimensionValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityDimensionValue" ADD CONSTRAINT "EntityDimensionValue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityDimensionValue" ADD CONSTRAINT "EntityDimensionValue_dimensionValueId_fkey" FOREIGN KEY ("dimensionValueId") REFERENCES "DimensionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataQualityScore" ADD CONSTRAINT "DataQualityScore_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataQualityScore" ADD CONSTRAINT "DataQualityScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAllocation" ADD CONSTRAINT "FundAllocation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyUnit" ADD CONSTRAINT "PropertyUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "PropertyUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionEntry" ADD CONSTRAINT "RetentionEntry_retentionId_fkey" FOREIGN KEY ("retentionId") REFERENCES "ContractRetention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTerm" ADD CONSTRAINT "PaymentTerm_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForeignCurrencyGainLoss" ADD CONSTRAINT "ForeignCurrencyGainLoss_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSubType" ADD CONSTRAINT "AccountSubType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalanceAudit" ADD CONSTRAINT "AccountBalanceAudit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalanceAudit" ADD CONSTRAINT "AccountBalanceAudit_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLine" ADD CONSTRAINT "ProjectLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer"("contactId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhaseLog" ADD CONSTRAINT "ProjectPhaseLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrderItem" ADD CONSTRAINT "ChangeOrderItem_changeOrderId_fkey" FOREIGN KEY ("changeOrderId") REFERENCES "ChangeOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lien" ADD CONSTRAINT "Lien_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lien" ADD CONSTRAINT "Lien_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionSchedule" ADD CONSTRAINT "RetentionSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionSchedule" ADD CONSTRAINT "RetentionSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionSchedule" ADD CONSTRAINT "RetentionSchedule_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionSchedule" ADD CONSTRAINT "RetentionSchedule_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionCostCode" ADD CONSTRAINT "ConstructionCostCode_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionCostCode" ADD CONSTRAINT "ConstructionCostCode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ConstructionCostCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCodeAllocation" ADD CONSTRAINT "CostCodeAllocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCodeAllocation" ADD CONSTRAINT "CostCodeAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCodeAllocation" ADD CONSTRAINT "CostCodeAllocation_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "ConstructionCostCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grant" ADD CONSTRAINT "Grant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grant" ADD CONSTRAINT "Grant_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grant" ADD CONSTRAINT "Grant_funderId_fkey" FOREIGN KEY ("funderId") REFERENCES "Customer"("contactId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantBudget" ADD CONSTRAINT "GrantBudget_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantExpense" ADD CONSTRAINT "GrantExpense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantExpense" ADD CONSTRAINT "GrantExpense_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantExpense" ADD CONSTRAINT "GrantExpense_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "GrantBudget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReport" ADD CONSTRAINT "GrantReport_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReport" ADD CONSTRAINT "GrantReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReport" ADD CONSTRAINT "GrantReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantReport" ADD CONSTRAINT "GrantReport_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorManagement" ADD CONSTRAINT "DonorManagement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorManagement" ADD CONSTRAINT "DonorManagement_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueRecognitionSchedule" ADD CONSTRAINT "RevenueRecognitionSchedule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueRecognitionSchedule" ADD CONSTRAINT "RevenueRecognitionSchedule_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "InvoiceLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueRecognitionPhase" ADD CONSTRAINT "RevenueRecognitionPhase_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RevenueRecognitionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueRecognitionPhase" ADD CONSTRAINT "RevenueRecognitionPhase_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardCostVersion" ADD CONSTRAINT "StandardCostVersion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianceJournal" ADD CONSTRAINT "VarianceJournal_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandedCostLine" ADD CONSTRAINT "LandedCostLine_landedCostId_fkey" FOREIGN KEY ("landedCostId") REFERENCES "LandedCost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandedCostLine" ADD CONSTRAINT "LandedCostLine_inventoryCostLayerId_fkey" FOREIGN KEY ("inventoryCostLayerId") REFERENCES "InventoryCostLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVersion" ADD CONSTRAINT "BudgetVersion_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVersion" ADD CONSTRAINT "BudgetVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineVersion" ADD CONSTRAINT "BudgetLineVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "BudgetVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineVersion" ADD CONSTRAINT "BudgetLineVersion_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineVersion" ADD CONSTRAINT "BudgetLineVersion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluationLine" ADD CONSTRAINT "CurrencyRevaluationLine_revaluationId_fkey" FOREIGN KEY ("revaluationId") REFERENCES "CurrencyRevaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluationLine" ADD CONSTRAINT "CurrencyRevaluationLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalThreshold" ADD CONSTRAINT "ApprovalThreshold_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingLock" ADD CONSTRAINT "PostingLock_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingLock" ADD CONSTRAINT "PostingLock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reversal" ADD CONSTRAINT "Reversal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialStatementSnapshot" ADD CONSTRAINT "FinancialStatementSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluationEntry" ADD CONSTRAINT "CurrencyRevaluationEntry_revaluationId_fkey" FOREIGN KEY ("revaluationId") REFERENCES "CurrencyRevaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRevaluationEntry" ADD CONSTRAINT "CurrencyRevaluationEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowCategory" ADD CONSTRAINT "CashFlowCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowStatementSnapshot" ADD CONSTRAINT "CashFlowStatementSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialStatementTemplate" ADD CONSTRAINT "FinancialStatementTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FinancialStatementTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiDashboard" ADD CONSTRAINT "KpiDashboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiDashboard" ADD CONSTRAINT "KpiDashboard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "KpiDashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialStatementLine" ADD CONSTRAINT "FinancialStatementLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSequence" ADD CONSTRAINT "DocumentSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingEntry" ADD CONSTRAINT "ClosingEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingEntry" ADD CONSTRAINT "ClosingEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearEndClose" ADD CONSTRAINT "YearEndClose_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearEndClose" ADD CONSTRAINT "YearEndClose_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearEndClose" ADD CONSTRAINT "YearEndClose_retainedEarningsAccountId_fkey" FOREIGN KEY ("retainedEarningsAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearEndClose" ADD CONSTRAINT "YearEndClose_incomeSummaryAccountId_fkey" FOREIGN KEY ("incomeSummaryAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquityAccount" ADD CONSTRAINT "EquityAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquityAccount" ADD CONSTRAINT "EquityAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dividend" ADD CONSTRAINT "Dividend_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dividend" ADD CONSTRAINT "Dividend_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxReturn" ADD CONSTRAINT "PayrollTaxReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxReturn" ADD CONSTRAINT "PayrollTaxReturn_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxLiability" ADD CONSTRAINT "PayrollTaxLiability_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxLiability" ADD CONSTRAINT "PayrollTaxLiability_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxPayment" ADD CONSTRAINT "PayrollTaxPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxPayment" ADD CONSTRAINT "PayrollTaxPayment_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "PayrollTaxLiability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTaxPayment" ADD CONSTRAINT "PayrollTaxPayment_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccrualSchedule" ADD CONSTRAINT "AccrualSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccrualSchedule" ADD CONSTRAINT "AccrualSchedule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccrualSchedule" ADD CONSTRAINT "AccrualSchedule_offsetAccountId_fkey" FOREIGN KEY ("offsetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccrualEntry" ADD CONSTRAINT "AccrualEntry_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "AccrualSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccrualEntry" ADD CONSTRAINT "AccrualEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliation" ADD CONSTRAINT "BankReconciliation_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_bankReconciliationId_fkey" FOREIGN KEY ("bankReconciliationId") REFERENCES "BankReconciliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "BankTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_journalEntryLineId_fkey" FOREIGN KEY ("journalEntryLineId") REFERENCES "JournalEntryLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactCustomField" ADD CONSTRAINT "ContactCustomField_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_cashFlowCategoryId_fkey" FOREIGN KEY ("cashFlowCategoryId") REFERENCES "CashFlowCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accountSubTypeId_fkey" FOREIGN KEY ("accountSubTypeId") REFERENCES "AccountSubType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactEmail" ADD CONSTRAINT "ContactEmail_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPhone" ADD CONSTRAINT "ContactPhone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099" ADD CONSTRAINT "Form1099_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099" ADD CONSTRAINT "Form1099_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099" ADD CONSTRAINT "Form1099_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099Box" ADD CONSTRAINT "Form1099Box_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form1099"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_cogsAccountId_fkey" FOREIGN KEY ("cogsAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_inventoryReserveAccountId_fkey" FOREIGN KEY ("inventoryReserveAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_inventoryTxLineId_fkey" FOREIGN KEY ("inventoryTxLineId") REFERENCES "InventoryTransactionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCostLayer" ADD CONSTRAINT "InventoryCostLayer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaySchedule" ADD CONSTRAINT "PaySchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_payScheduleId_fkey" FOREIGN KEY ("payScheduleId") REFERENCES "PaySchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_taxInfo_fkey" FOREIGN KEY ("taxInfoId") REFERENCES "EmployeeTaxInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_i9Form_fkey" FOREIGN KEY ("i9FormId") REFERENCES "FormI9"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckLine" ADD CONSTRAINT "PaycheckLine_paycheckId_fkey" FOREIGN KEY ("paycheckId") REFERENCES "Paycheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckLine" ADD CONSTRAINT "PaycheckLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckTax" ADD CONSTRAINT "PaycheckTax_paycheckId_fkey" FOREIGN KEY ("paycheckId") REFERENCES "Paycheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckTax" ADD CONSTRAINT "PaycheckTax_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLoan" ADD CONSTRAINT "EmployeeLoan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLoan" ADD CONSTRAINT "EmployeeLoan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLoanPayment" ADD CONSTRAINT "EmployeeLoanPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLoanPayment" ADD CONSTRAINT "EmployeeLoanPayment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLoanPayment" ADD CONSTRAINT "EmployeeLoanPayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "EmployeeLoan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffBalance" ADD CONSTRAINT "TimeOffBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffBalance" ADD CONSTRAINT "TimeOffBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThirteenthMonthPay" ADD CONSTRAINT "ThirteenthMonthPay_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThirteenthMonthPay" ADD CONSTRAINT "ThirteenthMonthPay_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentContributionPayment" ADD CONSTRAINT "GovernmentContributionPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentContributionPayment" ADD CONSTRAINT "GovernmentContributionPayment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAccrual" ADD CONSTRAINT "PayrollAccrual_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAccrual" ADD CONSTRAINT "PayrollAccrual_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAccrual" ADD CONSTRAINT "PayrollAccrual_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAccrual" ADD CONSTRAINT "PayrollAccrual_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "StockLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "InventoryReserve" ADD CONSTRAINT "InventoryReserve_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReserve" ADD CONSTRAINT "InventoryReserve_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COGSRecognition" ADD CONSTRAINT "COGSRecognition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COGSRecognition" ADD CONSTRAINT "COGSRecognition_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "InvoiceLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COGSRecognition" ADD CONSTRAINT "COGSRecognition_inventoryTxLineId_fkey" FOREIGN KEY ("inventoryTxLineId") REFERENCES "InventoryTransactionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COGSRecognition" ADD CONSTRAINT "COGSRecognition_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COGSRecognition" ADD CONSTRAINT "COGSRecognition_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentRequest" ADD CONSTRAINT "InventoryAdjustmentRequest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentRequest" ADD CONSTRAINT "InventoryAdjustmentRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentRequest" ADD CONSTRAINT "InventoryAdjustmentRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "InventoryTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentRequest" ADD CONSTRAINT "InventoryAdjustmentRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentApproval" ADD CONSTRAINT "InventoryAdjustmentApproval_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InventoryAdjustmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentApproval" ADD CONSTRAINT "InventoryAdjustmentApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyBuild" ADD CONSTRAINT "AssemblyBuild_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyBuild" ADD CONSTRAINT "AssemblyBuild_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyComponent" ADD CONSTRAINT "AssemblyComponent_assemblyBuildId_fkey" FOREIGN KEY ("assemblyBuildId") REFERENCES "AssemblyBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyComponent" ADD CONSTRAINT "AssemblyComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRun" ADD CONSTRAINT "ProductionRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRun" ADD CONSTRAINT "ProductionRun_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRun" ADD CONSTRAINT "ProductionRun_varianceAccountId_fkey" FOREIGN KEY ("varianceAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRun" ADD CONSTRAINT "ProductionRun_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxJurisdiction" ADD CONSTRAINT "TaxJurisdiction_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuthority" ADD CONSTRAINT "TaxAuthority_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxObligation" ADD CONSTRAINT "TaxObligation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxObligation" ADD CONSTRAINT "TaxObligation_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxObligation" ADD CONSTRAINT "TaxObligation_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuditCase" ADD CONSTRAINT "TaxAuditCase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuditCase" ADD CONSTRAINT "TaxAuditCase_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuditCase" ADD CONSTRAINT "TaxAuditCase_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuthorityCommunication" ADD CONSTRAINT "TaxAuthorityCommunication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAuthorityCommunication" ADD CONSTRAINT "TaxAuthorityCommunication_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxOptimizationSuggestion" ADD CONSTRAINT "TaxOptimizationSuggestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRiskScore" ADD CONSTRAINT "TaxRiskScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturn" ADD CONSTRAINT "TaxReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturn" ADD CONSTRAINT "TaxReturn_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturn" ADD CONSTRAINT "TaxReturn_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnLine" ADD CONSTRAINT "TaxReturnLine_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnLine" ADD CONSTRAINT "TaxReturnLine_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnLine" ADD CONSTRAINT "TaxReturnLine_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPayment" ADD CONSTRAINT "TaxPayment_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturnAmendment" ADD CONSTRAINT "TaxReturnAmendment_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCalculationAudit" ADD CONSTRAINT "TaxCalculationAudit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCalculationAudit" ADD CONSTRAINT "TaxCalculationAudit_calculatedById_fkey" FOREIGN KEY ("calculatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPeriodLock" ADD CONSTRAINT "TaxPeriodLock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPeriodLock" ADD CONSTRAINT "TaxPeriodLock_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxPeriodLock" ADD CONSTRAINT "TaxPeriodLock_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxFilingPackage" ADD CONSTRAINT "TaxFilingPackage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxCertificate" ADD CONSTRAINT "WithholdingTaxCertificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxCertificate" ADD CONSTRAINT "WithholdingTaxCertificate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCalendar" ADD CONSTRAINT "TaxCalendar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCalendar" ADD CONSTRAINT "TaxCalendar_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionAudit" ADD CONSTRAINT "UserActionAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionAudit" ADD CONSTRAINT "UserActionAudit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxFilingBatch" ADD CONSTRAINT "TaxFilingBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDeadline" ADD CONSTRAINT "ComplianceDeadline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDeadline" ADD CONSTRAINT "ComplianceDeadline_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxClearanceCertificate" ADD CONSTRAINT "TaxClearanceCertificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxClearanceCertificate" ADD CONSTRAINT "TaxClearanceCertificate_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPermit" ADD CONSTRAINT "BusinessPermit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAttributeCarryforward" ADD CONSTRAINT "TaxAttributeCarryforward_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAttributeCarryforward" ADD CONSTRAINT "TaxAttributeCarryforward_surrenderedToCompanyId_fkey" FOREIGN KEY ("surrenderedToCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAttributeCarryforward" ADD CONSTRAINT "TaxAttributeCarryforward_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAttributeCarryforward" ADD CONSTRAINT "TaxAttributeCarryforward_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UncertainTaxPosition" ADD CONSTRAINT "UncertainTaxPosition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UncertainTaxPosition" ADD CONSTRAINT "UncertainTaxPosition_taxAuthorityId_fkey" FOREIGN KEY ("taxAuthorityId") REFERENCES "TaxAuthority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxIncentive" ADD CONSTRAINT "TaxIncentive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxIncentive" ADD CONSTRAINT "TaxIncentive_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPricingDocument" ADD CONSTRAINT "TransferPricingDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPricingDocument" ADD CONSTRAINT "TransferPricingDocument_relatedPartyId_fkey" FOREIGN KEY ("relatedPartyId") REFERENCES "RelatedParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPricingDocument" ADD CONSTRAINT "TransferPricingDocument_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancePricingAgreement" ADD CONSTRAINT "AdvancePricingAgreement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancePricingAgreement" ADD CONSTRAINT "AdvancePricingAgreement_taxAuthorityId_fkey" FOREIGN KEY ("taxAuthorityId") REFERENCES "TaxAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeferredTax" ADD CONSTRAINT "DeferredTax_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeferredTax" ADD CONSTRAINT "DeferredTax_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRatio" ADD CONSTRAINT "FinancialRatio_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EsgMetric" ADD CONSTRAINT "EsgMetric_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCode" ADD CONSTRAINT "TaxCode_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_quoteLineId_fkey" FOREIGN KEY ("quoteLineId") REFERENCES "QuoteLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "InvoiceLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturn" ADD CONSTRAINT "SalesTaxReturn_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturn" ADD CONSTRAINT "SalesTaxReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturn" ADD CONSTRAINT "SalesTaxReturn_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturnLine" ADD CONSTRAINT "SalesTaxReturnLine_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SalesTaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturnLine" ADD CONSTRAINT "SalesTaxReturnLine_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturnLine" ADD CONSTRAINT "SalesTaxReturnLine_taxJurisdictionId_fkey" FOREIGN KEY ("taxJurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SalesTaxReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revaluation" ADD CONSTRAINT "Revaluation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalTaxTypeConfig" ADD CONSTRAINT "LocalTaxTypeConfig_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxDeduction" ADD CONSTRAINT "WithholdingTaxDeduction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxDeduction" ADD CONSTRAINT "WithholdingTaxDeduction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxDeduction" ADD CONSTRAINT "WithholdingTaxDeduction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithholdingTaxDeduction" ADD CONSTRAINT "WithholdingTaxDeduction_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalTaxDeduction" ADD CONSTRAINT "FinalTaxDeduction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalTaxDeduction" ADD CONSTRAINT "FinalTaxDeduction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalTaxDeduction" ADD CONSTRAINT "FinalTaxDeduction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PercentageTax" ADD CONSTRAINT "PercentageTax_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PercentageTax" ADD CONSTRAINT "PercentageTax_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilippinePayrollDeduction" ADD CONSTRAINT "PhilippinePayrollDeduction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilippinePayrollDeduction" ADD CONSTRAINT "PhilippinePayrollDeduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilippinePayrollDeduction" ADD CONSTRAINT "PhilippinePayrollDeduction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalTaxObligation" ADD CONSTRAINT "LocalTaxObligation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatLedger" ADD CONSTRAINT "VatLedger_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatLedger" ADD CONSTRAINT "VatLedger_vatRegistrationId_fkey" FOREIGN KEY ("vatRegistrationId") REFERENCES "VatRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatRegistration" ADD CONSTRAINT "VatRegistration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatRegistration" ADD CONSTRAINT "VatRegistration_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatTransaction" ADD CONSTRAINT "VatTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatTransaction" ADD CONSTRAINT "VatTransaction_vatRegistrationId_fkey" FOREIGN KEY ("vatRegistrationId") REFERENCES "VatRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirFormTemplate" ADD CONSTRAINT "BirFormTemplate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirFormSubmission" ADD CONSTRAINT "BirFormSubmission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirFormSubmission" ADD CONSTRAINT "BirFormSubmission_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirFormSubmission" ADD CONSTRAINT "BirFormSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BirFormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form2307" ADD CONSTRAINT "Form2307_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form2307" ADD CONSTRAINT "Form2307_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form2307" ADD CONSTRAINT "Form2307_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlphalistEntry" ADD CONSTRAINT "AlphalistEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccountsTemplate" ADD CONSTRAINT "ChartOfAccountsTemplate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyChartOfAccounts" ADD CONSTRAINT "CompanyChartOfAccounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyChartOfAccounts" ADD CONSTRAINT "CompanyChartOfAccounts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChartOfAccountsTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultAccountMapping" ADD CONSTRAINT "DefaultAccountMapping_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultAccountMapping" ADD CONSTRAINT "DefaultAccountMapping_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilippineFinancialStatementTemplate" ADD CONSTRAINT "PhilippineFinancialStatementTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_convertedToInvoiceId_fkey" FOREIGN KEY ("convertedToInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitNote" ADD CONSTRAINT "DebitNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitNote" ADD CONSTRAINT "DebitNote_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitNote" ADD CONSTRAINT "DebitNote_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitNote" ADD CONSTRAINT "DebitNote_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExecutionLog" ADD CONSTRAINT "RecurringExecutionLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RecurringSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_paycheckId_fkey" FOREIGN KEY ("paycheckId") REFERENCES "Paycheck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaimLine" ADD CONSTRAINT "ExpenseClaimLine_expenseClaimId_fkey" FOREIGN KEY ("expenseClaimId") REFERENCES "ExpenseClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaimLine" ADD CONSTRAINT "ExpenseClaimLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewaySettlement" ADD CONSTRAINT "PaymentGatewaySettlement_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewaySettlement" ADD CONSTRAINT "PaymentGatewaySettlement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewayPayout" ADD CONSTRAINT "PaymentGatewayPayout_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "PaymentGatewaySettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomReportBuilder" ADD CONSTRAINT "CustomReportBuilder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaxInfo" ADD CONSTRAINT "EmployeeTaxInfo_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormI9" ADD CONSTRAINT "FormI9_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_undepositedBatchId_fkey" FOREIGN KEY ("undepositedBatchId") REFERENCES "UndepositedFundsBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePaymentApplication" ADD CONSTRAINT "InvoicePaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceived"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningProfile" ADD CONSTRAINT "DunningProfile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningProfile" ADD CONSTRAINT "DunningProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningStep" ADD CONSTRAINT "DunningStep_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DunningProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningRun" ADD CONSTRAINT "DunningRun_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DunningProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningRun" ADD CONSTRAINT "DunningRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DunningRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "DunningStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeReason" ADD CONSTRAINT "DisputeReason_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "DisputeReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceived"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedRule" ADD CONSTRAINT "BankFeedRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedConnection" ADD CONSTRAINT "BankFeedConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedConnection" ADD CONSTRAINT "BankFeedConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedAccount" ADD CONSTRAINT "BankFeedAccount_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BankFeedConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedAccount" ADD CONSTRAINT "BankFeedAccount_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedAccount" ADD CONSTRAINT "BankFeedAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedImport" ADD CONSTRAINT "BankFeedImport_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BankFeedConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedImport" ADD CONSTRAINT "BankFeedImport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionRaw" ADD CONSTRAINT "BankTransactionRaw_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionRaw" ADD CONSTRAINT "BankTransactionRaw_importId_fkey" FOREIGN KEY ("importId") REFERENCES "BankFeedImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionRaw" ADD CONSTRAINT "BankTransactionRaw_bankFeedAccountId_fkey" FOREIGN KEY ("bankFeedAccountId") REFERENCES "BankFeedAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionRaw" ADD CONSTRAINT "BankTransactionRaw_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionRaw" ADD CONSTRAINT "BankTransactionRaw_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "BankTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDepositLine" ADD CONSTRAINT "BankDepositLine_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "BankDeposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDepositLine" ADD CONSTRAINT "BankDepositLine_paymentReceivedId_fkey" FOREIGN KEY ("paymentReceivedId") REFERENCES "PaymentReceived"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "BankDeposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_lastPrintedById_fkey" FOREIGN KEY ("lastPrintedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortEntry" ADD CONSTRAINT "CashOverShortEntry_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "BankDeposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortEntry" ADD CONSTRAINT "CashOverShortEntry_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CashOverShortRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortEntry" ADD CONSTRAINT "CashOverShortEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortRule" ADD CONSTRAINT "CashOverShortRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortRule" ADD CONSTRAINT "CashOverShortRule_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOverShortRule" ADD CONSTRAINT "CashOverShortRule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashFund" ADD CONSTRAINT "PettyCashFund_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashFund" ADD CONSTRAINT "PettyCashFund_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashFund" ADD CONSTRAINT "PettyCashFund_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashVoucher" ADD CONSTRAINT "PettyCashVoucher_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "PettyCashFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashVoucher" ADD CONSTRAINT "PettyCashVoucher_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashVoucher" ADD CONSTRAINT "PettyCashVoucher_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_customerCreditId_fkey" FOREIGN KEY ("customerCreditId") REFERENCES "CustomerCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditApplication" ADD CONSTRAINT "CustomerCreditApplication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPaymentApplication" ADD CONSTRAINT "BillPaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_paymentReceivedId_fkey" FOREIGN KEY ("paymentReceivedId") REFERENCES "PaymentReceived"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "RefundReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "RefundReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_customerRefundId_fkey" FOREIGN KEY ("customerRefundId") REFERENCES "CustomerRefund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_vendorRefundId_fkey" FOREIGN KEY ("vendorRefundId") REFERENCES "VendorRefund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReason" ADD CONSTRAINT "RefundReason_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBillingInvoice" ADD CONSTRAINT "WorkspaceBillingInvoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBillingUsage" ADD CONSTRAINT "WorkspaceBillingUsage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveJob" ADD CONSTRAINT "ArchiveJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveJob" ADD CONSTRAINT "ArchiveJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityVersion" ADD CONSTRAINT "EntityVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityVersion" ADD CONSTRAINT "EntityVersion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialMetric" ADD CONSTRAINT "FinancialMetric_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRetentionPolicy" ADD CONSTRAINT "DataRetentionPolicy_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRetentionPolicy" ADD CONSTRAINT "DataRetentionPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRetention" ADD CONSTRAINT "DocumentRetention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRetention" ADD CONSTRAINT "DocumentRetention_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRenderLog" ADD CONSTRAINT "DocumentRenderLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRenderLog" ADD CONSTRAINT "DocumentRenderLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialControl" ADD CONSTRAINT "FinancialControl_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialControl" ADD CONSTRAINT "FinancialControl_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlViolation" ADD CONSTRAINT "ControlViolation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlViolation" ADD CONSTRAINT "ControlViolation_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "FinancialControl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingValidation" ADD CONSTRAINT "AccountingValidation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidiaryLedger" ADD CONSTRAINT "SubsidiaryLedger_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidiaryLedger" ADD CONSTRAINT "SubsidiaryLedger_controlAccountId_fkey" FOREIGN KEY ("controlAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetActualComparison" ADD CONSTRAINT "BudgetActualComparison_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetActualComparison" ADD CONSTRAINT "BudgetActualComparison_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetActualComparison" ADD CONSTRAINT "BudgetActualComparison_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowForecast" ADD CONSTRAINT "CashFlowForecast_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowForecastItem" ADD CONSTRAINT "CashFlowForecastItem_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "CashFlowForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationException" ADD CONSTRAINT "ReconciliationException_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationException" ADD CONSTRAINT "ReconciliationException_subledgerReconciliationId_fkey" FOREIGN KEY ("subledgerReconciliationId") REFERENCES "SubledgerReconciliation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubledgerReconciliation" ADD CONSTRAINT "SubledgerReconciliation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemConfig" ADD CONSTRAINT "ExternalSystemConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemConfig" ADD CONSTRAINT "ExternalSystemConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAudit" ADD CONSTRAINT "ExternalSystemAudit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAudit" ADD CONSTRAINT "ExternalSystemAudit_systemConfigId_fkey" FOREIGN KEY ("systemConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAccessLog" ADD CONSTRAINT "ExternalSystemAccessLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAccessLog" ADD CONSTRAINT "ExternalSystemAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_integrationConfigId_fkey" FOREIGN KEY ("integrationConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemHealthStatus" ADD CONSTRAINT "SystemHealthStatus_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEntity" ADD CONSTRAINT "ExternalEntity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEntity" ADD CONSTRAINT "ExternalEntity_integrationConfigId_fkey" FOREIGN KEY ("integrationConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_parentEntityId_fkey" FOREIGN KEY ("parentEntityId") REFERENCES "legal_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_calendars" ADD CONSTRAINT "filing_calendars_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_deadlines" ADD CONSTRAINT "filing_deadlines_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "filing_calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_lines" ADD CONSTRAINT "credit_lines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_line_drawdowns" ADD CONSTRAINT "credit_line_drawdowns_creditLineId_fkey" FOREIGN KEY ("creditLineId") REFERENCES "credit_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flow_forecast_lines" ADD CONSTRAINT "cash_flow_forecast_lines_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "CashFlowForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_approvals" ADD CONSTRAINT "payment_approvals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_entries" ADD CONSTRAINT "price_list_entries_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognition_entries" ADD CONSTRAINT "revenue_recognition_entries_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RevenueRecognitionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dunning_rules" ADD CONSTRAINT "dunning_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dunning_logs" ADD CONSTRAINT "dunning_logs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "dunning_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_cards" ADD CONSTRAINT "company_cards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_card_activities" ADD CONSTRAINT "company_card_activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_card_activities" ADD CONSTRAINT "company_card_activities_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "company_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_serial_numbers" ADD CONSTRAINT "lot_serial_numbers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "back_orders" ADD CONSTRAINT "back_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_billings" ADD CONSTRAINT "project_billings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_billings" ADD CONSTRAINT "project_billings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_billings" ADD CONSTRAINT "project_billings_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProjectMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_in_progress" ADD CONSTRAINT "work_in_progress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_in_progress" ADD CONSTRAINT "work_in_progress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_retainers" ADD CONSTRAINT "project_retainers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_retainers" ADD CONSTRAINT "project_retainers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structure_components" ADD CONSTRAINT "salary_structure_components_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "salary_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_loan_repayments" ADD CONSTRAINT "employee_loan_repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "EmployeeLoan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_plans" ADD CONSTRAINT "benefit_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_enrollments" ADD CONSTRAINT "benefit_enrollments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "benefit_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_remittances" ADD CONSTRAINT "government_remittances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "shift_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_close_checklists" ADD CONSTRAINT "period_close_checklists_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_close_checklist_items" ADD CONSTRAINT "period_close_checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "period_close_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_controls" ADD CONSTRAINT "internal_controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_tests" ADD CONSTRAINT "control_tests_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "internal_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_documents" ADD CONSTRAINT "policy_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_issues" ADD CONSTRAINT "compliance_issues_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_issues" ADD CONSTRAINT "compliance_issues_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "internal_controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_detection_rules" ADD CONSTRAINT "fraud_detection_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "fraud_detection_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_loans" ADD CONSTRAINT "business_loans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_loan_payments" ADD CONSTRAINT "business_loan_payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "business_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_accounts" ADD CONSTRAINT "merchant_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_health_scores" ADD CONSTRAINT "credit_health_scores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepreciationJournalToTaxAttributeCarryforward" ADD CONSTRAINT "_DepreciationJournalToTaxAttributeCarryforward_A_fkey" FOREIGN KEY ("A") REFERENCES "DepreciationJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepreciationJournalToTaxAttributeCarryforward" ADD CONSTRAINT "_DepreciationJournalToTaxAttributeCarryforward_B_fkey" FOREIGN KEY ("B") REFERENCES "TaxAttributeCarryforward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepreciationJournalToUncertainTaxPosition" ADD CONSTRAINT "_DepreciationJournalToUncertainTaxPosition_A_fkey" FOREIGN KEY ("A") REFERENCES "DepreciationJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepreciationJournalToUncertainTaxPosition" ADD CONSTRAINT "_DepreciationJournalToUncertainTaxPosition_B_fkey" FOREIGN KEY ("B") REFERENCES "UncertainTaxPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxAttributeSurrenderedTo" ADD CONSTRAINT "_TaxAttributeSurrenderedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "DepreciationJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxAttributeSurrenderedTo" ADD CONSTRAINT "_TaxAttributeSurrenderedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "TaxAttributeCarryforward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConstructionCostCodeToConstructionProject" ADD CONSTRAINT "_ConstructionCostCodeToConstructionProject_A_fkey" FOREIGN KEY ("A") REFERENCES "ConstructionCostCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConstructionCostCodeToConstructionProject" ADD CONSTRAINT "_ConstructionCostCodeToConstructionProject_B_fkey" FOREIGN KEY ("B") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxReturnToUncertainTaxPosition" ADD CONSTRAINT "_TaxReturnToUncertainTaxPosition_A_fkey" FOREIGN KEY ("A") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxReturnToUncertainTaxPosition" ADD CONSTRAINT "_TaxReturnToUncertainTaxPosition_B_fkey" FOREIGN KEY ("B") REFERENCES "UncertainTaxPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

