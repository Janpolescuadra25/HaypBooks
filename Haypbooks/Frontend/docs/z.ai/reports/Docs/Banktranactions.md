




BANKTRANSACTIONS101
Bank Transaction Processing Guide

QuickBooks vs HaypBooks Implementation Analysis


Categorization | Matching | Splitting | Transfers | Auto-Detection | Rules Engine

January 2025 | HaypBooks Technical Documentation
 
Table of Contents
1. Executive Summary  ..................................................  3
2. QuickBooks Bank Transaction Architecture  ..................................................  4
    2.1 Bank Feed Connection Flow  ..................................................  4
    2.2 Transaction Categorization Engine  ..................................................  5
    2.3 Transaction Matching System  ..................................................  6
    2.4 Transaction Splitting  ..................................................  7
    2.5 Transfer Detection  ..................................................  8
    2.6 Bank Rules Engine  ..................................................  9
3. HaypBooks Current Schema Analysis  ..................................................  10
    3.1 Existing Banking Models  ..................................................  10
    3.2 Gap Analysis  ..................................................  12
4. Implementation Recommendations  ..................................................  13
    4.1 Enhanced BankTransaction Model  ..................................................  13
    4.2 Categorization System Design  ..................................................  15
    4.3 Matching Algorithm  ..................................................  17
    4.4 Split Transaction Support  ..................................................  19
    4.5 Transfer Detection Logic  ..................................................  20
    4.6 Rules Engine Architecture  ..................................................  21
5. API Endpoint Specifications  ..................................................  23
6. UI/UX Recommendations  ..................................................  25
7. Philippine Market Considerations  ..................................................  27
8. Implementation Roadmap  ..................................................  28
9. Uncertainty Statement & Limitations  ..................................................  30
 
