# Prisma Schema Flowchart (Readable Overview)

**Recent schema updates:**
- Converted several free-form `status` strings to enums for better integrity: `Invoice.status → InvoiceStatus`, `Bill.status → BillStatus`, `Dispute.status → DisputeStatus`, `Chargeback.status → ChargebackStatus`, `BirFormSubmission.status → FilingStatus`, `LocalTaxObligation.status → LocalTaxObligationStatus`, `InventoryAdjustmentRequest/Approval.status → InventoryAdjustmentStatus`, `BankDeposit.status → BankDepositStatus`, `BankReconciliation.status → BankReconciliationStatus`.
- Added JSON documentation examples for `BirFormTemplate.structure` and `TaxRule.rules` to guide form/tax-rule authors.
- Added DB check constraints (e.g., tax rate bounds, payroll period format) to `docs/db_constraints.sql`.
- Added soft-delete fields (`deletedAt`) to core transactions: `Invoice`, `Bill`, `JournalEntry`, `PaymentReceived`, `BillPayment`, `InventoryTransaction`, `Quote`, `PurchaseOrder`, `RecurringInvoice`, `PayrollRun`, `Paycheck`.
- Added **DocumentSequence** and a DB-side function `next_document_number(company_uuid, document_type)` (see `docs/migrations/001_document_sequence_and_constraints.sql`) to provide atomic invoice/bill numbering, plus a per-company invoice unique constraint.
- Added audit fields (`createdById`, `updatedById`) to governance-critical tables like `Invoice` and `JournalEntry` to improve traceability.
- Added DB-level integrity checks and search/partial indexes via `docs/migrations/002_constraints_and_indexes.sql` (XOR scope checks, date-order checks, non-negative checks, and GIN search indexes).
- Added compliance/control models (DataRetentionPolicy, FinancialControl, ControlViolation, AccountingValidation, DocumentRetention, SubsidiaryLedger) plus forecasting and reconciliation exceptions.

This diagram focuses on the **core flow** in your current `prisma.schema`: Workspace → Company/Practice → Subscription → Operations, plus banking, refunds, and governance.

## 1) Users, Workspace, Roles
```mermaid
flowchart TD
  U[User]
  W[Workspace]
  WU[WorkspaceUser]
  CU[CompanyUser]
  PU[PracticeUser]
  R[Role]
  RP[RolePermission]
  P[Permission]
  WI[WorkspaceInvite]
  WC[WorkspaceCapabilities]

  U -->|owns| W
  U -->|member| WU
  WU -->|roleId| R
  R --> RP
  RP --> P
  W --> WI
  W --> WC
  CU --> WU
  PU --> WU
```

## 2) Business Owners, Plans & Billing
```mermaid
flowchart TD
  W[Workspace]
  C[Company]
  PR[Practice]
  CU[CompanyUser]
  PU[PracticeUser]
  S[Subscription]
  PL[Plan]
  PF[PlanFeature]
  F[Feature]

  W --> C
  W --> PR
  C --> CU
  PR --> PU
  C -->|subscription| S
  PR -->|subscription| S
  S --> PL
  PL --> PF
  PF --> F
```

## 3) Onboarding (per Company/Practice)
```mermaid
flowchart TD
  C[Company]
  PR[Practice]
  OS[OnboardingStep]

  C --> OS
  PR --> OS
```

## 4) Accounting Core (Company-scoped)
```mermaid
flowchart TD
  C[Company]
  A[Account]
  AS[AccountSubType]
  AB[AccountBalance]
  OB[OpeningBalance]
  JE[JournalEntry]
  JEL[JournalEntryLine]

  C --> A
  C --> AS
  C --> AB
  C --> OB
  C --> JE
  JE --> JEL
  JEL --> A
```

