/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `AccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `AccountSubType` table. All the data in the column will be lost.
  - The `status` column on the `BankReconciliation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Bill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tenantId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `terms` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `FixedAsset` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `FixedAssetCategory` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `FixedAssetDepreciation` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `InventoryCostLayer` table. All the data in the column will be lost.
  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tenantId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `LineTax` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OnboardingStep` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `OpeningBalance` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `PaySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Paycheck` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `PaycheckLine` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiction` on the `PaycheckTax` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `PaycheckTax` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `PaycheckTax` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `PayrollRun` table. All the data in the column will be lost.
  - The `status` column on the `PayrollRun` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tenantId` on the `PayrollRunEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Project` table. All the data in the column will be lost.
  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `RecurringInvoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tenantId` on the `StockLevel` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `StockLocation` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `TaxCode` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `TaxCodeAccount` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `TaxCodeRate` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `TaxJurisdiction` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiction` on the `TaxRate` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `TaxRate` table. All the data in the column will be lost.
  - You are about to drop the column `Accountant_Workspace_Name` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `Owner_Workspace_name` on the `Tenant` table. All the data in the column will be lost.
  - The `status` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `accountantonboardingcomplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAccountant` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboarding_mode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingcomplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `owneronboardingcomplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TenantInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[companyId,code]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,accountId,yearMonth]` on the table `AccountBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,institution,accountNumber]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,vendorId,billNumber]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,employeeNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,taxId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,ssnHash]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,name]` on the table `FixedAssetCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemId,serialNumber]` on the table `InventoryTransactionLine` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,accountId]` on the table `OpeningBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,startDate,endDate]` on the table `PayrollRun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,itemId,stockLocationId]` on the table `StockLevel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[practiceId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,code]` on the table `TaxCode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,taxCodeId,accountId]` on the table `TaxCodeAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[countryId,region,code]` on the table `TaxJurisdiction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerUserId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `AccountSubType` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `Bill` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `BillLine` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyId` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `FixedAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `FixedAssetCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `FixedAssetDepreciation` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `InventoryCostLayer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `InvoiceLine` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `JournalEntryLine` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyId` to the `LineTax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `OpeningBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PaySchedule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frequency` on the `PaySchedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `companyId` to the `Paycheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PaycheckLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PaycheckTax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PaymentReceived` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PayrollRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PayrollRunEmployee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `PurchaseOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `PurchaseOrderLine` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `RecurringInvoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `StockLocation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TaxCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TaxCodeAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TaxCodeRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `TaxJurisdiction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TaxRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerUserId` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `VendorCredit` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELED');

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
CREATE TYPE "WorkspaceType" AS ENUM ('OWNER', 'PRACTICE');

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
CREATE TYPE "ApprovalType" AS ENUM ('REFUND', 'WRITEOFF');

-- CreateEnum
CREATE TYPE "PostingModule" AS ENUM ('JOURNAL_ENTRY', 'INVOICE', 'BILL', 'BANK_DEPOSIT', 'INVENTORY', 'PAYROLL');

-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('INVOICE', 'QUOTE', 'CREDIT_NOTE', 'PURCHASE_ORDER', 'VENDOR_CREDIT', 'STATEMENT', 'DEPOSIT_SLIP');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "AccountSubType" DROP CONSTRAINT "AccountSubType_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "FixedAsset" DROP CONSTRAINT "FixedAsset_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "FixedAssetDepreciation" DROP CONSTRAINT "FixedAssetDepreciation_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryCostLayer" DROP CONSTRAINT "InventoryCostLayer_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryCostLayer" DROP CONSTRAINT "InventoryCostLayer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_companyId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntryLine" DROP CONSTRAINT "JournalEntryLine_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OnboardingStep" DROP CONSTRAINT "OnboardingStep_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaySchedule" DROP CONSTRAINT "PaySchedule_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Paycheck" DROP CONSTRAINT "Paycheck_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PaycheckLine" DROP CONSTRAINT "PaycheckLine_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PaycheckTax" DROP CONSTRAINT "PaycheckTax_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRun" DROP CONSTRAINT "PayrollRun_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRunEmployee" DROP CONSTRAINT "PayrollRunEmployee_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_companyId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringInvoice" DROP CONSTRAINT "RecurringInvoice_companyId_fkey";

-- DropForeignKey
ALTER TABLE "StockLevel" DROP CONSTRAINT "StockLevel_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StockLocation" DROP CONSTRAINT "StockLocation_companyId_fkey";

-- DropForeignKey
ALTER TABLE "StockLocation" DROP CONSTRAINT "StockLocation_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_tenantId_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "TaxCode" DROP CONSTRAINT "TaxCode_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TaxCodeRate" DROP CONSTRAINT "TaxCodeRate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRate" DROP CONSTRAINT "TaxRate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantInvite" DROP CONSTRAINT "TenantInvite_invitedBy_fkey";

-- DropForeignKey
ALTER TABLE "TenantInvite" DROP CONSTRAINT "TenantInvite_roleId_fkey";

-- DropForeignKey
ALTER TABLE "TenantInvite" DROP CONSTRAINT "TenantInvite_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_classId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_invitedBy_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_locationId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "VendorCredit" DROP CONSTRAINT "VendorCredit_companyId_fkey";

-- DropIndex
DROP INDEX "Account_tenantId_code_key";

-- DropIndex
DROP INDEX "Account_tenantId_name_idx";

-- DropIndex
DROP INDEX "AccountBalance_tenantId_accountId_yearMonth_key";

-- DropIndex
DROP INDEX "AccountSubType_tenantId_typeId_idx";

-- DropIndex
DROP INDEX "Bill_tenantId_billNumber_key";

-- DropIndex
DROP INDEX "Class_tenantId_name_key";

-- DropIndex
DROP INDEX "Company_subscriptionId_key";

-- DropIndex
DROP INDEX "Employee_tenantId_id_key";

-- DropIndex
DROP INDEX "Employee_tenantId_idx";

-- DropIndex
DROP INDEX "FixedAsset_tenantId_idx";

-- DropIndex
DROP INDEX "FixedAssetCategory_tenantId_name_key";

-- DropIndex
DROP INDEX "FixedAssetDepreciation_tenantId_idx";

-- DropIndex
DROP INDEX "InventoryCostLayer_tenantId_itemId_idx";

-- DropIndex
DROP INDEX "LineTax_tenantId_invoiceLineId_billLineId_idx";

-- DropIndex
DROP INDEX "LineTax_tenantId_purchaseOrderLineId_idx";

-- DropIndex
DROP INDEX "Location_tenantId_name_key";

-- DropIndex
DROP INDEX "OnboardingStep_userId_idx";

-- DropIndex
DROP INDEX "OpeningBalance_tenantId_accountId_key";

-- DropIndex
DROP INDEX "PaySchedule_tenantId_idx";

-- DropIndex
DROP INDEX "Paycheck_tenantId_employeeId_idx";

-- DropIndex
DROP INDEX "PaycheckLine_tenantId_idx";

-- DropIndex
DROP INDEX "PaycheckTax_tenantId_idx";

-- DropIndex
DROP INDEX "PayrollRun_tenantId_status_idx";

-- DropIndex
DROP INDEX "PayrollRunEmployee_tenantId_idx";

-- DropIndex
DROP INDEX "Project_tenantId_status_idx";

-- DropIndex
DROP INDEX "Role_tenantId_name_idx";

-- DropIndex
DROP INDEX "StockLevel_tenantId_itemId_idx";

-- DropIndex
DROP INDEX "StockLevel_tenantId_itemId_stockLocationId_key";

-- DropIndex
DROP INDEX "StockLocation_tenantId_name_idx";

-- DropIndex
DROP INDEX "Subscription_tenantId_idx";