1. Executive Summary
This document provides a comprehensive analysis of bank transaction processing in accounting software, comparing QuickBooks' established approach with HaypBooks' current implementation. The analysis covers six core capabilities: transaction categorization, matching, splitting, transfers, auto-detection, and rules engine. The objective is to provide actionable recommendations for implementing a world-class bank transaction management system in HaypBooks that matches or exceeds QuickBooks functionality while addressing Philippine market requirements.
1.1 Scope & Objectives
Primary Objectives:
•	• Analyze QuickBooks' bank transaction handling methodology
•	• Document HaypBooks' current schema capabilities and gaps
•	• Provide detailed implementation specifications for each core capability
•	• Include code examples and API endpoint designs
•	• Address Philippine-specific requirements (GCash, Maya, local banks)
1.2 Key Findings Summary
Capability	QuickBooks	HaypBooks Current	Gap Level
Bank Feed Connection	Plaid, Yodlee, Direct Connect	Schema ready, not implemented	Medium
Transaction Categorization	AI-powered + Rules	Basic BankRule model	High
Transaction Matching	Multi-criteria matching	Basic matchType field	High
Split Transactions	Full support	Not supported	Critical
Transfer Detection	Auto-detect between accounts	Not implemented	Critical
Rules Engine	Complex conditions + actions	Basic JSON matchCriteria	High
E-Wallet Integration	Limited	Schema includes GCash/Maya	Opportunity
Table 1: Capability Gap Analysis
2. QuickBooks Bank Transaction Architecture
QuickBooks has refined its bank transaction handling over 25+ years, creating a robust system that processes billions of transactions annually. Understanding their architecture is essential for building competitive functionality in HaypBooks. The system operates on a pipeline model where transactions flow through multiple processing stages before being finalized in the general ledger.
2.1 Bank Feed Connection Flow
QuickBooks Online uses a multi-provider approach to bank connectivity. The flow begins when a user initiates a bank connection through the Banking Center. QuickBooks connects to financial institution aggregators (primarily Plaid and Yodlee) which establish secure connections to the user's bank. Transactions are then pulled automatically on a scheduled basis, typically every 4-6 hours, with on-demand refresh available.
Connection States in QuickBooks:
•	• CONNECTED: Active connection, transactions syncing normally
•	• DISCONNECTED: User revoked access or connection expired
•	• ERROR: Authentication failure or API error requiring re-authentication
•	• PENDING: Initial connection in progress
The critical insight from QuickBooks' approach is the separation of raw imported transactions from categorized transactions. Raw transactions are immutable records from the bank, while categorized transactions are the user's interpretation for accounting purposes. This two-layer approach enables audit trails and re-categorization without losing original data.
2.2 Transaction Categorization Engine
QuickBooks uses a sophisticated multi-layer categorization system that combines machine learning with user-defined rules. When a new transaction arrives, it passes through several classification stages before appearing in the user's review queue.
Categorization Pipeline:
Stage	Process	Confidence	User Action Required
1. Rule Match	Check bank rules in priority order	100%	None if matched
2. AI Suggestion	ML model predicts category	Variable	Confirm/Modify
3. Vendor History	Check past transactions for same vendor	High	Confirm
4. Similarity Match	Fuzzy match on description	Medium	Confirm/Select
5. Uncategorized	Default to Uncategorized	None	Manual categorization
Table 2: Categorization Pipeline Stages
The AI categorization model in QuickBooks learns from millions of anonymized transactions across all users. For new businesses with no transaction history, the model provides reasonably accurate suggestions based on merchant category codes (MCC) and description patterns. As the business accumulates transactions, the model adapts to their specific categorization patterns, improving accuracy over time.
2.3 Transaction Matching System
Transaction matching is one of QuickBooks' most powerful features, automatically linking bank transactions to internal records like invoices, bills, and payments. This dramatically reduces manual reconciliation work and ensures accurate books. The matching system evaluates multiple criteria to find the best matches.
Matching Criteria Priority:
•	• Exact Amount Match: Transaction amount equals invoice/payment amount
•	• Date Proximity: Transaction date within expected range of internal record
•	• Customer/Vendor Name Match: Fuzzy matching on names in transaction description
•	• Reference Number: Check number, invoice number, or payment reference
•	• Partial Amount Match: For split payments or partial payments
Match Confidence Levels:
QuickBooks displays matches with confidence indicators. A 'Green' match indicates high confidence (typically exact amount + date within 7 days + recognizable payee name), requiring only a single click to confirm. A 'Yellow' match requires user review due to lower confidence scores. The system also supports manual matching where users can search and select records to match against bank transactions.
2.4 Transaction Splitting
Transaction splitting allows a single bank transaction to be allocated to multiple categories, accounts, or entities. This is essential for accurately representing complex transactions like credit card payments that may include multiple expense categories, or payroll deposits that split across wages, taxes, and benefits.
Split Transaction Use Cases:
•	• Credit Card Payments: Split total payment across multiple expense categories
•	• Payroll Deposits: Allocate to wages, taxes, benefits, retirement contributions
•	• Mixed-Purpose Purchases: Split a single receipt across multiple departments/projects
•	• Cost Allocation: Distribute shared costs across multiple cost centers
•	• Reimbursements: Separate business expenses from personal portions
In QuickBooks, splits are managed through the transaction detail view. Each split line contains: Account, Description, Amount, and optional Customer/Project/Class. The sum of all splits must equal the total transaction amount. Splits can be saved as templates for recurring use, and the system validates that split amounts don't exceed the transaction total.
2.5 Transfer Detection
Transfer detection is QuickBooks' automatic identification of movements between the user's own bank accounts. When a withdrawal appears in one account and a matching deposit appears in another account within a reasonable timeframe, QuickBooks suggests a transfer entry rather than an expense or income.
Transfer Detection Algorithm:
•	• Identify candidate pairs: Withdrawals in Account A matching deposits in Account B
•	• Amount matching: Exact or near-exact amount (allowing for transfer fees)
•	• Date window: Deposits within 0-3 days of withdrawal (configurable)
•	• Account pairing: Both accounts must belong to the same company/workspace
•	• Exclusion rules: Exclude known payment recipients, known income sources
The system automatically creates a transfer transaction when high-confidence matches are found, which is then reflected as a movement between bank accounts in the Balance Sheet rather than impacting Profit & Loss. This prevents misclassification of internal transfers as expenses or income, a common bookkeeping error.
2.6 Bank Rules Engine
QuickBooks' bank rules engine allows users to automate repetitive categorization decisions. Rules can be simple (if description contains 'Starbucks', categorize to 'Office Supplies - Coffee') or complex multi-condition rules that evaluate multiple fields and apply multiple actions.
Rule Components:
•	• Conditions: Field, Operator, Value (e.g., Description CONTAINS 'UBER', Amount GREATER_THAN 100)
•	• Actions: Categorize to account, Assign payee, Add class/location, Set memo
•	• Priority: Rules execute in priority order; first match wins
•	• Scope: Apply to specific bank accounts or all accounts
Supported Condition Operators:
Field	Supported Operators	Example
Description	Contains, Does not contain, Is exactly, Starts with, Ends with	Contains 'AMAZON'
Amount	Equals, Does not equal, Is greater than, Is less than, Is between	Between 100 and 500
Transaction Type	Is, Is not	Is 'Credit Card Charge'
Bank Account	Is, Is not	Is 'Operating Account'
Date	Is in last, Is in next, Is between	Is in last 30 days
Table 3: Bank Rules Condition Operators
3. HaypBooks Current Schema Analysis
Analysis of the HaypBooks Prisma schema reveals a solid foundation for banking functionality, with most core models already defined. However, several enhancements are needed to match QuickBooks' capabilities. This section details the current schema structure and identifies specific gaps requiring attention.
3.1 Existing Banking Models
The HaypBooks schema includes a comprehensive set of banking models organized around bank feeds, transactions, and reconciliation. The following models are currently implemented:
BankAccount Model:
The BankAccount model captures essential bank account information including institution name, account number, routing number, SWIFT code, and IBAN. It supports soft deletion and includes relations to transactions, deposits, and reconciliation records. However, it lacks fields for account type (checking, savings, credit card), currency, current balance, and connection status.
BankTransaction Model:
The BankTransaction model is intentionally minimal, storing only bankAccountId, amount, date, description, and workspaceId. This design appears to follow the principle of storing raw bank data separately from categorized accounting entries. The model links to BankTransactionRaw which stores the original imported data including rawPayload.
BankRule Model:
The BankRule model provides a foundation for automation with matchCriteria stored as JSON and assignAccountId for categorization. The priority and isActive fields enable rule ordering and status management. However, the model currently supports only a single match criterion and single action.
BankFeedConnection Model:
This model handles connections to external bank feed providers (Plaid, Yodlee, Manual) with status tracking and lastSyncedAt timestamp. It appropriately separates connection-level concerns from account-level concerns through the BankFeedAccount model.
Current Model Relationships:
Model	Relationships	Purpose
BankFeedConnection	BankFeedAccount[], BankFeedImport[]	Provider connection
BankFeedAccount	BankFeedConnection, BankAccount	External account mapping
BankFeedImport	BankFeedConnection, BankTransactionRaw[]	Import batch tracking
BankTransactionRaw	BankFeedAccount, BankTransaction?	Raw imported data
BankTransaction	BankAccount, BankTransactionRaw[]	Processed transaction
BankRule	Workspace, Account	Auto-categorization rules
BankReconciliation	BankAccount, BankReconciliationLine[]	Reconciliation session
BankReconciliationLine	BankReconciliation, BankTransaction, JournalEntryLine?	Match tracking
Table 4: Banking Model Relationships
3.2 Gap Analysis
Based on the QuickBooks analysis and current HaypBooks schema, the following gaps require attention to achieve feature parity:
Gap	Current State	Required Enhancement	Priority
Transaction Status	No status tracking	Add status field (PENDING, CATEGORIZED, MATCHED, REVIEWED)	Critical
Split Transactions	Not supported	New BankTransactionSplit model	Critical
Match Confidence	Only matched boolean	Add confidenceScore, matchedEntityId, matchedEntityType	High
AI Categorization	Not implemented	Add suggestedAccountId, aiConfidenceScore	High
Transfer Detection	Not implemented	Add isTransfer, relatedBankTransactionId	High
Rule Conditions	Single JSON criterion	Multiple conditions with AND/OR logic	Medium
Rule Actions	Single account assignment	Multiple actions (account, payee, class, memo)	Medium
E-Wallet Support	IntegrationType enum only	Dedicated e-wallet transaction models	Medium
Category Learning	Not implemented	UserCategorizationPattern model	Low
Table 5: Schema Enhancement Requirements
4. Implementation Recommendations
4.1 Enhanced BankTransaction Model
The BankTransaction model requires significant enhancement to support categorization, matching, and splitting workflows. The following schema additions are recommended:
Enhanced BankTransaction Schema:
model BankTransaction {
  id              String   @id @default(uuid())
  bankAccountId   String
  amount          Decimal  @db.Decimal(19, 4)
  date            DateTime
  description     String
  workspaceId     String
  
  // NEW: Transaction Status
  status          BankTransactionStatus @default(PENDING_REVIEW)
  
  // NEW: Categorization
  categoryId      String?   // GL Account
  category        Account?  @relation(fields: [categoryId], references: [id])
  isAiSuggested   Boolean   @default(false)
  aiConfidence    Decimal?  @db.Decimal(5, 4)
  
  // NEW: Matching
  matchedEntityId    String?
  matchedEntityType  String?   // INVOICE, BILL, PAYMENT_RECEIVED, BILL_PAYMENT
  matchConfidence    Decimal?  @db.Decimal(5, 4)
  matchType          String?   // EXACT, SUGGESTED, MANUAL
  
  // NEW: Transfer Detection
  isTransfer              Boolean   @default(false)
  relatedBankTransactionId String?
  relatedBankTransaction  BankTransaction?  @relation("TransferPair", 
                                fields: [relatedBankTransactionId], 
                                references: [id])
  
  // NEW: Splits Support
  splits  BankTransactionSplit[]
  
  // NEW: Metadata
  memo            String?
  payeeId         String?
  payee           Contact?  @relation(fields: [payeeId], references: [id])
  classId         String?
  locationId      String?
  
  // NEW: Audit
  categorizedAt   DateTime?
  categorizedBy   String?
  reviewedAt      DateTime?
  reviewedBy      String?
  
  // NEW: Source Tracking
  source          String    @default("BANK_FEED") // BANK_FEED, MANUAL, IMPORT
  
  bankAccount     BankAccount        @relation(fields: [bankAccountId], references: [id])
  workspace       Workspace          @relation(fields: [workspaceId], references: [id])
  rawTransactions BankTransactionRaw[]
  BankReconciliationLine BankReconciliationLine[]
  
  @@index([workspaceId, status])
  @@index([bankAccountId, date])
  @@index([categoryId])
  @@index([matchedEntityId])
}
New Enum for Transaction Status:
enum BankTransactionStatus {
  PENDING_REVIEW    // New transaction awaiting categorization
  CATEGORIZED       // Assigned to category but not matched
  MATCHED           // Linked to internal record (invoice/bill/payment)
  SPLIT             // Split into multiple categories
  TRANSFER          // Identified as account transfer
  REVIEWED          // User has reviewed and confirmed
  EXCLUDED          // User excluded from books
}
4.2 Categorization System Design
The categorization system should implement a priority-based pipeline similar to QuickBooks. Each incoming transaction is evaluated against multiple categorization sources in a defined order.
Categorization Pipeline Architecture:
The pipeline consists of five sequential stages, each attempting to categorize the transaction. The first stage that produces a confident categorization wins, and subsequent stages are skipped. This ensures that explicit rules always take precedence over AI suggestions.
Stage 1 - Bank Rules: Execute all active bank rules in priority order. Rules are user-defined and deterministic, providing 100% confidence when matched.
Stage 2 - Historical Patterns: Query the user's past categorizations for the same payee/description. If a pattern exists with sufficient frequency, suggest that category with confidence proportional to frequency.
Stage 3 - AI Categorization: Send transaction description and amount to the ML model. The model returns a suggested category with confidence score. This requires building or integrating a categorization model.
Stage 4 - Similarity Search: Use fuzzy matching to find similar transactions in the user's history. Suggest categories based on similar transaction categorizations.
Stage 5 - Default/Uncategorized: If no suggestion meets confidence threshold, leave uncategorized for manual review.
Category Learning Model:
To enable learning from user corrections, a new model is recommended to track categorization patterns:
model CategorizationPattern {
  id            String   @id @default(uuid())
  workspaceId   String
  payeeName     String   // Normalized payee/description
  categoryId    String
  category      Account  @relation(fields: [categoryId], references: [id])
  frequency     Int      @default(1)
  lastUsedAt    DateTime @default(now())
  
  // For AI training
  descriptionPattern String?
  amountRangeMin     Decimal? @db.Decimal(19, 4)
  amountRangeMax     Decimal? @db.Decimal(19, 4)
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@unique([workspaceId, payeeName, categoryId])
  @@index([workspaceId, payeeName])
}
4.3 Matching Algorithm
The matching system identifies relationships between bank transactions and internal records (invoices, bills, payments). A multi-criteria scoring algorithm calculates match confidence.
Matching Score Calculation:
The matching algorithm evaluates candidate records across multiple dimensions and calculates a weighted confidence score. Records exceeding a confidence threshold are presented as suggested matches.
Criterion	Weight	Scoring Logic	Max Points
Exact Amount	40%	Amount matches exactly	40
Date Proximity	20%	Within 7 days: 20 pts, 14 days: 10 pts, 30 days: 5 pts	20
Payee Match	25%	Exact name match: 25, Fuzzy match: 15, No match: 0	25
Reference Match	15%	Check/Ref number matches	15
Total	100%	Sum of weighted scores	100
Table 6: Matching Score Weights
Match Confidence Thresholds:
•	• High Confidence (80-100): Automatically selected as suggested match, single-click confirm
•	• Medium Confidence (60-79): Shown as potential match, requires explicit user selection
•	• Low Confidence (40-59): Shown in 'Other Possible Matches' section
•	• No Match (< 40): No automatic suggestion, manual search required
Entity Matching Query Structure:
// TypeScript example for match finding
interface MatchCandidate {
  entityId: string;
  entityType: 'INVOICE' | 'BILL' | 'PAYMENT_RECEIVED' | 'BILL_PAYMENT';
  confidence: number;
  matchDetails: {
    amountMatch: boolean;
    dateProximity: number;
    payeeMatchScore: number;
    referenceMatch: boolean;
  };
}

