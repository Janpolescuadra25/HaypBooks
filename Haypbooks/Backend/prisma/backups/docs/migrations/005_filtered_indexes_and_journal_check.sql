-- Migration: Add filtered indexes for non-deleted transaction rows and enforce JournalEntry balance via triggers
-- Run on Postgres in a maintenance window. Uses CONCURRENTLY for index creation.

/***********************
 * PART 1: Filtered Indexes
 ***********************/

-- Invoices: fast queries on active invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_company_status_not_deleted
ON "Invoice" ("companyId", "status")
WHERE "deletedAt" IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_company_duedate_not_deleted
ON "Invoice" ("companyId", "dueDate")
WHERE "deletedAt" IS NULL;

-- Quotes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quote_company_status_not_deleted
ON "Quote" ("companyId", "status")
WHERE "deletedAt" IS NULL;

-- Purchase Orders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchaseorder_company_status_not_deleted
ON "PurchaseOrder" ("companyId", "status")
WHERE "deletedAt" IS NULL;

-- Credit Notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creditnote_company_status_not_deleted
ON "CreditNote" ("companyId", "status")
WHERE "issuedAt" IS NOT NULL AND "issuedAt" IS NOT NULL AND ("journalEntryId" IS NOT NULL OR "deletedAt" IS NULL);

-- Vendor Credits
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendorcredit_company_status_not_deleted
ON "VendorCredit" ("companyId", "status")
WHERE "issuedAt" IS NOT NULL AND "deletedAt" IS NULL;

-- Checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_check_company_status_not_deleted
ON "Check" ("companyId", "status")
WHERE "voidedAt" IS NULL AND "deletedAt" IS NULL;

-- Paychecks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paycheck_company_date_not_deleted
ON "Paycheck" ("companyId", "date")
WHERE "deletedAt" IS NULL;

-- Customer Statements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customerstatement_company_period_not_deleted
ON "CustomerStatement" ("companyId", "periodStart", "periodEnd")
WHERE "deletedAt" IS NULL;

-- Deposit Slips
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_depositslip_depositid_not_deleted
ON "DepositSlip" ("depositId")
WHERE "printedAt" IS NOT NULL AND "depositId" IS NOT NULL;

-- Journal Entries: index on active entries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journalentry_company_date_not_deleted
ON "JournalEntry" ("companyId", "date")
WHERE "deletedAt" IS NULL;


/***********************
 * PART 2: JournalEntry Balance Enforcement
 ***********************/

-- Function: check that sum(debit) == sum(credit) for a journal entry
CREATE OR REPLACE FUNCTION ensure_journal_balanced() RETURNS TRIGGER AS $$
DECLARE
  v_total_debit numeric := 0;
  v_total_credit numeric := 0;
  v_posting_status text;
  v_journal_id uuid;
BEGIN
  -- Determine journal id depending on trigger event table
  IF TG_TABLE_NAME = 'JournalEntry' THEN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
      v_journal_id := NEW.id;
      v_posting_status := NEW.postingStatus;
    ELSE
      v_journal_id := OLD.id;
      v_posting_status := OLD.postingStatus;
    END IF;
  ELSE
    -- Trigger called from JournalEntryLine
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
      v_journal_id := NEW.journalId;
    ELSE
      v_journal_id := OLD.journalId;
    END IF;
    SELECT postingStatus INTO v_posting_status FROM "JournalEntry" WHERE id = v_journal_id;
  END IF;

  -- Only enforce when the JournalEntry is being POSTED (or already posted)
  IF v_posting_status::text = 'POSTED' THEN
    -- Ensure the journal's date falls within an OPEN accounting period for the workspace
    DECLARE v_workspace_id uuid;
    BEGIN
      IF TG_TABLE_NAME = 'JournalEntry' THEN
        IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
          v_workspace_id := NEW."workspaceId";
        ELSE
          v_workspace_id := OLD."workspaceId";
        END IF;
      ELSE
        -- From line
        IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
          v_workspace_id := NEW."workspaceId";
        ELSE
          v_workspace_id := OLD."workspaceId";
        END IF;
      END IF;

      -- Confirm there is an OPEN period containing the journal date
      IF NOT EXISTS (
        SELECT 1 FROM "AccountingPeriod" ap
        WHERE ap."workspaceId" = v_workspace_id
          AND ap."startDate" <= (SELECT date FROM "JournalEntry" WHERE id = v_journal_id)
          AND ap."endDate" >= (SELECT date FROM "JournalEntry" WHERE id = v_journal_id)
          AND ap.status = 'OPEN'
      ) THEN
        RAISE EXCEPTION 'Journal entry % falls outside an OPEN accounting period or the period is closed', v_journal_id USING ERRCODE = 'integrity_constraint_violation';
      END IF;

    END;

    SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0)
      INTO v_total_debit, v_total_credit
    FROM "JournalEntryLine"
    WHERE "journalId" = v_journal_id;

    IF round(v_total_debit::numeric, 4) <> round(v_total_credit::numeric, 4) THEN
      RAISE EXCEPTION 'Journal entry % is unbalanced: debit=% , credit=%', v_journal_id, v_total_debit, v_total_credit USING ERRCODE = 'integrity_constraint_violation';
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers:
-- 1) When JournalEntry is inserted or updated (postingStatus change)
DROP TRIGGER IF EXISTS journal_balanced_on_entry ON "JournalEntry";
CREATE CONSTRAINT TRIGGER journal_balanced_on_entry
AFTER INSERT OR UPDATE OF "postingStatus" ON "JournalEntry"
DEFERRABLE INITIALLY IMMEDIATE
FOR EACH ROW
EXECUTE FUNCTION ensure_journal_balanced();

-- 2) When any JournalEntryLine changes, re-check the parent if postingStatus is POSTED
DROP TRIGGER IF EXISTS journal_balanced_on_entryline ON "JournalEntryLine";
CREATE TRIGGER journal_balanced_on_entryline
AFTER INSERT OR UPDATE OR DELETE ON "JournalEntryLine"
FOR EACH ROW
EXECUTE FUNCTION ensure_journal_balanced();

-- Note: This approach enforces balance when postingStatus is set to POSTED, and will block actions that would leave a POSTED journal unbalanced.
-- If you want stricter enforcement (never allow unbalanced entries at any time), remove the postingStatus condition in the function.