## 5) Sales (AR) + Receipts/Refunds + Collections
```mermaid
flowchart TD
  C[Company]
  Q[Quote]
  QL[QuoteLine]
  INV[Invoice<br/>status=InvoiceStatus<br/>paymentStatus=PaymentStatus]
  INVL[InvoiceLine]
  IPA[InvoicePaymentApplication]
  PR[PaymentReceived]
  BD[BankDeposit<br/>status=BankDepositStatus]
  BDL[BankDepositLine]
  CR[CustomerRefund]
  WO[WriteOff]
  RR[RefundReason]
  RA[RefundApproval]
  PT[PaymentTerm]
  PM[PaymentMethod<br/>type=PaymentMethodType]
  PL[PriceList]
  PLI[PriceListItem]
  CC[CustomerCredit]
  CCL[CustomerCreditLine]
  CCA[CustomerCreditApplication]
  DP[DunningProfile]
  DS[DunningStep]
  DR[DunningRun]
  DN[DunningNotice]
  CS[CustomerStatement]
  PRM[PaymentReminder]
  DSP[Dispute<br/>status=DisputeStatus]
  DSR[DisputeReason]
  CB[Chargeback<br/>status=ChargebackStatus]
  RI[RecurringInvoice<br/>status=RecurringInvoiceStatus]
  RS[RecurringSchedule]
  REL[RecurringExecutionLog]

  C --> Q
  Q --> QL
  Q -->|converts to| INV
  C --> INV
  INV --> INVL
  C --> IPA
  C --> PR
  PR --> IPA
  PR --> BD
  BD --> BDL
  C --> CR
  CR --> RR
  CR --> RA
  INV --> WO
  C --> PT
  C --> PM
  PM[PaymentMethod<br/>type=PaymentMethodType]
  C --> PL
  PL --> PLI
  C --> CC
  CC --> CCL
  C --> CCA
  C --> DP
  DP --> DS
  DP --> DR
  DR --> DN
  C --> CS
  C --> PRM
  C --> DSP
  DSP --> DSR
  C --> CB
  C --> RI
  RI --> RS
  RS --> REL
```

## 5.1) Document sequencing & atomic numbering
```mermaid
flowchart TD
  DS[DocumentSequence]
  NF["next_document_number(company_uuid, INVOICE)"]
  INV["Invoice<br/>unique per company"]
  DS --> NF --> INV
  INV -->|enforced by migration| UNIQUE[Unique_Constraint]
```

*Notes:* For production safety, the DB function `next_document_number` is used from application code inside a transaction (see `docs/migrations/001_document_sequence_and_constraints.sql`).

## 6) Purchases (AP) + Payments/Refunds
```mermaid
flowchart TD
  C[Company]
  BILL[Bill<br/>status=BillStatus<br/>paymentStatus=PaymentStatus]
  PO[PurchaseOrder<br/>status=PurchaseOrderStatus]
  POL[PurchaseOrderLine]
  BILL_L[BillLine]
  BP[BillPayment]
  BPA[BillPaymentApplication]
  VC[VendorCredit]
  VCL[VendorCreditLine]
  VR[VendorRefund]
  WO[WriteOff]
  VPM[VendorPaymentMethod]
  RA[RefundApproval]
  RR[RefundReason]

  C --> BILL
  C --> PO
  PO --> POL
  BILL --> BILL_L
  C --> BP
  C --> BPA
  C --> VC
  VC --> VCL
  C --> VR
  VR --> RR
  VR --> RA
  BILL --> WO
  C --> VPM
```

## 7) Inventory + Manufacturing + COGS
```mermaid
flowchart TD
  C[Company]
  ITEM[Item]
  IT[InventoryTransaction]
  ITL[InventoryTransactionLine]
  SLL[StockLevel]
  SLOC[StockLocation]
  ICL[InventoryCostLayer]
  IR[InventoryReserve]
  CR[COGSRecognition]
  AB[AssemblyBuild]
  AC[AssemblyComponent]
  PRUN[ProductionRun]

  C --> ITEM
  C --> IT
  IT --> ITL
  C --> SLL
  C --> SLOC
  C --> ICL
  C --> IR
  C --> CR
  C --> AB
  AB --> AC
  AB --> ITEM
  C --> PRUN
  PRUN --> ITEM
```

## 8) Treasury/Banking + Bank Feed Ingestion
```mermaid
flowchart TD
  C[Company]
  BA[BankAccount]
  BT[BankTransaction]
  BR[BankReconciliation<br/>status=BankReconciliationStatus]
  BRL[BankReconciliationLine]
  BFR[BankFeedRule]
  BFC[BankFeedConnection]
  BFA[BankFeedAccount]
  BFI[BankFeedImport]
  BTR[BankTransactionRaw]
  COSR[CashOverShortRule]
  COSE[CashOverShortEntry]
  DS[DepositSlip]

  C --> BA
  BA --> BT
  BA --> BR
  BR --> BRL
  C --> BFR
  C --> BFC
  BFC --> BFA
  BFC --> BFI
  BFI --> BTR
  BFA --> BTR
  C --> COSR
  COSR --> COSE
  BA --> DS
```

