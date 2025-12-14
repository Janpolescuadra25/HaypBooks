-- Create Permission and RolePermission tables (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Permission') THEN
    CREATE TABLE public."Permission" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "key" text UNIQUE NOT NULL,
      "desc" text
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='RolePermission') THEN
    CREATE TABLE public."RolePermission" (
      "roleId" uuid NOT NULL,
      "permissionId" uuid NOT NULL,
      PRIMARY KEY ("roleId", "permissionId")
    );

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rolepermission_role') THEN
      ALTER TABLE public."RolePermission" ADD CONSTRAINT fk_rolepermission_role FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON DELETE CASCADE NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rolepermission_permission') THEN
      ALTER TABLE public."RolePermission" ADD CONSTRAINT fk_rolepermission_permission FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON DELETE CASCADE NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'rolepermission_roleid_idx') THEN
      CREATE INDEX rolepermission_roleid_idx ON public."RolePermission"("roleId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'rolepermission_permissionid_idx') THEN
      CREATE INDEX rolepermission_permissionid_idx ON public."RolePermission"("permissionId");
    END IF;
  END IF;
END$$;
