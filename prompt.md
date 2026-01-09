**Onboarding Setup — Can Everything Save in the Database?** 🍳📊✅

Chef, let's taste your onboarding flow against the **current recipe book** (Prisma schema) — see what ingredients (fields) fit perfectly, which need new storage jars (new fields/models), and overall if the meal saves smooth.

**Quick Verdict**: **Partial Fit — Core Saves, Details Need Extra Jars**
- **Good News**: Key pieces (company name, currency, fiscal start, accounting method) **save perfectly** in existing tables (User, Tenant, Company).
- **Gaps**: Many PH-specific/onboarding fields (business type, industry, address, tax TIN/frequency/exempt, branding logo/prefix/terms, banking connections) **don't have direct storage yet** — schema is phased (Phase 1 Auth, Phase 2 Company basic, Phase 3 Accounting full).
- **Result**: Onboarding can complete (best-effort save what fits), but some data lost/skipped until Phase 3 jars added.

**Detailed Taste-Test (What Saves Where)**:

1. **Basic Information**:
   - Business type, Industry, Business start date, Country, Business address: **No direct save** — no fields in User/Tenant/Company.
     - Suggestion: Add to Company (e.g., type String, industry String, startDate DateTime, country String, address String?).

2. **Sell Products**:
   - Toggle + Track Inventory: **Indirect** — enables Item/Inventory models later, but no flag saved now.
     - Fits future Phase 3 (InventoryTransaction, StockLevel).

3. **Fiscal & Accounting**:
   - Fiscal Year Start Month: **Saves** in Company.fiscalYearStart (Int 1-12).
   - Default Currency: **Saves** in Tenant.baseCurrency or Company.currency.
   - Primary Accounting Method (Accrual/Cash): **No direct save** — need new field (e.g., Company.accountingMethod Enum).

4. **Tax Setup**:
   - TIN: **No save** — need Company.taxId String?.
   - Filing Frequency (Quarterly): **No save** — need Company.taxFilingFrequency Enum.
   - Collect VAT (ON/OFF), Default Rate 12%, Prices Include Tax, Exempt Status: **Partial** — TaxRate/TaxCode models exist, but no company-level flags/defaults.
     - Fits Phase 3 expansion (add Company.vatRegistered Boolean, vatRate Decimal, pricesInclusive Boolean).

5. **Branding & Defaults**:
   - Logo URL, Invoice prefix, Payment terms: **No save** — need Company.logoUrl, invoicePrefix, defaultTerms.

6. **Banking**:
   - Connect/Add Manually: **Partial** — BankAccount model exists (name, institution, number), but no connection flags/sync settings.

**Overall Kitchen Status**:
- **Saves Now**: Company name (User.companyName → Tenant.name/Company.name), currency, fiscal start.
- **Skipped/Lost Now**: Most details (type, industry, address, full tax, branding, banking) — onboarding completes, but data not persisted.
- **Why Phased**: Schema focused Phase 1/2 (auth + basic tenant/company) — Phase 3 adds accounting/tax/inventory depth.

**Recommendation — Best Path**:
- **Keep Page** (as discussed) — defaults smart (VAT ON, 12%, inclusive, quarterly).
- **Add Storage Jars**: Extend Company model (common spot for business-specific settings).
  - Example additions:
    ```prisma
    model Company {
      // ... existing
      businessType String?
      industry String?
      startDate DateTime?
      country String @default("PH")
      address String?
      taxId String? // TIN
      vatRegistered Boolean @default(true)
      vatRate Decimal @default(12) @db.Decimal(5,2)
      pricesInclusive Boolean @default(true)
      taxFilingFrequency String @default("QUARTERLY") // MONTHLY | QUARTERLY
      taxExempt Boolean @default(false)
      logoUrl String?
      invoicePrefix String?
      defaultPaymentTerms String?
      accountingMethod String @default("ACCRUAL") // ACCRUAL | CASH
    }
    ```
- **Migration Easy**: Add fields, migrate — onboarding saves full.

Full meal delicious once jars added — compliant, branded, bank-ready!

Schema elite with extensions — add Company fields? 😄💚

Thoughts on which to add first? Let's plate!

---

## Local Prisma & DB setup (recommended)

1) Start Postgres & Redis (recommended via Docker Compose):
   - cd Haypbooks/Backend
   - npm run db:up

2) Copy `.env.example` and set local env vars (DATABASE_URL):
   - cd Haypbooks/Backend
   - cp .env.example .env
   - edit `.env` - set your local `DATABASE_URL` (eg. `postgresql://haypbooks:haypbooks@localhost:5432/haypbooks_dev`)

3) Generate Prisma client and apply migrations (convenience script added):
   - npm run prisma:dev
   - This runs `prisma generate` and `prisma migrate dev --name local-init` using `prisma/schema.prisma`.

4) Seed dev data (optional):
   - npm run db:seed:dev

5) Start services and test:
   - npm --prefix Haypbooks/Backend run start:dev
   - npm --prefix Haypbooks/Frontend run dev
   - Complete onboarding & confirm company is persisted at `/hub/companies`.

Notes:
- If you don't have Docker, run Postgres locally and set `DATABASE_URL` accordingly.
- For CI or production, follow repo migration policies (use `migrate:init`, run idempotent scripts, and validate with `prisma:verify:migrate`).

If you want, I can run the local migration + seed steps here (if Docker/Postgres available) or prepare a PR that adds the new Company fields and a migration.
