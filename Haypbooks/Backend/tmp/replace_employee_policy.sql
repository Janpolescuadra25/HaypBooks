DROP POLICY IF EXISTS tenant_isolation_Employee ON public."Employee";
CREATE POLICY tenant_isolation_Employee ON public."Employee" FOR ALL
  USING (("tenantId")::text = current_setting('hayp.tenant_id'::text))
  WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'::text));