-- DropIndex
DROP INDEX "TaxCode_tenantId_code_key";

-- DropIndex
DROP INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_idx";

-- DropIndex
DROP INDEX "TaxCodeAccount_tenantId_taxCodeId_accountId_key";

-- DropIndex
DROP INDEX "TaxCodeRate_tenantId_taxCodeId_idx";

-- DropIndex
DROP INDEX "TaxJurisdiction_country_region_code_key";

-- DropIndex
DROP INDEX "TaxRate_tenantId_jurisdiction_effectiveFrom_idx";

-- Ensure tenant isolation policies removed to allow dropping tenantId safely in both real and shadow DBs
DROP POLICY IF EXISTS tenant_isolation_Account ON public."Account";
DROP POLICY IF EXISTS tenant_isolation_AccountBalance ON public."AccountBalance";
DROP POLICY IF EXISTS tenant_isolation_AccountSubType ON public."AccountSubType";
DROP POLICY IF EXISTS tenant_isolation_Class ON public."Class";
DROP POLICY IF EXISTS tenant_isolation_Employee ON public."Employee";
DROP POLICY IF EXISTS tenant_isolation_FixedAsset ON public."FixedAsset";
DROP POLICY IF EXISTS tenant_isolation_FixedAssetCategory ON public."FixedAssetCategory";
DROP POLICY IF EXISTS tenant_isolation_FixedAssetDepreciation ON public."FixedAssetDepreciation";
DROP POLICY IF EXISTS tenant_isolation_InventoryCostLayer ON public."InventoryCostLayer";
DROP POLICY IF EXISTS tenant_isolation_Item ON public."Item";
DROP POLICY IF EXISTS tenant_isolation_LineTax ON public."LineTax";
DROP POLICY IF EXISTS tenant_isolation_Location ON public."Location";
DROP POLICY IF EXISTS tenant_isolation_OpeningBalance ON public."OpeningBalance";
DROP POLICY IF EXISTS tenant_isolation_PaySchedule ON public."PaySchedule";
DROP POLICY IF EXISTS tenant_isolation_Paycheck ON public."Paycheck";
DROP POLICY IF EXISTS tenant_isolation_PaycheckLine ON public."PaycheckLine";
DROP POLICY IF EXISTS tenant_isolation_PayrollRun ON public."PayrollRun";
DROP POLICY IF EXISTS tenant_isolation_PayrollRunEmployee ON public."PayrollRunEmployee";
DROP POLICY IF EXISTS tenant_isolation_Project ON public."Project";
DROP POLICY IF EXISTS tenant_isolation_StockLevel ON public."StockLevel";
DROP POLICY IF EXISTS tenant_isolation_StockLocation ON public."StockLocation";
DROP POLICY IF EXISTS tenant_isolation_TaxCode ON public."TaxCode";
DROP POLICY IF EXISTS tenant_isolation_TaxCodeAccount ON public."TaxCodeAccount";
DROP POLICY IF EXISTS tenant_isolation_TaxCodeRate ON public."TaxCodeRate";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "cashFlowCategoryId" TEXT,
ADD COLUMN     "cashFlowType" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "normalSide" "NormalSide";

-- AlterTable
ALTER TABLE "AccountBalance" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AccountSubType" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AccountType" ADD COLUMN     "category" "AccountCategory",
ADD COLUMN     "normalSide" "NormalSide" NOT NULL DEFAULT 'DEBIT';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "practiceId" TEXT;

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "checkStartingNumber" INTEGER,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastCheckNumber" INTEGER,
ADD COLUMN     "routingNumber" TEXT,
ADD COLUMN     "swiftCode" TEXT;

-- AlterTable
ALTER TABLE "BankReconciliation" DROP COLUMN "status",
ADD COLUMN     "status" "BankReconciliationStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "BankReconciliationLine" ADD COLUMN     "journalEntryLineId" TEXT,
ADD COLUMN     "matchType" TEXT NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "BankTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "creditableWithholding" DECIMAL(20,4),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "paymentTermId" TEXT,
ADD COLUMN     "transactionType" "TransactionType",
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "withholdingTaxAmount" DECIMAL(20,4),
ALTER COLUMN "companyId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "total" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "shippingAmount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "otherCharges" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "BillLine" ALTER COLUMN "companyId" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "BillPayment" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "BillPaymentApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "subscriptionId",
ADD COLUMN     "auditTrailEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "countryId" TEXT NOT NULL,
ADD COLUMN     "dstLiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dstRegistrationNumber" TEXT,
ADD COLUMN     "euVatIossNumber" TEXT,
ADD COLUMN     "euVatOneStopShop" BOOLEAN DEFAULT false,
ADD COLUMN     "euVatOssCountry" TEXT,
ADD COLUMN     "euVatOssEffectiveDate" TIMESTAMP(3),
ADD COLUMN     "euVatOssNumber" TEXT,
ADD COLUMN     "functionalCurrency" VARCHAR(3),
ADD COLUMN     "lastAuditReview" TIMESTAMP(3),
ADD COLUMN     "legacy_id" TEXT,
ADD COLUMN     "legalNameChangedAt" TIMESTAMP(3),
ADD COLUMN     "migratedAt" TIMESTAMP(3),
ADD COLUMN     "migrationNote" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarding_mode" TEXT NOT NULL DEFAULT 'full',
ADD COLUMN     "reportingStandard" "AccountingStandard",
ADD COLUMN     "taxIdChangedAt" TIMESTAMP(3),
ADD COLUMN     "taxYearEnd" TIMESTAMP(3),
ADD COLUMN     "vatNumberChangedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "terms",
ADD COLUMN     "paymentTermId" TEXT,
ADD COLUMN     "priceListId" TEXT;

-- AlterTable
ALTER TABLE "CustomerCredit" ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "CustomerCreditApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "CustomerCreditLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "consumedAt";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "employeeNumber" TEXT,
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "FixedAsset" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "depreciationExpenseAccountId" TEXT,
ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "FixedAssetCategory" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FixedAssetDepreciation" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "scheduleId" TEXT;

-- AlterTable
ALTER TABLE "InventoryCostLayer" DROP COLUMN "tenantId" CASCADE,
ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "invoiceId" TEXT;

-- AlterTable
ALTER TABLE "InventoryTransactionLine" ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "lotNumber" TEXT,
ADD COLUMN     "serialNumber" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "finalTaxAmount" DECIMAL(20,4),
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "paymentTermId" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "transactionType" "TransactionType",
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "withholdingTaxAmount" DECIMAL(20,4),
ALTER COLUMN "companyId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "total" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "shippingAmount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "otherCharges" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "InvoiceLine" ALTER COLUMN "companyId" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "InvoicePaymentApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "discountAllowed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inventoryReserveAccountId" TEXT,
ADD COLUMN     "maxDiscountPercent" DECIMAL(5,2),
ADD COLUMN     "purchaseCost" DECIMAL(20,4),
ADD COLUMN     "salesPrice" DECIMAL(20,4),
ADD COLUMN     "standardCost" DECIMAL(20,4),
ADD COLUMN     "trackingType" TEXT DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "companyId" SET NOT NULL,
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "JournalEntryLine" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LineTax" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "quoteLineId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OnboardingStep" DROP COLUMN "userId",
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "practiceId" TEXT;

-- AlterTable
ALTER TABLE "OpeningBalance" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaySchedule" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "PayrollFrequency" NOT NULL;

