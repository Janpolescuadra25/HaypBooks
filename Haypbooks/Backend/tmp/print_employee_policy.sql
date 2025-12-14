SELECT polname, pg_get_expr(polqual, polrelid) as qual, pg_get_expr(polwithcheck, polrelid) as withcheck, polpermissive, polcmd FROM pg_policy WHERE polname = 'tenant_isolation_Employee';