async function findMatches(
  transaction: BankTransaction,
  entityType: 'RECEIVABLE' | 'PAYABLE'
): Promise<MatchCandidate[]> {
  const candidates: MatchCandidate[] = [];
  const amount = parseFloat(transaction.amount.toString());
  const txDate = transaction.date;
  
  // Query unpaid invoices/bills with matching amount
  if (entityType === 'RECEIVABLE') {
    const invoices = await prisma.invoice.findMany({
      where: {
        workspaceId: transaction.workspaceId,
        status: { in: ['SENT', 'PARTIAL'] },
        balanceDue: { gte: amount - 0.01, lte: amount + 0.01 }
      },
      include: { customer: true }
    });
    // Calculate confidence for each invoice...
  }
  
  return candidates.sort((a, b) => b.confidence - a.confidence);
}
4.4 Split Transaction Support
Split transactions require a new model to store individual line items that together compose a single bank transaction. Each split line represents a portion of the total transaction amount allocated to a specific account.
BankTransactionSplit Model:
model BankTransactionSplit {
  id               String   @id @default(uuid())
  bankTransactionId String
  
  // Allocation details
  amount           Decimal  @db.Decimal(19, 4)
  accountId        String
  account          Account  @relation(fields: [accountId], references: [id])
  
  // Optional attributes
  description      String?
  customerId       String?
  customer         Customer? @relation(fields: [customerId], references: [id])
  vendorId         String?
  vendor           Vendor?  @relation(fields: [vendorId], references: [id])
  classId          String?
  locationId       String?
  
  // Audit
  createdAt        DateTime @default(now())
  createdById      String?
  
  bankTransaction  BankTransaction @relation(fields: [bankTransactionId], 
                          references: [id], onDelete: Cascade)
  
  @@index([bankTransactionId])
  @@index([accountId])
}
Split Validation Rules:
•	• Sum of all split amounts must equal the parent transaction amount
•	• Each split must have a positive amount
•	• At least one split is required when transaction status is SPLIT
•	• Maximum 100 splits per transaction (UI constraint)
•	• Splits can only be created/modified while transaction is in PENDING_REVIEW or CATEGORIZED status
4.5 Transfer Detection Logic
Transfer detection automatically identifies movements between bank accounts within the same workspace. This prevents incorrect categorization of internal transfers as expenses or income.
Transfer Detection Algorithm:
async function detectTransfers(workspaceId: string): Promise<TransferMatch[]> {
  const transfers: TransferMatch[] = [];
  
  // Get all pending review transactions
  const pendingTxs = await prisma.bankTransaction.findMany({
    where: {
      workspaceId,
      status: 'PENDING_REVIEW',
      isTransfer: false
    },
    include: { bankAccount: true }
  });
  
  // Group by approximate amount (within small tolerance)
  const tolerance = 0.50; // Account for transfer fees
  const dateWindow = 3; // Days
  
  for (const tx of pendingTxs) {
    if (tx.amount < 0) { // Outgoing transaction
      const matchingDeposit = pendingTxs.find(candidate => {
        if (candidate.amount <= 0) return false;
        if (candidate.bankAccountId === tx.bankAccountId) return false;
        
        const amountMatch = Math.abs(
          Math.abs(parseFloat(tx.amount.toString())) - 
          parseFloat(candidate.amount.toString())
        ) <= tolerance;
        
        const dateMatch = Math.abs(
          candidate.date.getTime() - tx.date.getTime()
        ) <= dateWindow * 24 * 60 * 60 * 1000;
        
        return amountMatch && dateMatch;
      });
      
      if (matchingDeposit) {
        transfers.push({
          withdrawalTx: tx,
          depositTx: matchingDeposit,
          confidence: calculateTransferConfidence(tx, matchingDeposit)
        });
      }
    }
  }
  
  return transfers;
}
Transfer Confidence Factors:
•	• Exact amount match: +40 points
•	• Same-day transfer: +30 points
•	• Within 1 day: +25 points
•	• Within 3 days: +15 points
•	• Both accounts same currency: +10 points
4.6 Rules Engine Architecture
The enhanced bank rules engine should support multiple conditions with AND/OR logic and multiple actions per rule. The current BankRule model needs significant enhancement.
Enhanced BankRule Model:
model BankRule {
  id              String   @id @default(uuid())
  workspaceId     String
  name            String
  description     String?
  priority        Int      @default(100)
  isActive        Boolean  @default(true)
  
  // Apply to specific accounts (null = all accounts)
  bankAccountIds  String[] // Array of bank account IDs
  
  // Condition logic
  conditionLogic  String   @default("AND") // AND, OR
  conditions      BankRuleCondition[]
  
  // Actions
  actions         BankRuleAction[]
  
  // Statistics
  matchCount      Int      @default(0)
  lastMatchedAt   DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@index([workspaceId, isActive, priority])
}

