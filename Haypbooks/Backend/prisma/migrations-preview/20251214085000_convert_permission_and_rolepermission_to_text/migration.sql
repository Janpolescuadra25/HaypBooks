-- Convert Permission.id and RolePermission columns to text, add constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Permission' AND udt_name = 'uuid') THEN
    ALTER TABLE public."Permission" ALTER COLUMN "id" TYPE text USING "id"::text;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='RolePermission' AND udt_name = 'uuid') THEN
    ALTER TABLE public."RolePermission" ALTER COLUMN "roleId" TYPE text USING "roleId"::text;
    ALTER TABLE public."RolePermission" ALTER COLUMN "permissionId" TYPE text USING "permissionId"::text;
  END IF;
END$$;

DO $$
BEGIN
  BEGIN
    ALTER TABLE public."RolePermission" ADD CONSTRAINT fk_rolepermission_role FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON DELETE CASCADE NOT VALID;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  BEGIN
    ALTER TABLE public."RolePermission" ADD CONSTRAINT fk_rolepermission_permission FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON DELETE CASCADE NOT VALID;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END$$;
