do what is the best next .. just make sure you following the best practices then do what is your recommended.

alway implement here inside this folder : C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks


* Login/Signup with OTP security
* Authentication essentials
* Company onboarding
* Accounting core tables
* In a clear **sequential timeline** for phased implementation

---

### 🔥 **AI Agent Prompt: Build Real Database & Backend for Authentication + Accounting Core (Phased)**

---

I want you to generate a **real relational database schema and backend NestJS/Prisma models** for my project, covering:

### Phase 1: User Authentication + OTP Security

### Phase 2: Company Onboarding + Multi-user Management

### Phase 3: Accounting Core (Chart of Accounts, Journals, Invoices)

---

## Phase 1: Authentication + OTP Security

1. Create tables/models for:

   * `users`: id, email (unique), passwordHash, isEmailVerified, createdAt, updatedAt
   * `sessions`: id, userId (FK), refreshToken, expiresAt, createdAt
   * `otps`: id, email, otpCode, attempts, createdAt, expiresAt

2. Implement relationships:

   * One user → many sessions
   * OTP linked by email

3. Required fields & constraints:

   * Email unique and indexed
   * Password stored as secure hash (bcrypt)
   * OTP expires after 5 minutes
   * Attempts max 5

4. Include audit timestamps: createdAt, updatedAt

---

## Phase 2: Company Onboarding + Multi-user Management

1. Create tables/models for:

   * `companies`: id, name, taxId, address, industry, createdAt, updatedAt
   * `company_users`: id, userId (FK), companyId (FK), role (admin, accountant, viewer), createdAt, updatedAt
   * `roles`: pre-defined roles with permissions (optional for now)

2. Implement relationships:

   * Many-to-many: users ↔ companies via company_users
   * Users have roles per company

3. Constraints:

   * Company name required and unique per user
   * Role enum enforced

---

## Phase 3: Accounting Core

1. Create tables/models for:

   * `chart_of_accounts`: id, companyId (FK), accountCode, accountName, accountType (asset, liability, equity, income, expense), parentAccountId (nullable), createdAt, updatedAt
   * `journal_entries`: id, companyId (FK), date, description, createdAt, updatedAt
   * `journal_entry_lines`: id, journalEntryId (FK), accountId (FK), debitAmount, creditAmount, createdAt, updatedAt
   * `customers`: id, companyId (FK), name, contactInfo, createdAt, updatedAt
   * `vendors`: id, companyId (FK), name, contactInfo, createdAt, updatedAt
   * `invoices`: id, companyId (FK), customerId (FK), invoiceNumber, date, dueDate, totalAmount, status (draft, sent, paid, overdue), createdAt, updatedAt
   * `invoice_lines`: id, invoiceId (FK), description, quantity, unitPrice, totalPrice, createdAt, updatedAt

2. Implement relationships:

   * One company → many accounts, journal entries, customers, vendors, invoices
   * One journal entry → many journal entry lines
   * One invoice → many invoice lines

3. Include constraints and validations:

   * Debit and credit totals must balance in journal entries
   * Invoice status enum enforced
   * Account types enum enforced

---

## General Requirements

* Use Prisma ORM with PostgreSQL syntax
* Use proper indexing on foreign keys and unique fields
* Include all necessary timestamps
* Use soft deletes if possible (optional)
* Ensure referential integrity with foreign keys
* Design with scalability in mind for multi-company support
* Provide migration files for all phases separately so they can be applied in sequence

---

## Deliverables

1. SQL schema scripts for all phases
2. Prisma schema models with relationships and enums
3. NestJS repository/service boilerplate examples for each major table group
4. Clear sequential migration order with dependencies described
5. Suggestions for API endpoints for:

   * User signup/login/OTP
   * Company onboarding/user roles
   * CRUD for COA, journal entries, invoices

---

## Goal

I want a clean, production-ready real database design **that grows with the product** from basic auth through company setup and full accounting core, structured as a step-by-step timeline to implement and deploy in phases.

---


=================================================================================


just to what is your recommended next to ensure all databases is well implemented.. then check this path C:\Users\HomePC\Desktop\Haypbooksv9\done.db.md - there's a message in the done.db.md read that.. updated this when you are done to all databases.