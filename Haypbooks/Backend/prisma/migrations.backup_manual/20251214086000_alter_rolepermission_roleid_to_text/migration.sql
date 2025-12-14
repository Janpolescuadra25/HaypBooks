-- Convert RolePermission.roleId to text to match Role.id which is text
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='RolePermission' AND udt_name = 'uuid' AND column_name='roleId') THEN
    ALTER TABLE public."RolePermission" ALTER COLUMN "roleId" TYPE text USING "roleId"::text;
  END IF;
END$$;