## 9) Tax, Payroll & Fixed Assets
```mermaid
flowchart TD
  C[Company]
  TAX[TaxCode/TaxRate/LineTax]
  STR[SalesTaxReturn]
  STRL[SalesTaxReturnLine]
  STP[SalesTaxPayment]
  PTR[PayrollTaxReturn]
  PTL[PayrollTaxLiability]
  PTP[PayrollTaxPayment]
  PA[PayrollAccrual]
  EMP[Employee]
  PS[PaySchedule]
  FA[FixedAsset]
  FAD[FixedAssetDepreciation]
  FAS[FixedAssetSchedule]
  DA[DepreciationAccount]
  DJ[DepreciationJournal]

  C --> TAX
  C --> STR
  STR --> STRL
  STR --> STP
  C --> PTR
  C --> PTL
  PTL --> PTP
  C --> PA
  C --> EMP
  C --> PS
  C --> FA
  FA --> FAD
  FA --> FAS
  FA --> DA
  FAS --> DJ
```

## 10) Governance, Reporting & Audit
```mermaid
flowchart TD
  W[Workspace]
  C[Company]
  PR[Practice]
  AJ[ArchiveJob]
  DRP[DataRetentionPolicy]
  DOCRET[DocumentRetention]
  FC[FinancialControl]
  CV[ControlViolation]
  AV[AccountingValidation]
  SL[SubsidiaryLedger]
  BUD[BudgetActualComparison]
  CFF[CashFlowForecast]
  CFFI[CashFlowForecastItem]
  REX[ReconciliationException]
  WF[Workflow]
  WFR[WorkflowRule]
  WRUN[WorkflowRun]
  WSTEP[WorkflowRunStep]
  AI[AI Insight]
  AP[AccountingPeriod]
  REV[Reversal]
  FSS[FinancialStatementSnapshot]
  CFS[CashFlowStatementSnapshot]
  CFC[CashFlowCategory]
  SR[SavedReport]
  FST[FinancialStatementTemplate]
  RS[ReportSection]
  CE[ClosingEntry]
  YEC[YearEndClose]
  EA[EquityAccount]
  DIV[Dividend]
  AS[AccrualSchedule]
  AE[AccrualEntry]
  IAR[InventoryAdjustmentRequest<br/>status=InventoryAdjustmentStatus]
  IAA[InventoryAdjustmentApproval<br/>status=InventoryAdjustmentStatus]
  TASK[Task]
  TC[TaskComment]
  WU[WorkspaceUser]
  AL[AuditLog]
  EL[EventLog]

  W --> TASK
  C --> TASK
  PR --> TASK
  TASK --> TC
  TASK --> WU
  W --> AJ
  W --> DRP
  C --> DRP
  C --> DOCRET
  C --> FC
  FC --> CV
  C --> AV
  C --> SL
  C --> BUD
  C --> CFF
  CFF --> CFFI
  C --> REX
  W --> WF
  C --> WF
  PR --> WF
  WF --> WFR
  WF --> WRUN
  WRUN --> WSTEP
  W --> AI
  C --> AI
  C --> AP
  C --> REV
  C --> FSS
  C --> CFS
  C --> CFC
  C --> SR
  C --> FST
  FST --> RS
  C --> CE
  C --> YEC
  C --> EA
  C --> DIV
  C --> AS
  AS --> AE
  C --> IAR
  IAR --> IAA
  W --> AL
  C --> AL
  PR --> AL
  W --> EL
```

## 11) Intercompany & Consolidation
```mermaid
flowchart TD
  W[Workspace]
  C1[Company]
  C2[Company]
  ICT[IntercompanyTransaction]
  CONS[ConsolidationEntry]
  CG[ConsolidationGroup]
  CGM[ConsolidationGroupMember]

  W --> ICT
  C1 --> ICT
  C2 --> ICT
  W --> CONS
  C1 --> CONS
  W --> CG
  CG --> CGM
  C1 --> CGM
  C2 --> CGM
```

## 12) Contractors & 1099
```mermaid
flowchart TD
  W[Workspace]
  C[Company]
  V[Vendor]
  CTR[Contractor]
  CP[ContractorPayment]
  F1099[Form1099]
  FBOX[Form1099Box]

  W --> CTR
  C --> CTR
  V --> CTR
  CTR --> CP
  CTR --> F1099
  F1099 --> FBOX
```

