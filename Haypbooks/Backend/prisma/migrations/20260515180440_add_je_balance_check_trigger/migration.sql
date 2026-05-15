-- AddForeignKey
ALTER TABLE "CreditNoteApplication" ADD CONSTRAINT "CreditNoteApplication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNoteApplication" ADD CONSTRAINT "CreditNoteApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION check_je_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_debit DECIMAL;
    total_credit DECIMAL;
    je_id UUID;
BEGIN
    je_id := NEW."journalId";
    SELECT COALESCE(SUM("debit"), 0), COALESCE(SUM("credit"), 0)
    INTO total_debit, total_credit
    FROM "JournalEntryLine"
    WHERE "journalId" = je_id;
    IF ABS(total_debit - total_credit) > 0.01 THEN
        RAISE EXCEPTION 'Journal entry % is not balanced: debit=%, credit=%', je_id, total_debit, total_credit;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER je_balance_check
AFTER INSERT OR UPDATE ON "JournalEntryLine"
FOR EACH ROW
EXECUTE FUNCTION check_je_balance();