-- AlterTable
ALTER TABLE "Paycheck" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "i9FormId" TEXT,
ADD COLUMN     "taxInfoId" TEXT,
ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "PaycheckLine" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaycheckTax" DROP COLUMN "jurisdiction",
DROP COLUMN "rate",
DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentReceived" ADD COLUMN     "bankAccountId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeposited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethodId" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "undepositedBatchId" TEXT,
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "PayrollRun" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PayrollRunEmployee" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "companyId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'OPEN',
ALTER COLUMN "total" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "PurchaseOrderLine" ALTER COLUMN "companyId" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "RecurringInvoice" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastRun" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" JSONB,
ALTER COLUMN "companyId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RecurringInvoiceStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "StockLevel" DROP COLUMN "tenantId" CASCADE;

-- AlterTable
ALTER TABLE "StockLocation" DROP COLUMN "tenantId" CASCADE,
ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "plan",
DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "practiceId" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "practiceId" TEXT;

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaxCodeAccount" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaxCodeRate" DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaxJurisdiction" DROP COLUMN "country",
ADD COLUMN     "countryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaxRate" DROP COLUMN "jurisdiction",
DROP COLUMN "tenantId" CASCADE,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "countryId" TEXT,
ADD COLUMN     "exemptionAmount" DECIMAL(20,4),
ADD COLUMN     "globalTaxType" "GlobalTaxType",
ADD COLUMN     "jurisdictionId" TEXT,
ADD COLUMN     "jurisdictionLevel" TEXT,
ADD COLUMN     "taxType" TEXT,
ADD COLUMN     "thresholdAmount" DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "Accountant_Workspace_Name",
DROP COLUMN "Owner_Workspace_name",
ADD COLUMN     "ownerUserId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "type",
ADD COLUMN     "type" "WorkspaceType" NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountantonboardingcomplete",
DROP COLUMN "isAccountant",
DROP COLUMN "onboarding_mode",
DROP COLUMN "onboardingcomplete",
DROP COLUMN "owneronboardingcomplete",
ADD COLUMN     "auditReviewer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "paymentTermId" TEXT;

-- AlterTable
ALTER TABLE "VendorCredit" ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "companyId" SET NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "VendorCreditLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,4);

-- DropTable
DROP TABLE "TenantInvite";

-- DropTable
DROP TABLE "TenantUser";

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- DropEnum
DROP TYPE "TenantStatus";

-- DropEnum
DROP TYPE "TenantType";

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
CREATE TABLE "ConsolidationGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "CompanyUser" (
    "companyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("companyId","tenantId","userId")
);

-- CreateTable
CREATE TABLE "PracticeUser" (
    "practiceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PracticeUser_pkey" PRIMARY KEY ("practiceId","tenantId","userId")
);

-- CreateTable
CREATE TABLE "IntercompanyTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("tenantId","userId")
);

-- CreateTable
CREATE TABLE "WorkspaceInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "SalesTaxReturn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "RecurringSchedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "amount" DECIMAL(20,4) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGatewaySettlement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "DunningProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DisputeReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
CREATE TABLE "BankDeposit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
CREATE TABLE "CustomerRefund" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RefundReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT NOT NULL,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "ExternalSystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSystemAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
    "systemType" "IntegrationType" NOT NULL,
    "status" "SystemHealthState" NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "SystemHealthStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
    "tenantId" TEXT,
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
CREATE TABLE "_TaxReturnToUncertainTaxPosition" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

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
CREATE INDEX "ConsolidationGroup_tenantId_idx" ON "ConsolidationGroup"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationGroup_tenantId_name_key" ON "ConsolidationGroup"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ConsolidationGroupMember_companyId_idx" ON "ConsolidationGroupMember"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationGroupMember_groupId_companyId_key" ON "ConsolidationGroupMember"("groupId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyUser_companyId_idx" ON "CompanyUser"("companyId");

-- CreateIndex
CREATE INDEX "CompanyUser_tenantId_userId_idx" ON "CompanyUser"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "PracticeUser_practiceId_idx" ON "PracticeUser"("practiceId");

-- CreateIndex
CREATE INDEX "PracticeUser_tenantId_userId_idx" ON "PracticeUser"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_tenantId_transactionDate_idx" ON "IntercompanyTransaction"("tenantId", "transactionDate");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_fromCompanyId_transactionDate_idx" ON "IntercompanyTransaction"("fromCompanyId", "transactionDate");

-- CreateIndex
CREATE INDEX "IntercompanyTransaction_toCompanyId_transactionDate_idx" ON "IntercompanyTransaction"("toCompanyId", "transactionDate");

-- CreateIndex
CREATE INDEX "ConsolidationEntry_tenantId_period_idx" ON "ConsolidationEntry"("tenantId", "period");

-- CreateIndex
CREATE INDEX "ConsolidationEntry_companyId_period_idx" ON "ConsolidationEntry"("companyId", "period");

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
CREATE INDEX "WorkspaceUser_tenantId_lastAccessedAt_idx" ON "WorkspaceUser"("tenantId", "lastAccessedAt");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_tenantId_idx" ON "WorkspaceInvite"("tenantId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_status_idx" ON "WorkspaceInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_tenantId_email_key" ON "WorkspaceInvite"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Workflow_tenantId_status_idx" ON "Workflow"("tenantId", "status");

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
CREATE INDEX "AiInsight_tenantId_insightType_status_idx" ON "AiInsight"("tenantId", "insightType", "status");

-- CreateIndex
CREATE INDEX "AiInsight_companyId_insightType_status_idx" ON "AiInsight"("companyId", "insightType", "status");

-- CreateIndex
CREATE INDEX "AiInsight_tenantId_severity_status_idx" ON "AiInsight"("tenantId", "severity", "status");

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
CREATE INDEX "AiModel_tenantId_modelType_isActive_idx" ON "AiModel"("tenantId", "modelType", "isActive");