## 13) Integrations, Webhooks & Monitoring
```mermaid
flowchart TD
  W[Workspace]
  C[Company]
  ESC[ExternalSystemConfig]
  ESA[ExternalSystemAudit]
  APIK[ApiKey]
  ESL[ExternalSystemAccessLog]
  WH[WebhookSubscription]
  SHS[SystemHealthStatus]
  EE[ExternalEntity]
  SJ[SyncJob]

  W --> ESC
  C --> ESC
  ESC --> ESA
  ESC --> SJ
  APIK --> ESL
  W --> WH
  C --> WH
  SHS --> ESC
  EE --> ESC

  %% --------------------------------
  %% INDUSTRY SPECIFIC MODULES
  %% --------------------------------
  subgraph "Construction"
    CR[ContractRetention]
    RE[RetentionEntry]
    PROJ[Project]

    PROJ --> CR
    CR --> RE
  end

  subgraph "Retail"
    GC[GiftCard]
    LP[LoyaltyProgram]
    LA[LoyaltyAccount]

    LP --> LA
    GC -->|status| Status[(ACTIVE/REDEEMED)]
  end

  subgraph "NonProfit"
    FUND[Fund]
    DON[Donation]
    PLG[Pledge]
    FA[FundAllocation]

    DON --> FUND
    FA --> FUND
    PLG --> DON
  end

  subgraph "RealEstate"
    PROP[Property]
    UNIT[PropertyUnit]
    LEASE[Lease]

    PROP --> UNIT
    UNIT --> LEASE
  end
```

## 18) Templating & Advanced Reporting
```mermaid
flowchart TD
  W[Workspace]
  DT[DocumentTemplate]
  SR[SavedReport]
  CRB[CustomReportBuilder]
  DRL[DocumentRenderLog]

  INV[Invoice]
  Q[Quote]
  CN[CreditNote]
  DN[DebitNote]
  PO[PurchaseOrder]
  VC[VendorCredit]
  CC[CustomerCredit]
  CS[CustomerStatement]
  DS[DepositSlip]
  CH[Check]
  PK[Paycheck]

  W --> DT
  W --> SR
  W --> CRB
  W --> DRL

  %% Template relationships (layout/branding)
  DT -.->|layout| INV
  DT -.->|layout| Q
  DT -.->|layout| CN
  DT -.->|layout| DN
  DT -.->|layout| PO
  DT -.->|layout| VC
  DT -.->|layout| CC
  DT -.->|layout| CS
  DT -.->|layout| DS
  DT -.->|layout| CH
  DT -.->|layout| PK

  %% Render log captures generation events across documents
  DRL -.->|logs| INV
  DRL -.->|logs| Q
  DRL -.->|logs| CN
  DRL -.->|logs| DN
  DRL -.->|logs| PO
  DRL -.->|logs| VC
  DRL -.->|logs| CC
  DRL -.->|logs| CS
  DRL -.->|logs| DS
  DRL -.->|logs| CH
  DRL -.->|logs| PK
```

> **Notes & Ops**
>
> - **Default template uniqueness:** We enforce a single default per (companyId, type) via a Postgres partial unique index. Migration: `docs/migrations/003_unique_default_template.sql` which uses:
>   ```sql
>   CREATE UNIQUE INDEX unique_default_template_per_company_type
>   ON "DocumentTemplate" ("companyId", "type")
>   WHERE "isDefault" = true AND "deletedAt" IS NULL;
>   ```
>
> - **Render log analytics:** DESC-sorted indexes were added (see `docs/migrations/004_documentrenderlog_indexes.sql`) to accelerate recent-first queries and dashboards:
>   - `(workspaceId, companyId, renderedAt DESC)`
>   - `(workspaceId, userId, renderedAt DESC)`
>   - `(status, renderedAt DESC)`
>
> - **Template UX:** `DocumentTemplate.previewThumbnailUrl` enables quick visual selection in the UI. Use app-layer schema validation (Zod/OpenAPI) for `structure`, `design`, and `content` JSON fields.

## How to read this
- **User** owns a **Workspace** and can belong to multiple workspaces via **WorkspaceUser** (unique per workspace).
- **Workspace** is the HQ container (users, roles, invites, tasks) and *enables* Companies/Practices.
- **Company** and **Practice** each have **one Subscription** (billing is per owner).
- **Plan/Feature** models define what each subscription includes.
- **Company** is where the accounting operations live (accounts, invoices, bills, journal entries, inventory, taxes, payroll).

## Key rules (from the schema)
- One **WorkspaceUser** per (workspace, user) pair.
- One **Subscription** per Company and one per Practice.
- Onboarding is tracked **per Company/Practice** (not Workspace), via `OnboardingStep` + `onboardingMode`.

If you want a more detailed flowchart (including all accounting submodules), tell me which areas to expand.