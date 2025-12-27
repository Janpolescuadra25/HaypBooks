CompanyId Backfill Script
=========================

This directory contains a script that will create a default company per tenant and backfill null `companyId` columns on tenant-scoped models.

How to run (staging or local):

1. Make sure `.env` contains the correct `DATABASE_URL` for a staging DB copy.
2. Run the script:

   npx ts-node scripts/db/backfill-company-ids.ts

3. Review output for errors.

Notes
- The script is idempotent — it will create a company named `Default Company` (ID `company-<tenant.id>`) if none exists.
- The migration that created FK constraints set them to `NOT VALID`. After running this backfill in a maintenance window, validate constraints with SQL:

  DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'companyid' AND table_schema = 'public' LOOP EXECUTE FORMAT('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', r.table_name, format('fk_%s_company', r.table_name)); END LOOP; END $$;

---

Phone HMAC Backfill
-------------------

A separate backfill script is provided to populate `phoneHmac` for users that already have a `phone` value set but no `phoneHmac` computed yet.

How to run (staging or local):

1. Ensure `HMAC_KEY` is set in your environment (required).
2. Run the script:

   npm run db:backfill:phoneHmac

Notes:
- The script updates only users with `phone IS NOT NULL AND phoneHmac IS NULL` and is therefore idempotent.
- Run this during a maintenance window in production to avoid heavy write contention.
- After verifying backfill success in staging and production, consider removing the plaintext fallback in user lookups and adding a uniqueness constraint/index if desired.