model BankRuleCondition {
  id          String   @id @default(uuid())
  ruleId      String
  
  field       String   // DESCRIPTION, AMOUNT, DATE, PAYEE, TRANSACTION_TYPE
  operator    String   // CONTAINS, EQUALS, STARTS_WITH, ENDS_WITH, 
                       // GREATER_THAN, LESS_THAN, BETWEEN, REGEX
  value       String   // Comparison value
  valueEnd    String?  // For BETWEEN operator
  
  rule BankRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId])
}

model BankRuleAction {
  id          String   @id @default(uuid())
  ruleId      String
  
  actionType  String   // SET_CATEGORY, SET_PAYEE, SET_CLASS, 
                       // SET_LOCATION, SET_MEMO, SET_TAG
  targetId    String?  // Account ID, Contact ID, Class ID, etc.
  targetValue String?  // String value for memo, tag, etc.
  
  rule BankRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId])
}
Rule Evaluation Logic:
function evaluateRule(rule: BankRule, transaction: BankTransaction): boolean {
  const conditions = rule.conditions;
  const logic = rule.conditionLogic;
  
  if (logic === 'AND') {
    return conditions.every(c => evaluateCondition(c, transaction));
  } else {
    return conditions.some(c => evaluateCondition(c, transaction));
  }
}

