-- 20260126103000_add_revrec_phases_variances_landedcosts/migration.sql
-- Add RevenueRecognitionPhase, StandardCostVersion, VarianceJournal, LandedCost, LandedCostLine

DO $$
BEGIN
  -- RevenueRecognitionPhase status enum stored as text; no need for SQL enum type
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'revenuerecognitionphase') THEN
    CREATE TABLE public."RevenueRecognitionPhase" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "scheduleId" uuid NOT NULL,
      "phaseNumber" integer NOT NULL,
      "percentage" numeric(10,6) NOT NULL,
      "amount" numeric(20,4) NOT NULL,
      "recognitionDate" timestamptz NOT NULL,
      "status" text NOT NULL DEFAULT 'PENDING',
      "journalEntryId" uuid,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'RevenueRecognitionPhase creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'standardcostversion') THEN
    CREATE TABLE public."StandardCostVersion" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "itemId" uuid NOT NULL,
      "effectiveAt" timestamptz NOT NULL,
      "standardCost" numeric(20,4) NOT NULL,
      "notes" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'StandardCostVersion creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'variancejournal') THEN
    CREATE TABLE public."VarianceJournal" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "type" text NOT NULL,
      "amount" numeric(20,4) NOT NULL,
      "period" text,
      "journalEntryId" uuid,
      "description" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'VarianceJournal creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'landedcost') THEN
    CREATE TABLE public."LandedCost" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "purchaseOrderId" uuid,
      "inventoryTxLineId" uuid,
      "totalAmount" numeric(20,4) NOT NULL,
      "status" text NOT NULL DEFAULT 'PENDING',
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'LandedCost creation failed: %', SQLERRM;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'landedcostline') THEN
    CREATE TABLE public."LandedCostLine" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "landedCostId" uuid NOT NULL,
      "type" text NOT NULL,
      "amount" numeric(20,4) NOT NULL,
      "description" text,
      "allocatedToInventory" boolean DEFAULT true,
      "inventoryCostLayerId" uuid,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'LandedCostLine creation failed: %', SQLERRM;
END$$;

-- Indexes & foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='revenuerecognitionphase_tenant_idx') THEN
    CREATE INDEX revenuerecognitionphase_tenant_idx ON public."RevenueRecognitionPhase"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='revenuerecognitionphase_schedule_idx') THEN
    CREATE INDEX revenuerecognitionphase_schedule_idx ON public."RevenueRecognitionPhase"("scheduleId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='standardcostversion_item_idx') THEN
    CREATE INDEX standardcostversion_item_idx ON public."StandardCostVersion"("itemId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='variancejournal_tenant_idx') THEN
    CREATE INDEX variancejournal_tenant_idx ON public."VarianceJournal"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='landedcost_tenant_idx') THEN
    CREATE INDEX landedcost_tenant_idx ON public."LandedCost"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='landedcostline_landedcost_idx') THEN
    CREATE INDEX landedcostline_landedcost_idx ON public."LandedCostLine"("landedCostId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='RevenueRecognitionPhase_schedule_fkey') THEN
    ALTER TABLE public."RevenueRecognitionPhase" ADD CONSTRAINT "RevenueRecognitionPhase_schedule_fkey" FOREIGN KEY ("scheduleId") REFERENCES public."RevenueRecognitionSchedule"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='RevenueRecognitionPhase_journal_fkey') THEN
    ALTER TABLE public."RevenueRecognitionPhase" ADD CONSTRAINT "RevenueRecognitionPhase_journal_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"("id") NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='StandardCostVersion_item_fkey') THEN
    ALTER TABLE public."StandardCostVersion" ADD CONSTRAINT "StandardCostVersion_item_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='VarianceJournal_journal_fkey') THEN
    ALTER TABLE public."VarianceJournal" ADD CONSTRAINT "VarianceJournal_journal_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public."JournalEntry"("id") NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='LandedCostLine_landedcost_fkey') THEN
    ALTER TABLE public."LandedCostLine" ADD CONSTRAINT "LandedCostLine_landedcost_fkey" FOREIGN KEY ("landedCostId") REFERENCES public."LandedCost"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='LandedCostLine_inventorycostlayer_fkey') THEN
    ALTER TABLE public."LandedCostLine" ADD CONSTRAINT "LandedCostLine_inventorycostlayer_fkey" FOREIGN KEY ("inventoryCostLayerId") REFERENCES public."InventoryCostLayer"("id") NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

-- Enable RLS and tenant policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'revenuerecognitionphase') THEN
    EXECUTE 'ALTER TABLE public."RevenueRecognitionPhase" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_RevenueRecognitionPhase ON public."RevenueRecognitionPhase"';
    EXECUTE 'CREATE POLICY tenant_isolation_RevenueRecognitionPhase ON public."RevenueRecognitionPhase" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'standardcostversion') THEN
    EXECUTE 'ALTER TABLE public."StandardCostVersion" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_StandardCostVersion ON public."StandardCostVersion"';
    EXECUTE 'CREATE POLICY tenant_isolation_StandardCostVersion ON public."StandardCostVersion" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'variancejournal') THEN
    EXECUTE 'ALTER TABLE public."VarianceJournal" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_VarianceJournal ON public."VarianceJournal"';
    EXECUTE 'CREATE POLICY tenant_isolation_VarianceJournal ON public."VarianceJournal" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'landedcost') THEN
    EXECUTE 'ALTER TABLE public."LandedCost" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_LandedCost ON public."LandedCost"';
    EXECUTE 'CREATE POLICY tenant_isolation_LandedCost ON public."LandedCost" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'landedcostline') THEN
    EXECUTE 'ALTER TABLE public."LandedCostLine" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_LandedCostLine ON public."LandedCostLine"';
    EXECUTE 'CREATE POLICY tenant_isolation_LandedCostLine ON public."LandedCostLine" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'RLS policy creation failed: %', SQLERRM;
END$$;
