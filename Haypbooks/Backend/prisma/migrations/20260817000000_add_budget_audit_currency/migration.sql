-- Add audit trail and currency support for budget models

ALTER TABLE "Budget"
  ADD COLUMN "currency" TEXT,
  ADD COLUMN "exchangeRate" NUMERIC(18, 12),
  ADD COLUMN "baseAmount" NUMERIC(19, 4),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT;

ALTER TABLE "BudgetLine"
  ADD COLUMN "exchangeRate" NUMERIC(18, 12),
  ADD COLUMN "baseAmount" NUMERIC(19, 4),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT;

ALTER TABLE "Budget"
  ADD CONSTRAINT "Budget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT,
  ADD CONSTRAINT "Budget_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT;

ALTER TABLE "BudgetLine"
  ADD CONSTRAINT "BudgetLine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT,
  ADD CONSTRAINT "BudgetLine_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT;

CREATE INDEX "Budget_createdById" ON "Budget" ("createdById");
CREATE INDEX "Budget_updatedById" ON "Budget" ("updatedById");
CREATE INDEX "BudgetLine_createdById" ON "BudgetLine" ("createdById");
CREATE INDEX "BudgetLine_updatedById" ON "BudgetLine" ("updatedById");
