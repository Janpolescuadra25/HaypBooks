-- Recommended migration: convert Tenant.id text -> uuid
BEGIN;
-- Note: this operation may require exclusive access and careful verification in production
ALTER TABLE public."Tenant" ALTER COLUMN id TYPE uuid USING id::uuid;
-- If your DB has explicit FK constraints referencing Tenant.id that are mis-typed, you may need to ALTER CONSTRAINTS accordingly.
COMMIT;