-- CreateIndex
CREATE INDEX "AiModel_companyId_modelType_isActive_idx" ON "AiModel"("companyId", "modelType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_tenantId_companyId_name_version_key" ON "AiModel"("tenantId", "companyId", "name", "version");

-- CreateIndex
CREATE INDEX "AiModelRun_modelId_status_idx" ON "AiModelRun"("modelId", "status");

-- CreateIndex
CREATE INDEX "AiModelRun_startedAt_idx" ON "AiModelRun"("startedAt");

-- CreateIndex
CREATE INDEX "AiModelRun_runType_status_idx" ON "AiModelRun"("runType", "status");

-- CreateIndex
CREATE INDEX "FeatureStore_tenantId_companyId_category_idx" ON "FeatureStore"("tenantId", "companyId", "category");

-- CreateIndex
CREATE INDEX "FeatureStore_tenantId_companyId_isActive_idx" ON "FeatureStore"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureStore_tenantId_companyId_name_version_key" ON "FeatureStore"("tenantId", "companyId", "name", "version");

-- CreateIndex
CREATE INDEX "FeatureVector_tenantId_companyId_entityType_timestamp_idx" ON "FeatureVector"("tenantId", "companyId", "entityType", "timestamp");

-- CreateIndex
CREATE INDEX "FeatureVector_predictionId_idx" ON "FeatureVector"("predictionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureVector_tenantId_companyId_entityType_entityId_timest_key" ON "FeatureVector"("tenantId", "companyId", "entityType", "entityId", "timestamp");

-- CreateIndex
CREATE INDEX "Prediction_tenantId_companyId_predictionType_targetDate_idx" ON "Prediction"("tenantId", "companyId", "predictionType", "targetDate");

-- CreateIndex
CREATE INDEX "Prediction_tenantId_companyId_entityType_entityId_idx" ON "Prediction"("tenantId", "companyId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Prediction_predictionDate_idx" ON "Prediction"("predictionDate");

-- CreateIndex
CREATE INDEX "AiAgent_tenantId_agentType_status_idx" ON "AiAgent"("tenantId", "agentType", "status");

-- CreateIndex
CREATE INDEX "AiAgent_nextRunAt_idx" ON "AiAgent"("nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiAgent_tenantId_companyId_name_key" ON "AiAgent"("tenantId", "companyId", "name");

-- CreateIndex
CREATE INDEX "AiAgentTask_agentId_status_idx" ON "AiAgentTask"("agentId", "status");

-- CreateIndex
CREATE INDEX "AiAgentTask_status_scheduledAt_idx" ON "AiAgentTask"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "AiAgentTask_relatedType_relatedId_idx" ON "AiAgentTask"("relatedType", "relatedId");

-- CreateIndex
CREATE UNIQUE INDEX "AiChatSession_sessionId_key" ON "AiChatSession"("sessionId");

-- CreateIndex
CREATE INDEX "AiChatSession_tenantId_userId_status_idx" ON "AiChatSession"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "AiChatSession_createdAt_idx" ON "AiChatSession"("createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_sessionId_createdAt_idx" ON "AiChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_role_idx" ON "AiChatMessage"("role");

-- CreateIndex
CREATE INDEX "AiQueryLog_tenantId_queryType_createdAt_idx" ON "AiQueryLog"("tenantId", "queryType", "createdAt");

-- CreateIndex
CREATE INDEX "AiQueryLog_userId_createdAt_idx" ON "AiQueryLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiQueryLog_createdAt_idx" ON "AiQueryLog"("createdAt");

-- CreateIndex
CREATE INDEX "AiGovernanceRule_tenantId_ruleType_isActive_idx" ON "AiGovernanceRule"("tenantId", "ruleType", "isActive");

-- CreateIndex
CREATE INDEX "AiGovernanceRule_companyId_ruleType_isActive_idx" ON "AiGovernanceRule"("companyId", "ruleType", "isActive");

-- CreateIndex
CREATE INDEX "AiGovernanceTrigger_ruleId_triggeredAt_idx" ON "AiGovernanceTrigger"("ruleId", "triggeredAt");

-- CreateIndex
CREATE INDEX "AiGovernanceTrigger_entityType_entityId_idx" ON "AiGovernanceTrigger"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AiAuditLog_tenantId_actionType_createdAt_idx" ON "AiAuditLog"("tenantId", "actionType", "createdAt");

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
CREATE INDEX "DataQualityScore_tenantId_datasetType_measuredAt_idx" ON "DataQualityScore"("tenantId", "datasetType", "measuredAt");

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
CREATE INDEX "ForeignCurrencyGainLoss_companyId_realizedAt_idx" ON "ForeignCurrencyGainLoss"("companyId", "realizedAt");

-- CreateIndex
CREATE INDEX "ForeignCurrencyGainLoss_transactionType_transactionId_idx" ON "ForeignCurrencyGainLoss"("transactionType", "transactionId");

-- CreateIndex
CREATE INDEX "AccountBalanceAudit_companyId_accountId_period_idx" ON "AccountBalanceAudit"("companyId", "accountId", "period");

-- CreateIndex
CREATE INDEX "ApprovalThreshold_companyId_type_idx" ON "ApprovalThreshold"("companyId", "type");

-- CreateIndex
CREATE INDEX "ApprovalThreshold_companyId_isActive_idx" ON "ApprovalThreshold"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "PostingLock_companyId_module_isActive_idx" ON "PostingLock"("companyId", "module", "isActive");

-- CreateIndex
CREATE INDEX "PostingLock_tenantId_startDate_endDate_idx" ON "PostingLock"("tenantId", "startDate", "endDate");

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
CREATE UNIQUE INDEX "AccountSegment_companyId_segmentName_segmentValue_key" ON "AccountSegment"("companyId", "segmentName", "segmentValue");

-- CreateIndex
CREATE INDEX "Contractor_tenantId_idx" ON "Contractor"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_companyId_vendorId_key" ON "Contractor"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "ContractorPayment_companyId_paymentDate_idx" ON "ContractorPayment"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "ContractorPayment_contractorId_taxYear_idx" ON "ContractorPayment"("contractorId", "taxYear");

-- CreateIndex
CREATE INDEX "ContractorPayment_vendorId_idx" ON "ContractorPayment"("vendorId");

-- CreateIndex
CREATE INDEX "Form1099_tenantId_taxYear_idx" ON "Form1099"("tenantId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "Form1099_companyId_contractorId_taxYear_formType_key" ON "Form1099"("companyId", "contractorId", "taxYear", "formType");

-- CreateIndex
CREATE UNIQUE INDEX "Form1099Box_formId_boxNumber_key" ON "Form1099Box"("formId", "boxNumber");

-- CreateIndex
CREATE INDEX "PriceList_workspaceId_idx" ON "PriceList"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_workspaceId_name_key" ON "PriceList"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListItem_priceListId_itemId_key" ON "PriceListItem"("priceListId", "itemId");

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
CREATE INDEX "InventoryAdjustmentRequest_tenantId_status_idx" ON "InventoryAdjustmentRequest"("tenantId", "status");

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
CREATE INDEX "TaxRule_countryId_jurisdictionId_idx" ON "TaxRule"("countryId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "RevenueSchedule_companyId_status_idx" ON "RevenueSchedule"("companyId", "status");

-- CreateIndex
CREATE INDEX "RevenueSchedule_invoiceLineId_idx" ON "RevenueSchedule"("invoiceLineId");

-- CreateIndex
CREATE INDEX "SalesTaxReturn_tenantId_periodStart_periodEnd_idx" ON "SalesTaxReturn"("tenantId", "periodStart", "periodEnd");

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
CREATE INDEX "SalesTaxPayment_tenantId_paymentDate_idx" ON "SalesTaxPayment"("tenantId", "paymentDate");

-- CreateIndex
CREATE INDEX "SalesTaxPayment_companyId_paymentDate_idx" ON "SalesTaxPayment"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "SalesTaxPayment_returnId_idx" ON "SalesTaxPayment"("returnId");

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
CREATE INDEX "Quote_tenantId_status_idx" ON "Quote"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Quote_companyId_customerId_idx" ON "Quote"("companyId", "customerId");

-- CreateIndex
CREATE INDEX "Quote_deletedAt_idx" ON "Quote"("deletedAt");

-- CreateIndex
CREATE INDEX "QuoteLine_quoteId_idx" ON "QuoteLine"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteLine_companyId_idx" ON "QuoteLine"("companyId");

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
CREATE INDEX "RecurringSchedule_tenantId_status_idx" ON "RecurringSchedule"("tenantId", "status");

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
CREATE INDEX "ExpenseClaim_tenantId_employeeId_idx" ON "ExpenseClaim"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_companyId_status_idx" ON "ExpenseClaim"("companyId", "status");

-- CreateIndex
CREATE INDEX "ExpenseClaimLine_expenseClaimId_idx" ON "ExpenseClaimLine"("expenseClaimId");

-- CreateIndex
CREATE INDEX "Payout_tenantId_idx" ON "Payout"("tenantId");

-- CreateIndex
CREATE INDEX "Payout_companyId_idx" ON "Payout"("companyId");

-- CreateIndex
CREATE INDEX "PaymentGatewaySettlement_tenantId_companyId_gatewayName_idx" ON "PaymentGatewaySettlement"("tenantId", "companyId", "gatewayName");

-- CreateIndex
CREATE INDEX "PaymentGatewaySettlement_companyId_periodStart_periodEnd_idx" ON "PaymentGatewaySettlement"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGatewaySettlement_gatewayName_externalId_key" ON "PaymentGatewaySettlement"("gatewayName", "externalId");

-- CreateIndex
CREATE INDEX "PaymentGatewayPayout_settlementId_idx" ON "PaymentGatewayPayout"("settlementId");

-- CreateIndex
CREATE INDEX "PaymentGatewayPayout_externalPayoutId_idx" ON "PaymentGatewayPayout"("externalPayoutId");

-- CreateIndex
CREATE INDEX "SavedReport_tenantId_category_idx" ON "SavedReport"("tenantId", "category");

-- CreateIndex
CREATE INDEX "SavedReport_companyId_idx" ON "SavedReport"("companyId");

-- CreateIndex
CREATE INDEX "SavedReport_tenantId_companyId_isFavorite_createdBy_idx" ON "SavedReport"("tenantId", "companyId", "isFavorite", "createdBy");

-- CreateIndex
CREATE INDEX "SavedReport_tenantId_companyId_category_createdAt_idx" ON "SavedReport"("tenantId", "companyId", "category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedReport_tenantId_companyId_name_key" ON "SavedReport"("tenantId", "companyId", "name");

-- CreateIndex
CREATE INDEX "CustomReportBuilder_companyId_idx" ON "CustomReportBuilder"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTaxInfo_employeeId_key" ON "EmployeeTaxInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "FormI9_employeeId_key" ON "FormI9"("employeeId");

-- CreateIndex
CREATE INDEX "DunningProfile_tenantId_idx" ON "DunningProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DunningProfile_companyId_name_key" ON "DunningProfile"("companyId", "name");

-- CreateIndex
CREATE INDEX "DunningStep_profileId_idx" ON "DunningStep"("profileId");

-- CreateIndex
CREATE INDEX "DunningRun_profileId_runDate_idx" ON "DunningRun"("profileId", "runDate");

-- CreateIndex
CREATE INDEX "DunningRun_companyId_idx" ON "DunningRun"("companyId");

-- CreateIndex
CREATE INDEX "DunningNotice_tenantId_status_idx" ON "DunningNotice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "DunningNotice_companyId_sentAt_idx" ON "DunningNotice"("companyId", "sentAt");

-- CreateIndex
CREATE INDEX "DunningNotice_invoiceId_idx" ON "DunningNotice"("invoiceId");

-- CreateIndex
CREATE INDEX "DunningNotice_customerId_idx" ON "DunningNotice"("customerId");

-- CreateIndex
CREATE INDEX "CustomerStatement_tenantId_customerId_idx" ON "CustomerStatement"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerStatement_companyId_periodStart_periodEnd_idx" ON "CustomerStatement"("companyId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "CustomerStatement_companyId_templateId_idx" ON "CustomerStatement"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "PaymentReminder_tenantId_remindAt_idx" ON "PaymentReminder"("tenantId", "remindAt");

-- CreateIndex
CREATE INDEX "PaymentReminder_companyId_remindAt_idx" ON "PaymentReminder"("companyId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_tenantId_remindAt_idx" ON "SubscriptionReminder"("tenantId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_companyId_remindAt_idx" ON "SubscriptionReminder"("companyId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_practiceId_remindAt_idx" ON "SubscriptionReminder"("practiceId", "remindAt");

-- CreateIndex
CREATE INDEX "SubscriptionReminder_subscriptionId_remindAt_idx" ON "SubscriptionReminder"("subscriptionId", "remindAt");

-- CreateIndex
CREATE INDEX "DisputeReason_tenantId_idx" ON "DisputeReason"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeReason_tenantId_name_key" ON "DisputeReason"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Dispute_tenantId_status_idx" ON "Dispute"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Dispute_companyId_status_idx" ON "Dispute"("companyId", "status");

-- CreateIndex
CREATE INDEX "Dispute_invoiceId_idx" ON "Dispute"("invoiceId");

-- CreateIndex
CREATE INDEX "Chargeback_tenantId_status_idx" ON "Chargeback"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Chargeback_companyId_status_idx" ON "Chargeback"("companyId", "status");

-- CreateIndex
CREATE INDEX "Chargeback_invoiceId_idx" ON "Chargeback"("invoiceId");

-- CreateIndex
CREATE INDEX "Chargeback_paymentId_idx" ON "Chargeback"("paymentId");

-- CreateIndex
CREATE INDEX "BankFeedRule_companyId_isActive_idx" ON "BankFeedRule"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "BankFeedConnection_tenantId_idx" ON "BankFeedConnection"("tenantId");

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
CREATE INDEX "BankDeposit_tenantId_depositDate_idx" ON "BankDeposit"("tenantId", "depositDate");

-- CreateIndex
CREATE INDEX "BankDeposit_companyId_depositDate_idx" ON "BankDeposit"("companyId", "depositDate");

-- CreateIndex
CREATE INDEX "BankDeposit_bankAccountId_idx" ON "BankDeposit"("bankAccountId");

-- CreateIndex
CREATE INDEX "BankDeposit_journalEntryId_idx" ON "BankDeposit"("journalEntryId");

-- CreateIndex
CREATE INDEX "UndepositedFundsBatch_tenantId_idx" ON "UndepositedFundsBatch"("tenantId");

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
CREATE INDEX "DepositSlip_tenantId_idx" ON "DepositSlip"("tenantId");

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
CREATE INDEX "LetterOfCredit_companyId_expiryDate_idx" ON "LetterOfCredit"("companyId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "LetterOfCredit_companyId_lcNumber_key" ON "LetterOfCredit"("companyId", "lcNumber");

-- CreateIndex
CREATE INDEX "CustomerRefund_tenantId_refundDate_idx" ON "CustomerRefund"("tenantId", "refundDate");

-- CreateIndex
CREATE INDEX "CustomerRefund_companyId_refundDate_idx" ON "CustomerRefund"("companyId", "refundDate");

-- CreateIndex
CREATE INDEX "CustomerRefund_bankAccountId_idx" ON "CustomerRefund"("bankAccountId");

-- CreateIndex
CREATE INDEX "CustomerRefund_journalEntryId_idx" ON "CustomerRefund"("journalEntryId");

-- CreateIndex
CREATE INDEX "CustomerRefund_approvalStatus_idx" ON "CustomerRefund"("approvalStatus");

-- CreateIndex
CREATE INDEX "VendorRefund_tenantId_refundDate_idx" ON "VendorRefund"("tenantId", "refundDate");

-- CreateIndex
CREATE INDEX "VendorRefund_companyId_refundDate_idx" ON "VendorRefund"("companyId", "refundDate");

-- CreateIndex
CREATE INDEX "VendorRefund_bankAccountId_idx" ON "VendorRefund"("bankAccountId");

-- CreateIndex
CREATE INDEX "VendorRefund_journalEntryId_idx" ON "VendorRefund"("journalEntryId");

-- CreateIndex
CREATE INDEX "VendorRefund_approvalStatus_idx" ON "VendorRefund"("approvalStatus");

-- CreateIndex
CREATE INDEX "WriteOff_tenantId_writeOffDate_idx" ON "WriteOff"("tenantId", "writeOffDate");

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
CREATE INDEX "RefundApproval_tenantId_status_idx" ON "RefundApproval"("tenantId", "status");

-- CreateIndex
CREATE INDEX "RefundApproval_companyId_status_idx" ON "RefundApproval"("companyId", "status");

-- CreateIndex
CREATE INDEX "RefundApproval_customerRefundId_idx" ON "RefundApproval"("customerRefundId");

-- CreateIndex
CREATE INDEX "RefundApproval_vendorRefundId_idx" ON "RefundApproval"("vendorRefundId");

-- CreateIndex
CREATE INDEX "RefundReason_tenantId_idx" ON "RefundReason"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundReason_tenantId_name_type_key" ON "RefundReason"("tenantId", "name", "type");

-- CreateIndex
CREATE INDEX "ArchiveJob_tenantId_year_idx" ON "ArchiveJob"("tenantId", "year");

-- CreateIndex
CREATE INDEX "ArchiveJob_companyId_year_idx" ON "ArchiveJob"("companyId", "year");

-- CreateIndex
CREATE INDEX "ArchiveJob_status_idx" ON "ArchiveJob"("status");

-- CreateIndex
CREATE INDEX "EntityVersion_tenantId_entityType_idx" ON "EntityVersion"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "EntityVersion_companyId_entityType_idx" ON "EntityVersion"("companyId", "entityType");

-- CreateIndex
CREATE INDEX "EntityVersion_entityType_entityId_idx" ON "EntityVersion"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityVersion_entityType_entityId_version_key" ON "EntityVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMetric_companyId_metricType_period_key" ON "FinancialMetric"("companyId", "metricType", "period");

-- CreateIndex
CREATE INDEX "DataRetentionPolicy_tenantId_idx" ON "DataRetentionPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "DataRetentionPolicy_companyId_idx" ON "DataRetentionPolicy"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DataRetentionPolicy_tenantId_companyId_entityType_key" ON "DataRetentionPolicy"("tenantId", "companyId", "entityType");

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
CREATE INDEX "DocumentRenderLog_tenantId_companyId_idx" ON "DocumentRenderLog"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_tenantId_companyId_renderedAt_idx" ON "DocumentRenderLog"("tenantId", "companyId", "renderedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_tenantId_userId_renderedAt_idx" ON "DocumentRenderLog"("tenantId", "userId", "renderedAt");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_templateId_idx" ON "DocumentRenderLog"("templateId");

-- CreateIndex
CREATE INDEX "DocumentRenderLog_tenantId_documentType_documentId_idx" ON "DocumentRenderLog"("tenantId", "documentType", "documentId");

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
CREATE INDEX "DocumentTemplateVersion_tenantId_idx" ON "DocumentTemplateVersion"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentTemplateVersion_templateId_idx" ON "DocumentTemplateVersion"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplateVersion_templateId_versionNumber_key" ON "DocumentTemplateVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "DocumentSignature_tenantId_idx" ON "DocumentSignature"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentSignature_templateId_idx" ON "DocumentSignature"("templateId");

-- CreateIndex
CREATE INDEX "DocumentSignature_documentType_documentId_idx" ON "DocumentSignature"("documentType", "documentId");

-- CreateIndex
CREATE INDEX "DocumentSignature_signerId_idx" ON "DocumentSignature"("signerId");

-- CreateIndex
CREATE INDEX "FinancialControl_tenantId_idx" ON "FinancialControl"("tenantId");

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
CREATE INDEX "ExternalSystemConfig_systemType_idx" ON "ExternalSystemConfig"("systemType");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_tenantId_idx" ON "ExternalSystemConfig"("tenantId");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_companyId_idx" ON "ExternalSystemConfig"("companyId");

-- CreateIndex
CREATE INDEX "ExternalSystemConfig_status_idx" ON "ExternalSystemConfig"("status");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_tenantId_idx" ON "ExternalSystemAudit"("tenantId");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_systemConfigId_timestamp_idx" ON "ExternalSystemAudit"("systemConfigId", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_systemConfigId_status_timestamp_idx" ON "ExternalSystemAudit"("systemConfigId", "status", "timestamp");

-- CreateIndex
CREATE INDEX "ExternalSystemAudit_status_idx" ON "ExternalSystemAudit"("status");

-- CreateIndex
CREATE INDEX "NotificationPreference_tenantId_idx" ON "NotificationPreference"("tenantId");

-- CreateIndex
CREATE INDEX "NotificationPreference_companyId_idx" ON "NotificationPreference"("companyId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_tenantId_companyId_userId_key" ON "NotificationPreference"("tenantId", "companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

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
CREATE INDEX "SyncJob_tenantId_idx" ON "SyncJob"("tenantId");

-- CreateIndex
CREATE INDEX "SyncJob_integrationConfigId_status_idx" ON "SyncJob"("integrationConfigId", "status");

-- CreateIndex
CREATE INDEX "SyncJob_scheduledAt_idx" ON "SyncJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "SyncJob_status_idx" ON "SyncJob"("status");

-- CreateIndex
CREATE INDEX "SystemHealthStatus_tenantId_idx" ON "SystemHealthStatus"("tenantId");

-- CreateIndex
CREATE INDEX "SystemHealthStatus_systemType_checkedAt_idx" ON "SystemHealthStatus"("systemType", "checkedAt");

-- CreateIndex
CREATE INDEX "WebhookSubscription_tenantId_idx" ON "WebhookSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_companyId_idx" ON "WebhookSubscription"("companyId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_eventType_idx" ON "WebhookSubscription"("eventType");

-- CreateIndex
CREATE INDEX "WebhookDelivery_tenantId_idx" ON "WebhookDelivery"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_subscriptionId_status_idx" ON "WebhookDelivery"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_nextRetryAt_idx" ON "WebhookDelivery"("nextRetryAt");

-- CreateIndex
CREATE INDEX "ExternalEntity_tenantId_idx" ON "ExternalEntity"("tenantId");

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
CREATE UNIQUE INDEX "_TaxReturnToUncertainTaxPosition_AB_unique" ON "_TaxReturnToUncertainTaxPosition"("A", "B");

-- CreateIndex
CREATE INDEX "_TaxReturnToUncertainTaxPosition_B_index" ON "_TaxReturnToUncertainTaxPosition"("B");

-- CreateIndex
CREATE INDEX "Account_companyId_name_idx" ON "Account"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");

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
CREATE INDEX "AccountSubType_companyId_typeId_idx" ON "AccountSubType"("companyId", "typeId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_tableName_createdAt_idx" ON "AuditLog"("companyId", "tableName", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_practiceId_tableName_createdAt_idx" ON "AuditLog"("practiceId", "tableName", "createdAt");

-- CreateIndex
CREATE INDEX "BankAccount_tenantId_idx" ON "BankAccount"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_tenantId_institution_accountNumber_key" ON "BankAccount"("tenantId", "institution", "accountNumber");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_bankTransactionId_idx" ON "BankReconciliationLine"("bankTransactionId");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_journalEntryLineId_idx" ON "BankReconciliationLine"("journalEntryLineId");

-- CreateIndex
CREATE INDEX "BankReconciliationLine_bankReconciliationId_bankTransaction_idx" ON "BankReconciliationLine"("bankReconciliationId", "bankTransactionId");

-- CreateIndex
CREATE INDEX "BankTransaction_bankAccountId_date_amount_idx" ON "BankTransaction"("bankAccountId", "date", "amount");

-- CreateIndex
CREATE INDEX "BankTransaction_bankAccountId_date_description_idx" ON "BankTransaction"("bankAccountId", "date", "description");

-- CreateIndex
CREATE INDEX "Bill_createdById_idx" ON "Bill"("createdById");

-- CreateIndex
CREATE INDEX "Bill_updatedById_idx" ON "Bill"("updatedById");

-- CreateIndex
CREATE INDEX "Bill_tenantId_status_idx" ON "Bill"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Bill_tenantId_vendorId_status_idx" ON "Bill"("tenantId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "Bill_companyId_vendorId_status_idx" ON "Bill"("companyId", "vendorId", "status");

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
CREATE INDEX "BillLine_companyId_idx" ON "BillLine"("companyId");

-- CreateIndex
CREATE INDEX "BillPayment_createdById_idx" ON "BillPayment"("createdById");

-- CreateIndex
CREATE INDEX "BillPayment_updatedById_idx" ON "BillPayment"("updatedById");

-- CreateIndex
CREATE INDEX "BillPayment_deletedAt_idx" ON "BillPayment"("deletedAt");

-- CreateIndex
CREATE INDEX "BillPayment_companyId_paymentDate_deletedAt_idx" ON "BillPayment"("companyId", "paymentDate", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Class_companyId_name_key" ON "Class"("companyId", "name");

-- CreateIndex
CREATE INDEX "Company_countryId_idx" ON "Company"("countryId");

-- CreateIndex
CREATE INDEX "Contact_tenantId_id_idx" ON "Contact"("tenantId", "id");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerCredit_companyId_templateId_idx" ON "CustomerCredit"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_employeeNumber_key" ON "Employee"("companyId", "employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_taxId_key" ON "Employee"("companyId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_ssnHash_key" ON "Employee"("companyId", "ssnHash");

-- CreateIndex
CREATE INDEX "FixedAsset_companyId_idx" ON "FixedAsset"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAssetCategory_companyId_name_key" ON "FixedAssetCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "FixedAssetDepreciation_companyId_idx" ON "FixedAssetDepreciation"("companyId");

-- CreateIndex
CREATE INDEX "InventoryCostLayer_companyId_itemId_idx" ON "InventoryCostLayer"("companyId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_deletedAt_idx" ON "InventoryTransaction"("deletedAt");

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
CREATE INDEX "Invoice_tenantId_status_dueDate_idx" ON "Invoice"("tenantId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_customerId_status_idx" ON "Invoice"("tenantId", "customerId", "status");

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
CREATE INDEX "InvoiceLine_companyId_invoiceId_idx" ON "InvoiceLine"("companyId", "invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePaymentApplication_paymentId_idx" ON "InvoicePaymentApplication"("paymentId");

-- CreateIndex
CREATE INDEX "Item_companyId_idx" ON "Item"("companyId");

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
CREATE INDEX "JournalEntryLine_companyId_accountId_journalId_idx" ON "JournalEntryLine"("companyId", "accountId", "journalId");

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
CREATE UNIQUE INDEX "Location_companyId_name_key" ON "Location"("companyId", "name");

-- CreateIndex
CREATE INDEX "OnboardingStep_companyId_idx" ON "OnboardingStep"("companyId");

-- CreateIndex
CREATE INDEX "OnboardingStep_practiceId_idx" ON "OnboardingStep"("practiceId");

-- CreateIndex
CREATE INDEX "OnboardingStep_companyId_practiceId_idx" ON "OnboardingStep"("companyId", "practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_companyId_accountId_key" ON "OpeningBalance"("companyId", "accountId");

-- CreateIndex
CREATE INDEX "PaySchedule_companyId_idx" ON "PaySchedule"("companyId");

-- CreateIndex
CREATE INDEX "Paycheck_companyId_employeeId_idx" ON "Paycheck"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "Paycheck_companyId_templateId_idx" ON "Paycheck"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "Paycheck_deletedAt_idx" ON "Paycheck"("deletedAt");

-- CreateIndex
CREATE INDEX "PaycheckLine_companyId_idx" ON "PaycheckLine"("companyId");

-- CreateIndex
CREATE INDEX "PaycheckTax_companyId_idx" ON "PaycheckTax"("companyId");

-- CreateIndex
CREATE INDEX "PaymentReceived_createdById_idx" ON "PaymentReceived"("createdById");

-- CreateIndex
CREATE INDEX "PaymentReceived_updatedById_idx" ON "PaymentReceived"("updatedById");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_idx" ON "PaymentReceived"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "PaymentReceived_bankAccountId_idx" ON "PaymentReceived"("bankAccountId");

-- CreateIndex
CREATE INDEX "PaymentReceived_undepositedBatchId_idx" ON "PaymentReceived"("undepositedBatchId");

-- CreateIndex
CREATE INDEX "PaymentReceived_deletedAt_idx" ON "PaymentReceived"("deletedAt");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_deletedAt_idx" ON "PaymentReceived"("companyId", "paymentDate", "deletedAt");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_paymentDate_isDeposited_deletedAt_idx" ON "PaymentReceived"("companyId", "paymentDate", "isDeposited", "deletedAt");

-- CreateIndex
CREATE INDEX "PayrollRun_companyId_status_idx" ON "PayrollRun"("companyId", "status");

-- CreateIndex
CREATE INDEX "PayrollRun_deletedAt_idx" ON "PayrollRun"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_companyId_startDate_endDate_key" ON "PayrollRun"("companyId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PayrollRunEmployee_companyId_idx" ON "PayrollRunEmployee"("companyId");

-- CreateIndex
CREATE INDEX "Project_companyId_status_idx" ON "Project"("companyId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_status_idx" ON "PurchaseOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_templateId_idx" ON "PurchaseOrder"("companyId", "templateId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_deletedAt_idx" ON "PurchaseOrder"("deletedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_companyId_idx" ON "PurchaseOrderLine"("companyId");

-- CreateIndex
CREATE INDEX "RecurringInvoice_companyId_nextRun_idx" ON "RecurringInvoice"("companyId", "nextRun");

-- CreateIndex
CREATE INDEX "RecurringInvoice_deletedAt_idx" ON "RecurringInvoice"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE INDEX "SearchIndexingQueue_tenantId_createdAt_idx" ON "SearchIndexingQueue"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "StockLevel_companyId_itemId_idx" ON "StockLevel"("companyId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_companyId_itemId_stockLocationId_key" ON "StockLevel"("companyId", "itemId", "stockLocationId");

-- CreateIndex
CREATE INDEX "StockLocation_companyId_name_idx" ON "StockLocation"("companyId", "name");

-- CreateIndex
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "Subscription_practiceId_idx" ON "Subscription"("practiceId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_practiceId_key" ON "Subscription"("practiceId");

-- CreateIndex
CREATE INDEX "Task_companyId_idx" ON "Task"("companyId");

-- CreateIndex
CREATE INDEX "Task_practiceId_idx" ON "Task"("practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_companyId_code_key" ON "TaxCode"("companyId", "code");

-- CreateIndex
CREATE INDEX "TaxCodeAccount_companyId_taxCodeId_accountId_idx" ON "TaxCodeAccount"("companyId", "taxCodeId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCodeAccount_companyId_taxCodeId_accountId_key" ON "TaxCodeAccount"("companyId", "taxCodeId", "accountId");

-- CreateIndex
CREATE INDEX "TaxCodeRate_companyId_taxCodeId_idx" ON "TaxCodeRate"("companyId", "taxCodeId");

-- CreateIndex
CREATE INDEX "TaxJurisdiction_countryId_idx" ON "TaxJurisdiction"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_countryId_region_code_key" ON "TaxJurisdiction"("countryId", "region", "code");

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
CREATE UNIQUE INDEX "Tenant_ownerUserId_key" ON "Tenant"("ownerUserId");

-- CreateIndex
CREATE INDEX "Tenant_ownerUserId_idx" ON "Tenant"("ownerUserId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_isemailverified_idx" ON "User"("email", "isemailverified");

-- CreateIndex
CREATE INDEX "User_phone_isphoneverified_idx" ON "User"("phone", "isphoneverified");

-- CreateIndex
CREATE INDEX "Vendor_tenantId_idx" ON "Vendor"("tenantId");

-- CreateIndex
CREATE INDEX "VendorCredit_companyId_templateId_idx" ON "VendorCredit"("companyId", "templateId");

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
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCapabilities" ADD CONSTRAINT "WorkspaceCapabilities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroup" ADD CONSTRAINT "ConsolidationGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroupMember" ADD CONSTRAINT "ConsolidationGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ConsolidationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationGroupMember" ADD CONSTRAINT "ConsolidationGroupMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "WorkspaceUser"("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "WorkspaceUser"("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_fromCompanyId_fkey" FOREIGN KEY ("fromCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_toCompanyId_fkey" FOREIGN KEY ("toCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_fromJournalEntryId_fkey" FOREIGN KEY ("fromJournalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercompanyTransaction" ADD CONSTRAINT "IntercompanyTransaction_toJournalEntryId_fkey" FOREIGN KEY ("toJournalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsolidationEntry" ADD CONSTRAINT "ConsolidationEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_depreciationExpenseAccountId_fkey" FOREIGN KEY ("depreciationExpenseAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_tenantId_assigneeId_fkey" FOREIGN KEY ("tenantId", "assigneeId") REFERENCES "WorkspaceUser"("tenantId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "AiModel" ADD CONSTRAINT "AiModel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModel" ADD CONSTRAINT "AiModel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelRun" ADD CONSTRAINT "AiModelRun_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureStore" ADD CONSTRAINT "FeatureStore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureStore" ADD CONSTRAINT "FeatureStore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVector" ADD CONSTRAINT "FeatureVector_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgentTask" ADD CONSTRAINT "AiAgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceRule" ADD CONSTRAINT "AiGovernanceRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceRule" ADD CONSTRAINT "AiGovernanceRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGovernanceTrigger" ADD CONSTRAINT "AiGovernanceTrigger_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AiGovernanceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "DataQualityScore" ADD CONSTRAINT "DataQualityScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataQualityScore" ADD CONSTRAINT "DataQualityScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAllocation" ADD CONSTRAINT "FundAllocation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Property" ADD CONSTRAINT "Property_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyUnit" ADD CONSTRAINT "PropertyUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "PropertyUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRetention" ADD CONSTRAINT "ContractRetention_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionEntry" ADD CONSTRAINT "RetentionEntry_retentionId_fkey" FOREIGN KEY ("retentionId") REFERENCES "ContractRetention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTerm" ADD CONSTRAINT "PaymentTerm_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalThreshold" ADD CONSTRAINT "ApprovalThreshold_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingLock" ADD CONSTRAINT "PostingLock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingLock" ADD CONSTRAINT "PostingLock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "PayrollTaxReturn" ADD CONSTRAINT "PayrollTaxReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "BankReconciliationLine" ADD CONSTRAINT "BankReconciliationLine_journalEntryLineId_fkey" FOREIGN KEY ("journalEntryLineId") REFERENCES "JournalEntryLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSegment" ADD CONSTRAINT "AccountSegment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_cashFlowCategoryId_fkey" FOREIGN KEY ("cashFlowCategoryId") REFERENCES "CashFlowCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099" ADD CONSTRAINT "Form1099_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_taxInfo_fkey" FOREIGN KEY ("taxInfoId") REFERENCES "EmployeeTaxInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_i9Form_fkey" FOREIGN KEY ("i9FormId") REFERENCES "FormI9"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paycheck" ADD CONSTRAINT "Paycheck_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaycheckLine" ADD CONSTRAINT "PaycheckLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "InventoryAdjustmentRequest" ADD CONSTRAINT "InventoryAdjustmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "TaxCodeRate" ADD CONSTRAINT "TaxCodeRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTax" ADD CONSTRAINT "LineTax_quoteLineId_fkey" FOREIGN KEY ("quoteLineId") REFERENCES "QuoteLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "InvoiceLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueSchedule" ADD CONSTRAINT "RevenueSchedule_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxReturn" ADD CONSTRAINT "SalesTaxReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTaxPayment" ADD CONSTRAINT "SalesTaxPayment_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SalesTaxReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExecutionLog" ADD CONSTRAINT "RecurringExecutionLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RecurringSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewaySettlement" ADD CONSTRAINT "PaymentGatewaySettlement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewaySettlement" ADD CONSTRAINT "PaymentGatewaySettlement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatewayPayout" ADD CONSTRAINT "PaymentGatewayPayout_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "PaymentGatewaySettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomReportBuilder" ADD CONSTRAINT "CustomReportBuilder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaxInfo" ADD CONSTRAINT "EmployeeTaxInfo_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormI9" ADD CONSTRAINT "FormI9_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_undepositedBatchId_fkey" FOREIGN KEY ("undepositedBatchId") REFERENCES "UndepositedFundsBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningProfile" ADD CONSTRAINT "DunningProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningNotice" ADD CONSTRAINT "DunningNotice_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatement" ADD CONSTRAINT "CustomerStatement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionReminder" ADD CONSTRAINT "SubscriptionReminder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeReason" ADD CONSTRAINT "DisputeReason_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "DisputeReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chargeback" ADD CONSTRAINT "Chargeback_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceived"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedRule" ADD CONSTRAINT "BankFeedRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFeedConnection" ADD CONSTRAINT "BankFeedConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDeposit" ADD CONSTRAINT "BankDeposit_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UndepositedFundsBatch" ADD CONSTRAINT "UndepositedFundsBatch_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDepositLine" ADD CONSTRAINT "BankDepositLine_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "BankDeposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDepositLine" ADD CONSTRAINT "BankDepositLine_paymentReceivedId_fkey" FOREIGN KEY ("paymentReceivedId") REFERENCES "PaymentReceived"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositSlip" ADD CONSTRAINT "DepositSlip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillLine" ADD CONSTRAINT "BillLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRefund" ADD CONSTRAINT "CustomerRefund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "VendorRefund" ADD CONSTRAINT "VendorRefund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "WriteOff" ADD CONSTRAINT "WriteOff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_customerRefundId_fkey" FOREIGN KEY ("customerRefundId") REFERENCES "CustomerRefund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_vendorRefundId_fkey" FOREIGN KEY ("vendorRefundId") REFERENCES "VendorRefund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundApproval" ADD CONSTRAINT "RefundApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundReason" ADD CONSTRAINT "RefundReason_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveJob" ADD CONSTRAINT "ArchiveJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveJob" ADD CONSTRAINT "ArchiveJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityVersion" ADD CONSTRAINT "EntityVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityVersion" ADD CONSTRAINT "EntityVersion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialMetric" ADD CONSTRAINT "FinancialMetric_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRetentionPolicy" ADD CONSTRAINT "DataRetentionPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRetentionPolicy" ADD CONSTRAINT "DataRetentionPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRetention" ADD CONSTRAINT "DocumentRetention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRetention" ADD CONSTRAINT "DocumentRetention_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRenderLog" ADD CONSTRAINT "DocumentRenderLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRenderLog" ADD CONSTRAINT "DocumentRenderLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialControl" ADD CONSTRAINT "FinancialControl_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "ExternalSystemConfig" ADD CONSTRAINT "ExternalSystemConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemConfig" ADD CONSTRAINT "ExternalSystemConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAudit" ADD CONSTRAINT "ExternalSystemAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAudit" ADD CONSTRAINT "ExternalSystemAudit_systemConfigId_fkey" FOREIGN KEY ("systemConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAccessLog" ADD CONSTRAINT "ExternalSystemAccessLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSystemAccessLog" ADD CONSTRAINT "ExternalSystemAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_integrationConfigId_fkey" FOREIGN KEY ("integrationConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemHealthStatus" ADD CONSTRAINT "SystemHealthStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEntity" ADD CONSTRAINT "ExternalEntity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEntity" ADD CONSTRAINT "ExternalEntity_integrationConfigId_fkey" FOREIGN KEY ("integrationConfigId") REFERENCES "ExternalSystemConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "_TaxReturnToUncertainTaxPosition" ADD CONSTRAINT "_TaxReturnToUncertainTaxPosition_A_fkey" FOREIGN KEY ("A") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxReturnToUncertainTaxPosition" ADD CONSTRAINT "_TaxReturnToUncertainTaxPosition_B_fkey" FOREIGN KEY ("B") REFERENCES "UncertainTaxPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
