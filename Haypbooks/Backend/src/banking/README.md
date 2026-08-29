# Banking Module

Company-scoped banking for HaypBooks: bank accounts, transaction import and categorization, transfers, bank reconciliation, deposits and undeposited funds, smart rules, feed connections, credit cards, and checks - integrated with the general ledger through `SubLedgerService`.

## Module wiring (`banking.module.ts`)

- **Imports:** `CurrencyModule`
- **Providers:** `BankingService`, `BankingRepository`, `PrismaService`, `SubLedgerService`
- **Controllers:** `BankingController`, `CompanyBankAccountsController`
- **Exports:** `BankingService`

`SubLedgerService` (from `shared/`) is provided here so banking operations post directly to the general ledger.

## Key files

- `banking.module.ts` - NestJS module registration
- `banking.controller.ts` - banking endpoints under `api/companies/:companyId/banking`
- `company-bank-accounts.controller.ts` - bank-account endpoints under `api/companies/:companyId/bank-accounts`
- `banking.service.ts` - business logic, access checks, and GL posting
- `banking.repository.ts` - Prisma data access (soft-deleted accounts, reconciliation matching)

## Endpoints

Both controllers apply class-level `@UseGuards(JwtAuthGuard, CompanyAccessGuard)`, so every route requires a valid JWT plus company-scoped access.

### BankingController (`api/companies/:companyId/banking`)

- **Cash position:** `GET /cash-position`
- **Bank accounts:** `GET /accounts`, `POST /accounts`, `GET /accounts/:bankAccountId`, `PUT /accounts/:bankAccountId`, `DELETE /accounts/:bankAccountId` (soft delete), `GET /accounts/:bankAccountId/activity`
- **Transactions:** `GET /accounts/:bankAccountId/transactions`, `POST /accounts/:bankAccountId/transactions`, `POST /accounts/:bankAccountId/transactions/import`, `PATCH /accounts/:bankAccountId/transactions/:transactionId`, `POST /accounts/:bankAccountId/transactions/:transactionId/split`, `POST /accounts/:bankAccountId/transactions/batch-categorize`
- **Transfers:** `POST /transfers`
- **Reconciliation:** `GET /accounts/:bankAccountId/reconciliations`, `POST /accounts/:bankAccountId/reconciliations`, `GET /reconciliations/:reconId`, `POST /reconciliations/:reconId/match`, `DELETE /reconciliations/:reconId/match/:bankTransactionId`, `POST /reconciliations/:reconId/complete`, `POST /reconciliations/:reconId/undo`, `POST /reconciliations/:reconId/auto-match`, `GET /reconciliations/:reconId/discrepancies`, `POST /reconciliations/:reconId/adjustment`
- **Deposits:** `GET /deposits`, `POST /deposits`, `GET /deposits/:depositId`, `POST /deposits/:depositId/post`, `POST /deposits/:depositId/void`
- **Undeposited funds:** `GET /undeposited-funds`
- **Smart rules:** `GET /smart-rules`, `POST /smart-rules`, `PUT /smart-rules/:id`, `DELETE /smart-rules/:id`, `POST /smart-rules/apply`
- **Feed connections:** `GET /feed-connections`, `POST /feed-connections`, `PUT /feed-connections/:id`, `DELETE /feed-connections/:id`, `POST /feed-connections/:id/sync`, `GET /feed-status`
- **Credit cards:** `GET /credit-cards`, `GET /credit-cards/:cardId/statements`
- **Checks:** `GET /checks`, `POST /checks`, `PATCH /checks/:checkId`

### CompanyBankAccountsController (`api/companies/:companyId/bank-accounts`)

- `GET /` - list bank accounts (supports `?search=`)
- `POST /` - create a bank account (frontend-facing payload shape)

## Access control

- `CompanyAccessGuard` resolves `:companyId` and verifies company access at the route level
- `assertAccess` re-checks ACTIVE `WorkspaceUser` membership inside every service method and throws `ForbiddenException` otherwise
- Sensitive bank-account fields (account number, routing number, SWIFT code, IBAN) are stored encrypted and decrypted on read via `safeDecryptField`

## GL integration (`banking.service.ts`)

- **Default account seeding:** `ensureDefaultBankAccount` auto-creates a default `Business Checking` account when the workspace has none, linked to the company's cash account (code `1010`, falling back to a checking/cash-named asset account)
- **Categorization:** transaction categorize / split / batch-categorize operations post journal entries via `createAndPostJE` (from `shared/gl-integration`)
- **Transfers:** `createTransfer` posts through `subLedger.postBankTransferToGL` - entry numbers use the `BT-` prefix, debit destination / credit source, with a GL fallback chain (the bank account's `glAccountId`, then the first active asset account named "Cash")
- **Deposits:** `postDeposit` posts through `subLedger.postBankDepositToGL` - entry numbers use the `BD-` prefix, debit cash (`1010`) / credit undeposited funds (`1170`), and posting is skipped when the deposit already has a journal entry
- **Voiding:** `voidDeposit` rejects already-voided deposits and writes a fire-and-forget audit-log entry
- **Period integrity:** both sub-ledger posting methods call `assertPeriodOpen`, so postings into closed accounting periods are rejected

## Tests

This module currently has no spec files - a known gap tracked as tech debt. The GL integration points above (deposit posting, transfer posting, categorization) are the highest-value targets for future specs.
