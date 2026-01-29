-- Foreign keys and safety checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'subledgerreconciliation' AND kcu.column_name = 'companyid') THEN
    ALTER TABLE public."SubledgerReconciliation" ADD CONSTRAINT "SubledgerReconciliation_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'estimate' AND kcu.column_name = 'companyid') THEN
    ALTER TABLE public."Estimate" ADD CONSTRAINT "Estimate_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReconciliationException_subledger_recon_fkey') THEN
    ALTER TABLE public."ReconciliationException" ADD CONSTRAINT "ReconciliationException_subledger_recon_fkey" FOREIGN KEY ("subledgerReconciliationId") REFERENCES public."SubledgerReconciliation"("id") ON DELETE SET NULL;
  END IF;
  -- Optional user foreign keys
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '"User"' OR table_name = 'User') THEN
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'journalentry' AND kcu.column_name = 'reviewedbyid') THEN
        ALTER TABLE public."JournalEntry" ADD CONSTRAINT "JournalEntry_reviewedBy_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'journalentry' AND kcu.column_name = 'approvedbyid') THEN
        ALTER TABLE public."JournalEntry" ADD CONSTRAINT "JournalEntry_approvedBy_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'estimate' AND kcu.column_name = 'reviewedbyid') THEN
        ALTER TABLE public."Estimate" ADD CONSTRAINT "Estimate_reviewedBy_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'estimate' AND kcu.column_name = 'approvedbyid') THEN
        ALTER TABLE public."Estimate" ADD CONSTRAINT "Estimate_approvedBy_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"("id") ON DELETE SET NULL;
      END IF;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;