function evaluateCondition(condition: BankRuleCondition, tx: BankTransaction): boolean {
  const fieldValue = getFieldValue(tx, condition.field);
  
  switch (condition.operator) {
    case 'CONTAINS':
      return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
    case 'EQUALS':
      return fieldValue.toLowerCase() === condition.value.toLowerCase();
    case 'STARTS_WITH':
      return fieldValue.toLowerCase().startsWith(condition.value.toLowerCase());
    case 'GREATER_THAN':
      return parseFloat(fieldValue) > parseFloat(condition.value);
    case 'LESS_THAN':
      return parseFloat(fieldValue) < parseFloat(condition.value);
    case 'BETWEEN':
      const val = parseFloat(fieldValue);
      return val >= parseFloat(condition.value) && 
             val <= parseFloat(condition.valueEnd!);
    case 'REGEX':
      return new RegExp(condition.value, 'i').test(fieldValue);
    default:
      return false;
  }
}
5. API Endpoint Specifications
This section defines the RESTful API endpoints required for bank transaction management. All endpoints follow the pattern /api/companies/:companyId/banking/* and require authentication.
5.1 Bank Transactions Endpoints
Method	Endpoint	Purpose
GET	/transactions	List transactions with filters (status, date, account)
GET	/transactions/:id	Get single transaction with splits and matches
PATCH	/transactions/:id	Update transaction (categorize, match, split)
POST	/transactions/:id/categorize	Categorize transaction to account
POST	/transactions/:id/match	Match transaction to internal record
POST	/transactions/:id/split	Create split allocation
DELETE	/transactions/:id/match	Remove existing match
POST	/transactions/:id/exclude	Exclude transaction from books
POST	/transactions/bulk-categorize	Bulk categorize multiple transactions
POST	/transactions/detect-transfers	Run transfer detection
Table 7: Bank Transaction API Endpoints
5.2 Bank Rules Endpoints
Method	Endpoint	Purpose
GET	/rules	List all bank rules sorted by priority
POST	/rules	Create new bank rule
GET	/rules/:id	Get rule with conditions and actions
PUT	/rules/:id	Update rule (including conditions/actions)
DELETE	/rules/:id	Delete rule
PATCH	/rules/:id/priority	Update rule priority
POST	/rules/reorder	Bulk reorder rule priorities
POST	/rules/:id/test	Test rule against sample transactions
Table 8: Bank Rules API Endpoints
5.3 Example API Request/Response
Categorize Transaction Request:
// POST /api/companies/:companyId/banking/transactions/:id/categorize
{
  "accountId": "acc_abc123",
  "payeeId": "contact_xyz789",
  "memo": "Monthly office supplies",
  "classId": "class_001",
  "confidence": 0.95,
  "source": "MANUAL" // or "RULE", "AI", "HISTORICAL"
}

// Response
{
  "id": "btx_def456",
  "status": "CATEGORIZED",
  "categoryId": "acc_abc123",
  "category": {
    "id": "acc_abc123",
    "code": "6001",
    "name": "Office Supplies"
  },
  "categorizedAt": "2025-01-15T10:30:00Z",
  "categorizedBy": {
    "id": "user_123",
    "name": "John Accountant"
  }
}
6. UI/UX Recommendations
The bank transactions interface is one of the most frequently used features in accounting software. The UI design should prioritize efficiency for high-volume transaction processing while remaining intuitive for occasional users.
6.1 Transaction Review Interface
The primary interface for bank transactions is a three-column layout inspired by QuickBooks' Banking Center. The left column shows bank accounts with transaction counts, the center column displays the transaction list with categorization controls, and the right column shows details for the selected transaction.
Layout Structure:
Column	Width	Content
Left Sidebar	20%	Bank account cards with pending count, filters, date range selector
Main Content	50%	Transaction list with inline categorization, batch action bar
Detail Panel	30%	Selected transaction details, match suggestions, split editor
Table 9: UI Layout Structure
6.2 Transaction List Design
Each transaction row should display the following information with visual hierarchy:
•	• Date: Left-aligned, smaller font, muted color
•	• Description: Primary text, bold, with payee name highlighted if recognized
•	• Amount: Right-aligned, color-coded (green for deposits, red for withdrawals)
•	• Status Badge: Color-coded status indicator (Pending, Matched, Categorized, etc.)
•	• Category: Dropdown selector with recent categories and search
•	• Match: Icon indicator showing match status with click-to-match action
•	• Actions: Kebab menu with View, Split, Exclude, Undo options
6.3 Match Suggestion Panel
When a transaction is selected, the right panel should display potential matches with confidence indicators. High-confidence matches appear at the top with a single 'Confirm' button. Lower-confidence matches are collapsible under 'Other Possible Matches'. A search field allows manual record search.
Match Card Design:
•	• Entity Type Badge: Invoice, Bill, Payment (color-coded)
•	• Entity Number: Clickable link to open original document
•	• Customer/Vendor Name: Secondary text
•	• Amount: Prominent display matching transaction amount
•	• Date: Proximity indicator (e.g., '3 days before transaction')
•	• Confidence Meter: Visual bar showing match score percentage
•	• Actions: Confirm Match, View Details, Reject
6.4 Keyboard Shortcuts
For power users processing high transaction volumes, keyboard shortcuts are essential:
Shortcut	Action
Enter	Confirm current selection/match
Tab	Move to next transaction
Shift+Tab	Move to previous transaction
C	Open category dropdown
M	Open match panel
S	Open split editor
E	Exclude transaction
U	Undo last action
?	Open help/shortcuts panel
Table 10: Keyboard Shortcuts
7. Philippine Market Considerations
HaypBooks has a unique opportunity to differentiate from QuickBooks by providing native support for Philippine payment methods and banking practices. This section addresses specific requirements for the Philippine market.
7.1 E-Wallet Integration
GCash and Maya are the dominant e-wallets in the Philippines, with over 70% of Filipino adults using digital wallets. Unlike traditional bank accounts, e-wallet transactions have unique characteristics:
•	• Transaction references: E-wallets use reference numbers and QR codes rather than traditional check numbers
•	• Instant transfers: Transactions are real-time, eliminating the typical bank feed delay
•	• Merchant categorization: E-wallets often include merchant category codes that can inform categorization
•	• Split payment support: A single transaction may be partially funded by wallet balance and partially by linked card
E-Wallet Transaction Model Extension:
model EWalletTransaction {
  id                String   @id @default(uuid())
  bankTransactionId String
  provider          String   // GCASH, MAYA, GRABPAY
  
  // E-wallet specific fields
  referenceNumber   String
  qrCode            String?
  merchantCategory  String?
  merchantName      String?
  
  // Payment method breakdown
  walletAmount      Decimal? @db.Decimal(19, 4)
  linkedCardAmount  Decimal? @db.Decimal(19, 4)
  
  // Philippine-specific
  isInstapay        Boolean  @default(false)
  isPesonet         Boolean  @default(false)
  
  bankTransaction BankTransaction @relation(fields: [bankTransactionId], references: [id])
  
  @@index([provider, referenceNumber])
}
7.2 Local Bank Integration
The IntegrationType enum already includes major Philippine banks (BDO, BPI, Metrobank, etc.). Implementation should prioritize:
•	• BDO and BPI: Largest retail banks, highest user volume
•	• Metrobank: Strong SME banking presence
•	• UnionBank: API-forward bank, easier integration
•	• LandBank: Government transactions, NGO/grant funding
•	• InstaPay/PESONet: Philippine interbank transfer protocols
8. Implementation Roadmap
The following phased approach is recommended to deliver bank transaction functionality incrementally while managing development complexity. Each phase builds upon the previous, allowing for iterative refinement based on user feedback.
Phase 1: Foundation (Weeks 1-4)
•	• Enhance BankTransaction model with status and categorization fields
•	• Implement basic bank rules engine (single condition, single action)
•	• Build transaction list UI with categorization dropdown
•	• Create API endpoints for transaction CRUD and categorization
•	• Establish categorization pattern learning (historical patterns)
Phase 2: Matching & Splits (Weeks 5-8)
•	• Implement matching algorithm with confidence scoring
•	• Build match suggestion UI panel
•	• Create BankTransactionSplit model and validation
•	• Build split transaction editor UI
•	• Add transfer detection algorithm
Phase 3: AI & Automation (Weeks 9-12)
•	• Integrate or build AI categorization model
•	• Enhance rules engine with multiple conditions/actions
•	• Build rules management UI with testing
•	• Implement bulk categorization with rule preview
•	• Add keyboard shortcuts for power users
Phase 4: Philippine Integrations (Weeks 13-16)
•	• Implement GCash transaction import
•	• Implement Maya transaction import
•	• Build InstaPay/PESONet transfer detection
•	• Add Philippine bank feed connections
•	• Create e-wallet specific categorization rules
Resource Estimation:
Phase	Duration	Backend Dev	Frontend Dev	QA
Phase 1	4 weeks	1 FTE	1 FTE	0.5 FTE
Phase 2	4 weeks	1 FTE	1 FTE	0.5 FTE
Phase 3	4 weeks	1 FTE	1 FTE	1 FTE
Phase 4	4 weeks	1 FTE	1 FTE	1 FTE
Table 11: Resource Estimation
9. Uncertainty Statement & Limitations
9.1 Assumptions Made
•	• Bank feed providers (Plaid, Yodlee) can integrate with Philippine banks through their existing infrastructure or partner arrangements
•	• The Prisma schema can be modified without breaking existing functionality
•	• AI/ML categorization model will be built or integrated as a separate microservice
•	• GCash and Maya APIs provide transaction history access (to be verified during implementation)
•	• User has administrative access to make schema migrations
9.2 Known Limitations
•	• E-wallet API access may require business partnerships that take time to establish
•	• AI categorization accuracy depends on training data which will initially be limited
•	• Transfer detection may produce false positives for transactions between related companies
•	• Rules engine complexity may require performance optimization for large rule sets
•	• Some Philippine banks may not support direct API access, requiring file-based imports
9.3 Validation Steps Required
•	• Verify GCash/Maya API availability and terms of service for transaction access
•	• Test schema migrations on a staging database before production deployment
•	• Conduct user research on categorization UI preferences with Philippine accountants
•	• Benchmark rules engine performance with 1000+ rules
•	• Validate matching algorithm accuracy against historical reconciliation records
