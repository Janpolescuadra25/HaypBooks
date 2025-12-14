-- migration: add missing accounting domains and enable RLS for new tenant-scoped tables

-- Enable RLS and add tenant isolation policies for tables with tenantId
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name IN ('tenantid','tenant_id') AND table_schema='public' AND table_name IN (
    'AccountingPeriod', 'Reversal', 'FinancialStatementSnapshot', 'BankReconciliation', 'BankReconciliationLine', 'Role', 'Approval', 'Revaluation', 'Attachment'
  )
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.table_name);
    -- Create policy if not exists
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING ((tenantId)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((tenantId)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_' || t.table_name, t.table_name);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END $$;
