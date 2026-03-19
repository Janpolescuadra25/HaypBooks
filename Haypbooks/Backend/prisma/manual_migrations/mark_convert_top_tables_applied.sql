UPDATE "_prisma_migrations"
SET finished_at = now(), logs = '', applied_steps_count = 1, rolled_back_at = NULL
WHERE migration_name = '20260126223000_convert_top_tables_tenantid' AND finished_at IS NULL;

-- Also mark tenant_id_to_uuid and rename_billing_to_workspace entries as applied if their SQL was run manually
UPDATE "_prisma_migrations"
SET finished_at = now(), logs = '', applied_steps_count = 1, rolled_back_at = NULL
WHERE migration_name IN ('20260126203000_tenant_id_to_uuid', '20260129120000_rename_billing_to_workspace') AND finished_at IS NULL;
