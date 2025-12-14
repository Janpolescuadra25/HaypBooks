-- Replace RLS policies that reference tenantId_uuid_old to reference tenantId
DO $$
BEGIN
  -- Employee
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Employee') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_Employee') THEN
      DROP POLICY IF EXISTS tenant_isolation_Employee ON public."Employee";
    END IF;
    CREATE POLICY tenant_isolation_Employee ON public."Employee" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- PaySchedule
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PaySchedule') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_PaySchedule') THEN
      DROP POLICY IF EXISTS tenant_isolation_PaySchedule ON public."PaySchedule";
    END IF;
    CREATE POLICY tenant_isolation_PaySchedule ON public."PaySchedule" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- PayrollRun
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRun') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_PayrollRun') THEN
      DROP POLICY IF EXISTS tenant_isolation_PayrollRun ON public."PayrollRun";
    END IF;
    CREATE POLICY tenant_isolation_PayrollRun ON public."PayrollRun" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- PayrollRunEmployee
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'PayrollRunEmployee') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_PayrollRunEmployee') THEN
      DROP POLICY IF EXISTS tenant_isolation_PayrollRunEmployee ON public."PayrollRunEmployee";
    END IF;
    CREATE POLICY tenant_isolation_PayrollRunEmployee ON public."PayrollRunEmployee" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- Paycheck
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Paycheck') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_Paycheck') THEN
      DROP POLICY IF EXISTS tenant_isolation_Paycheck ON public."Paycheck";
    END IF;
    CREATE POLICY tenant_isolation_Paycheck ON public."Paycheck" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- TaxRate
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TaxRate' AND column_name = 'tenantId') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_TaxRate') THEN
      DROP POLICY IF EXISTS tenant_isolation_TaxRate ON public."TaxRate";
    END IF;
    CREATE POLICY tenant_isolation_TaxRate ON public."TaxRate" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- Budget
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Budget') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_Budget') THEN
      DROP POLICY IF EXISTS tenant_isolation_Budget ON public."Budget";
    END IF;
    CREATE POLICY tenant_isolation_Budget ON public."Budget" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- FixedAsset
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAsset') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_FixedAsset') THEN
      DROP POLICY IF EXISTS tenant_isolation_FixedAsset ON public."FixedAsset";
    END IF;
    CREATE POLICY tenant_isolation_FixedAsset ON public."FixedAsset" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

  -- FixedAssetCategory
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'FixedAssetCategory') THEN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_FixedAssetCategory') THEN
      DROP POLICY IF EXISTS tenant_isolation_FixedAssetCategory ON public."FixedAssetCategory";
    END IF;
    CREATE POLICY tenant_isolation_FixedAssetCategory ON public."FixedAssetCategory" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'));
  END IF;

END $$;
