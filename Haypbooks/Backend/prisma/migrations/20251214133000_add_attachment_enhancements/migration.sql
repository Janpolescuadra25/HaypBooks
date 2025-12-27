-- 20251214133000_add_attachment_enhancements/migration.sql
-- Add metadata fields and soft-delete to Attachment; add deletedAt to Task; add FTS index

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add columns to Attachment (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='fileName') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "fileName" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='fileSize') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "fileSize" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='mimeType') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "mimeType" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='uploadedById') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "uploadedById" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='description') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "description" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='uploadedAt') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "uploadedAt" timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='deletedAt') THEN
    ALTER TABLE public."Attachment" ADD COLUMN "deletedAt" timestamptz;
  END IF;
END$$;

-- Add FK to User for uploadedById if types match
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='uploadedById') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='"User"' AND column_name='id' AND (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Attachment' AND column_name='uploadedById') = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='"User"' AND column_name='id')) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_attachment_user_uploadedby') THEN
      EXECUTE 'ALTER TABLE public."Attachment" ADD CONSTRAINT fk_attachment_user_uploadedby FOREIGN KEY ("uploadedById") REFERENCES public."User"("id") ON DELETE SET NULL NOT VALID';
    END IF;
  END IF;
END$$;

-- Indexes for Attachment
CREATE INDEX IF NOT EXISTS idx_attachment_tenant ON public."Attachment" ("tenantId");
CREATE INDEX IF NOT EXISTS idx_attachment_entity ON public."Attachment" ("tenantId", "entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_attachment_uploadedAt ON public."Attachment" ("uploadedAt");

-- Add deletedAt to Task if not present
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='deletedAt') THEN
    ALTER TABLE public."Task" ADD COLUMN "deletedAt" timestamptz;
  END IF;
END$$;

-- Full-text search index for Task.description
DO $$ BEGIN
  -- create index only if description column exists and index missing
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='description') AND NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname = 'idx_task_description_fts') THEN
    EXECUTE 'CREATE INDEX idx_task_description_fts ON public."Task" USING GIN (to_tsvector(''english'', coalesce("description",'''')))';
  END IF;
END$$;
