/*
  Warnings:

  - You are about to alter the column `balance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `AccountBalance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balanceForeign` on the `AccountBalance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `oldBalance` on the `AccountBalanceAudit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `newBalance` on the `AccountBalanceAudit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `AccrualEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `AccrualSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `monthlyAmount` on the `AccrualSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `remainingAmount` on the `AccrualSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `predictedValue` on the `AiInsight` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `value` on the `AiInsightMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalIncome` on the `AlphalistEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `withholdings` on the `AlphalistEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `minAmount` on the `ApprovalThreshold` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `maxAmount` on the `ApprovalThreshold` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `proceeds` on the `AssetDisposal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `gainLoss` on the `AssetDisposal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `impairmentAmount` on the `AssetImpairment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `coverageAmount` on the `AssetInsurance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `premiumAmount` on the `AssetInsurance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `cost` on the `AssetMaintenance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `newValue` on the `AssetRevaluation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `revaluationAmount` on the `AssetRevaluation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `BankDeposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `BankDeposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseAmount` on the `BankDeposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BankDepositLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `closingBalance` on the `BankReconciliation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BankTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BankTransactionRaw` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `total` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseTotal` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `discountAmount` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `shippingAmount` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `otherCharges` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `withholdingTaxAmount` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `creditableWithholding` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `BillLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `BillLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `discountAmount` on the `BillLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BillPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `BillPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseAmount` on the `BillPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BillPaymentApplication` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `budgetAmount` on the `BudgetActualComparison` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualAmount` on the `BudgetActualComparison` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `varianceAmount` on the `BudgetActualComparison` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `variancePercent` on the `BudgetActualComparison` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `BudgetLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `BudgetLineVersion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `quantity` on the `COGSRecognition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `unitCost` on the `COGSRecognition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(19,4)`.
  - You are about to alter the column `totalCost` on the `COGSRecognition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalInflow` on the `CashFlowForecast` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalOutflow` on the `CashFlowForecast` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netFlow` on the `CashFlowForecast` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `openingBalance` on the `CashFlowForecast` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `closingBalance` on the `CashFlowForecast` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CashFlowForecastItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CashOverShortEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `thresholdAmount` on the `CashOverShortRule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ChangeOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `approvedAmount` on the `ChangeOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `unitCost` on the `ChangeOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ChangeOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Chargeback` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Check` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `ConsolidationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `translationAdjustment` on the `ConsolidationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `contractAmount` on the `ConstructionProject` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `estimatedCost` on the `ConstructionProject` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualCost` on the `ConstructionProject` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `grossProfit` on the `ConstructionProject` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `profitMargin` on the `ConstructionProject` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(19,4)`.
  - You are about to alter the column `totalWithheld` on the `ContractRetention` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalReleased` on the `ContractRetention` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ContractorPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CostCodeAllocation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `defaultVatRate` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `defaultCorporateTaxRate` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `totalAmount` on the `CreditNote` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalGainLoss` on the `CurrencyRevaluation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `foreignBalance` on the `CurrencyRevaluationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `CurrencyRevaluationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseBalance` on the `CurrencyRevaluationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `unrealizedGainLoss` on the `CurrencyRevaluationEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `debit` on the `CurrencyRevaluationLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `credit` on the `CurrencyRevaluationLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `total` on the `CustomerCredit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `CustomerCredit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CustomerCreditApplication` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CustomerCreditLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `CustomerRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `CustomerRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseAmount` on the `CustomerRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `DebitNote` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `temporaryDifference` on the `DeferredTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `taxRate` on the `DeferredTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `deferredAmount` on the `DeferredTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `DepreciationJournal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Dispute` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amountPerShare` on the `Dividend` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `Dividend` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Donation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `givingCapacity` on the `DonorManagement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalGiven` on the `DonorManagement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `lifetimeValue` on the `DonorManagement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `payRate` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(8,4)`.
  - You are about to alter the column `principalAmount` on the `EmployeeLoan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `interestRate` on the `EmployeeLoan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `balance` on the `EmployeeLoan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `EmployeeLoanPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `interestAmount` on the `EmployeeLoanPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `principalAmount` on the `EmployeeLoanPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `parValue` on the `EquityAccount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `shares` on the `EquityAccount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `value` on the `EsgMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Estimate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `ExchangeRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(8,4)`.
  - You are about to alter the column `totalAmount` on the `ExpenseClaim` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ExpenseClaimLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `minValue` on the `FeatureStore` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `maxValue` on the `FeatureStore` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `avgValue` on the `FeatureStore` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `stdDev` on the `FeatureStore` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `FinalTaxDeduction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `value` on the `FinancialMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `benchmark` on the `FinancialMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `cost` on the `FixedAsset` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `salvageValue` on the `FixedAsset` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `FixedAssetDepreciation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `FixedAssetSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `originalAmount` on the `ForeignCurrencyGainLoss` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `baseAmount` on the `ForeignCurrencyGainLoss` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `ForeignCurrencyGainLoss` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `gainLoss` on the `ForeignCurrencyGainLoss` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `Form1099` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Form1099Box` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Form2307` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `withheldAmount` on the `Form2307` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `Fund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `FundAllocation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `initialBalance` on the `GiftCard` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `currentBalance` on the `GiftCard` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `GovernmentContributionPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `awardAmount` on the `Grant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `spentAmount` on the `Grant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `remainingAmount` on the `Grant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `GrantBudget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `spentAmount` on the `GrantBudget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `GrantExpense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `IntercompanyTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `quantity` on the `InventoryCostLayer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `remainingQty` on the `InventoryCostLayer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `unitCost` on the `InventoryCostLayer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `InventoryReserve` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `qty` on the `InventoryTransactionLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `unitCost` on the `InventoryTransactionLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(19,4)`.
  - You are about to alter the column `total` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseTotal` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `discountAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `shippingAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `otherCharges` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `withholdingTaxAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `finalTaxAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `discountAmount` on the `InvoiceLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `InvoicePaymentApplication` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `salesPrice` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `purchaseCost` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `standardCost` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseTotal` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `debit` on the `JournalEntryLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `credit` on the `JournalEntryLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `LandedCost` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `LandedCostLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rentAmount` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `securityDeposit` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `LetterOfCredit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Lien` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `LineTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `estimatedAmount` on the `LocalTaxObligation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `paidAmount` on the `LocalTaxObligation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `defaultRate` on the `LocalTaxTypeConfig` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,4)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `OpeningBalance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `grossAmount` on the `Paycheck` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netAmount` on the `Paycheck` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PaycheckLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PaycheckTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PaymentGatewayPayout` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `grossAmount` on the `PaymentGatewaySettlement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `feeAmount` on the `PaymentGatewaySettlement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netAmount` on the `PaymentGatewaySettlement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PaymentReceived` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `PaymentReceived` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseAmount` on the `PaymentReceived` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Payout` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PayrollAccrual` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `grossAmount` on the `PayrollRunEmployee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netAmount` on the `PayrollRunEmployee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PayrollTaxLiability` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `paidAmount` on the `PayrollTaxLiability` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PayrollTaxPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalTax` on the `PayrollTaxReturn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `PercentageTax` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `maxAmount` on the `PettyCashFund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `currentAmount` on the `PettyCashFund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `PettyCashVoucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `Pledge` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amountPaid` on the `Pledge` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `arBalance` on the `PracticeHealthMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `apBalance` on the `PracticeHealthMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `wipBalance` on the `PracticeHealthMetric` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `predictedValue` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `lowerBound` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `upperBound` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualValue` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `price` on the `PriceListItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `standardCost` on the `ProductionRun` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualCost` on the `ProductionRun` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `varianceAmount` on the `ProductionRun` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `budgetAmount` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ProjectLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `budgetAllocated` on the `ProjectMilestone` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualCost` on the `ProjectMilestone` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `budget` on the `ProjectPhaseLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `actualCost` on the `ProjectPhaseLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `marketRent` on the `PropertyUnit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `total` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `PurchaseOrderLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `PurchaseOrderLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `PurchaseRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `estimatedUnitPrice` on the `PurchaseRequestLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `unitPrice` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `QuoteLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ReconciliationException` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `RetentionEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amountWithheld` on the `RetentionSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `releaseAmount` on the `RetentionSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `percentage` on the `RevenueRecognitionPhase` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `RevenueRecognitionPhase` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `RevenueRecognitionSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `recognizedToDate` on the `RevenueRecognitionSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `RevenueSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `recognizedAmount` on the `RevenueSchedule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `SalesOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `unitPrice` on the `SalesOrderLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(16,6)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `SalesOrderLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `SalesTaxPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalTax` on the `SalesTaxReturn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `taxableAmount` on the `SalesTaxReturnLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `taxAmount` on the `SalesTaxReturnLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `standardCost` on the `StandardCostVersion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `varianceTotal` on the `StockCount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `systemQty` on the `StockCountLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `countedQty` on the `StockCountLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `variance` on the `StockCountLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(19,4)`.
  - You are about to alter the column `quantity` on the `StockLevel` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(16,6)`.
  - You are about to alter the column `reserved` on the `StockLevel` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,6)` to `Decimal(19,4)`.
  - You are about to alter the column `glBalance` on the `SubledgerReconciliation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `subledgerBalance` on the `SubledgerReconciliation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `difference` on the `SubledgerReconciliation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalBalance` on the `SubsidiaryLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `originalAmount` on the `TaxAttributeCarryforward` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `remainingAmount` on the `TaxAttributeCarryforward` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `surrenderedAmount` on the `TaxAttributeCarryforward` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `ratePct` on the `TaxCodeRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `reducedRate` on the `TaxIncentive` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `potentialSavings` on the `TaxOptimizationSuggestion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `TaxPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `currentTax` on the `TaxProvision` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `deferredTax` on the `TaxProvision` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalTax` on the `TaxProvision` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `effectiveTaxRate` on the `TaxProvision` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `rate` on the `TaxRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `thresholdAmount` on the `TaxRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exemptionAmount` on the `TaxRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalTax` on the `TaxReturn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalPenalty` on the `TaxReturn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalInterest` on the `TaxReturn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `taxableAmount` on the `TaxReturnLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `taxAmount` on the `TaxReturnLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `ThirteenthMonthPay` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `accrualRate` on the `TimeOffBalance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,6)` to `Decimal(8,4)`.
  - You are about to alter the column `probableAmount` on the `UncertainTaxPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `possibleRangeLow` on the `UncertainTaxPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `possibleRangeHigh` on the `UncertainTaxPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `totalAmount` on the `UndepositedFundsBatch` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `VarianceJournal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `openingBalance` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `inputVat` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `outputVat` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `reverseChargeVat` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `nonRecoverableVat` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `vatPayable` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `vatReceivable` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netPosition` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `creditableWithholding` on the `VatLedger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `thresholdAmount` on the `VatRegistration` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `quarterlyThreshold` on the `VatRegistration` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `annualThreshold` on the `VatRegistration` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `netAmount` on the `VatTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `vatAmount` on the `VatTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `vatRate` on the `VatTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `total` on the `VendorCredit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `balance` on the `VendorCredit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `VendorCreditLine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `VendorRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `exchangeRate` on the `VendorRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,12)` to `Decimal(18,12)`.
  - You are about to alter the column `baseAmount` on the `VendorRefund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `WithholdingTaxCertificate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.
  - You are about to alter the column `rate` on the `WithholdingTaxDeduction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(8,4)`.
  - You are about to alter the column `amount` on the `WriteOff` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(19,4)`.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AccountBalance" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "balanceForeign" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AccountBalanceAudit" ALTER COLUMN "oldBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "newBalance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AccrualEntry" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AccrualSchedule" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "monthlyAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AiAgent" ALTER COLUMN "successRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "AiChatMessage" ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AiInsight" ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "impactScore" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "predictedValue" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AiInsightMetric" ALTER COLUMN "value" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AiModelRun" ALTER COLUMN "costEstimate" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AlphalistEntry" ALTER COLUMN "totalIncome" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "withholdings" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ApprovalThreshold" ALTER COLUMN "minAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "maxAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AssemblyBuild" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6);

-- AlterTable
ALTER TABLE "AssemblyComponent" ALTER COLUMN "quantityUsed" SET DATA TYPE DECIMAL(16,6);

-- AlterTable
ALTER TABLE "AssetDisposal" ALTER COLUMN "proceeds" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "gainLoss" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AssetImpairment" ALTER COLUMN "impairmentAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AssetInsurance" ALTER COLUMN "coverageAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "premiumAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AssetMaintenance" ALTER COLUMN "cost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "AssetRevaluation" ALTER COLUMN "newValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "revaluationAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BankDeposit" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BankDepositLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BankReconciliation" ALTER COLUMN "closingBalance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BankTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BankTransactionRaw" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "total" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "shippingAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "otherCharges" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "withholdingTaxAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "creditableWithholding" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BillLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "discountPercent" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BillPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BillPaymentApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BudgetActualComparison" ALTER COLUMN "budgetAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "varianceAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "variancePercent" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "BudgetLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "BudgetLineVersion" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "COGSRecognition" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CashFlowForecast" ALTER COLUMN "totalInflow" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalOutflow" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netFlow" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "openingBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "closingBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CashFlowForecastItem" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CashOverShortEntry" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CashOverShortRule" ALTER COLUMN "thresholdAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ChangeOrder" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "approvedAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ChangeOrderItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Chargeback" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Check" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "vatRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "ConsolidationEntry" ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "translationAdjustment" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ConstructionProject" ALTER COLUMN "contractAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "estimatedCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "grossProfit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "profitMargin" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ContractRetention" ALTER COLUMN "retentionPercent" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "totalWithheld" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalReleased" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ContractorPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CostCodeAllocation" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6);

-- AlterTable
ALTER TABLE "Country" ALTER COLUMN "defaultVatRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "defaultCorporateTaxRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "CreditNote" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CurrencyRevaluation" ALTER COLUMN "totalGainLoss" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CurrencyRevaluationEntry" ALTER COLUMN "foreignBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "unrealizedGainLoss" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CurrencyRevaluationLine" ALTER COLUMN "debit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "credit" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "creditLimit" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CustomerCredit" ALTER COLUMN "total" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CustomerCreditApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CustomerCreditLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "CustomerRefund" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "DataQualityScore" ALTER COLUMN "score" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "DebitNote" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "DeferredTax" ALTER COLUMN "temporaryDifference" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "deferredAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "DepreciationJournal" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Dispute" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Dividend" ALTER COLUMN "amountPerShare" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "DonorManagement" ALTER COLUMN "givingCapacity" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalGiven" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "lifetimeValue" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "payRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "EmployeeLoan" ALTER COLUMN "principalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "EmployeeLoanPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "interestAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "principalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "EmployeeTaxInfo" ALTER COLUMN "extraWithholding" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "EquityAccount" ALTER COLUMN "parValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "shares" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "EsgMetric" ALTER COLUMN "value" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Estimate" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ExchangeRate" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "ExpenseClaim" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ExpenseClaimLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FeatureStore" ALTER COLUMN "minValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "maxValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "avgValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "stdDev" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FinalTaxDeduction" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "FinancialMetric" ALTER COLUMN "value" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "benchmark" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FinancialRatio" ALTER COLUMN "value" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "benchmark" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "industryAverage" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FixedAsset" ALTER COLUMN "cost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "salvageValue" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FixedAssetDepreciation" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FixedAssetSchedule" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ForeignCurrencyGainLoss" ALTER COLUMN "originalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "gainLoss" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Form1099" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Form1099Box" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Form2307" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "withheldAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Fund" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "FundAllocation" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "percentage" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "GiftCard" ALTER COLUMN "initialBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "currentBalance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "GovernmentContributionPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Grant" ALTER COLUMN "awardAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "spentAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "GrantBudget" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "spentAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "GrantExpense" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "IntercompanyTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "InventoryCostLayer" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "remainingQty" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "InventoryReserve" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "InventoryTransactionLine" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "total" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "shippingAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "otherCharges" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "withholdingTaxAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "finalTaxAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "InvoiceLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "rate" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "discountPercent" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "InvoicePaymentApplication" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "salesPrice" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "purchaseCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "standardCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "maxDiscountPercent" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "JournalEntryLine" ALTER COLUMN "debit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "credit" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LandedCost" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LandedCostLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "rentAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "securityDeposit" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LetterOfCredit" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Lien" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LineTax" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LocalTaxObligation" ALTER COLUMN "estimatedAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "LocalTaxTypeConfig" ALTER COLUMN "defaultRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "LocaleConfiguration" ALTER COLUMN "defaultVatRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "defaultWithholdingRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "pointsPerDollar" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "redemptionRatio" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "OpeningBalance" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Paycheck" ALTER COLUMN "grossAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaycheckLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaycheckTax" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaymentGatewayPayout" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaymentGatewaySettlement" ALTER COLUMN "grossAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "feeAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaymentReceived" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PaymentTerm" ALTER COLUMN "discountPct" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollAccrual" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollRunEmployee" ALTER COLUMN "grossAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollTaxLiability" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollTaxPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollTaxReturn" ALTER COLUMN "totalTax" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PercentageTax" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "PettyCashFund" ALTER COLUMN "maxAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PettyCashVoucher" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PhilippinePayrollDeduction" ALTER COLUMN "employeeShare" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "employerShare" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Pledge" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PracticeHealthMetric" ALTER COLUMN "arBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "apBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "wipBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "efficiencyScore" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Prediction" ALTER COLUMN "predictedValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "lowerBound" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "upperBound" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualValue" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "accuracy" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PriceListItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ProductionRun" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "standardCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "varianceAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "budgetAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ProjectLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ProjectMilestone" ALTER COLUMN "completionPct" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "budgetAllocated" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ProjectPhaseLog" ALTER COLUMN "budget" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "actualCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PropertyUnit" ALTER COLUMN "marketRent" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "total" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PurchaseOrderLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PurchaseRequest" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PurchaseRequestLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "estimatedUnitPrice" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "QuoteLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ReconciliationException" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RelatedParty" ALTER COLUMN "ownershipPercentage" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "ResourceAllocation" ALTER COLUMN "hoursAlloc" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RetentionEntry" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RetentionSchedule" ALTER COLUMN "retentionPercent" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "amountWithheld" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "releasePercent" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "releaseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RevenueRecognitionPhase" ALTER COLUMN "percentage" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RevenueRecognitionSchedule" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "recognizedToDate" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "RevenueSchedule" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "recognizedAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SalesOrder" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SalesOrderLine" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SalesTaxPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SalesTaxReturn" ALTER COLUMN "totalTax" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SalesTaxReturnLine" ALTER COLUMN "taxableAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "StandardCostVersion" ALTER COLUMN "standardCost" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "StockCount" ALTER COLUMN "varianceTotal" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "StockCountLine" ALTER COLUMN "systemQty" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "countedQty" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "variance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "StockLevel" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(16,6),
ALTER COLUMN "reserved" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SubledgerReconciliation" ALTER COLUMN "glBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "subledgerBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "difference" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "SubsidiaryLedger" ALTER COLUMN "totalBalance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxAttributeCarryforward" ALTER COLUMN "originalAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "surrenderedAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxCodeRate" ALTER COLUMN "ratePct" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "TaxIncentive" ALTER COLUMN "reducedRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "TaxOptimizationSuggestion" ALTER COLUMN "potentialSavings" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxProvision" ALTER COLUMN "currentTax" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "deferredTax" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalTax" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "effectiveTaxRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "TaxRate" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "thresholdAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exemptionAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxReturn" ALTER COLUMN "totalTax" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalPenalty" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalInterest" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxReturnLine" ALTER COLUMN "taxableAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TaxRiskScore" ALTER COLUMN "overallScore" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "ThirteenthMonthPay" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TimeEntry" ALTER COLUMN "hours" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "TimeOffBalance" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "accrualRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "TimeOffRequest" ALTER COLUMN "hours" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "UncertainTaxPosition" ALTER COLUMN "probableAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "possibleRangeLow" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "possibleRangeHigh" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "UndepositedFundsBatch" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VarianceJournal" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VatLedger" ALTER COLUMN "openingBalance" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "inputVat" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "outputVat" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "reverseChargeVat" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "nonRecoverableVat" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "vatPayable" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "vatReceivable" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netPosition" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "creditableWithholding" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VatRegistration" ALTER COLUMN "thresholdAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "quarterlyThreshold" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "annualThreshold" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VatTransaction" ALTER COLUMN "netAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "vatAmount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "vatRate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "defaultWithholding" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VendorCredit" ALTER COLUMN "total" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VendorCreditLine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "VendorRefund" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,12),
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "WithholdingTaxCertificate" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "WithholdingTaxDeduction" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(8,4);

-- AlterTable
ALTER TABLE "WorkspaceBillingInvoice" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "WriteOff" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "account_settings" ALTER COLUMN "budgetWarningThreshold" SET DATA TYPE DECIMAL(19,4);
