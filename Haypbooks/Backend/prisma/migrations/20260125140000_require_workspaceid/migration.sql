-- Backfill tenantId (workspaceId @map("tenantId")) from Company where possible and then set NOT NULL
-- This migration will raise if any table still has NULL tenantId after backfill so you can inspect and correct data

DO $$
DECLARE
  v_count int;
BEGIN
  -- AiModel
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('AiModel') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."AiModel" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."AiModel" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'AiModel still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."AiModel" ALTER COLUMN "tenantId" SET NOT NULL;

  -- DataQualityScore
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('DataQualityScore') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."DataQualityScore" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."DataQualityScore" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'DataQualityScore still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."DataQualityScore" ALTER COLUMN "tenantId" SET NOT NULL;

  -- EventLog: no safe automatic mapping available; fail if NULLs remain so the team can inspect
  SELECT count(*) INTO v_count FROM public."EventLog" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'EventLog has % NULL tenantId rows; manual investigation required before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."EventLog" ALTER COLUMN "tenantId" SET NOT NULL;

  -- OutboxEvent: no safe automatic mapping available; fail if NULLs remain so the team can inspect
  SELECT count(*) INTO v_count FROM public."OutboxEvent" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'OutboxEvent has % NULL tenantId rows; manual investigation required before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."OutboxEvent" ALTER COLUMN "tenantId" SET NOT NULL;

  -- EntityVersion
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('EntityVersion') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."EntityVersion" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."EntityVersion" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'EntityVersion still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."EntityVersion" ALTER COLUMN "tenantId" SET NOT NULL;

  -- ExternalSystemConfig
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('ExternalSystemConfig') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."ExternalSystemConfig" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."ExternalSystemConfig" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ExternalSystemConfig still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."ExternalSystemConfig" ALTER COLUMN "tenantId" SET NOT NULL;

  -- ExternalSystemAudit
  -- No reliable automatic backfill; fail if NULL tenantId rows exist
  SELECT count(*) INTO v_count FROM public."ExternalSystemAudit" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ExternalSystemAudit still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."ExternalSystemAudit" ALTER COLUMN "tenantId" SET NOT NULL;

  -- NotificationPreference
  UPDATE public."NotificationPreference" t SET "tenantId" = c."tenantId"::uuid
    FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  SELECT count(*) INTO v_count FROM public."NotificationPreference" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'NotificationPreference still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."NotificationPreference" ALTER COLUMN "tenantId" SET NOT NULL;

  -- ApiKey
  SELECT count(*) INTO v_count FROM public."ApiKey" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ApiKey has % NULL tenantId rows; manual intervention required to associate keys with workspaces', v_count;
  END IF;
  ALTER TABLE public."ApiKey" ALTER COLUMN "tenantId" SET NOT NULL;

  -- SyncJob
  SELECT count(*) INTO v_count FROM public."SyncJob" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SyncJob has % NULL tenantId rows; manual intervention required', v_count;
  END IF;
  ALTER TABLE public."SyncJob" ALTER COLUMN "tenantId" SET NOT NULL;

  -- SystemHealthStatus
  SELECT count(*) INTO v_count FROM public."SystemHealthStatus" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SystemHealthStatus has % NULL tenantId rows; manual intervention required', v_count;
  END IF;
  ALTER TABLE public."SystemHealthStatus" ALTER COLUMN "tenantId" SET NOT NULL;

  -- WebhookSubscription
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('WebhookSubscription') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."WebhookSubscription" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."WebhookSubscription" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'WebhookSubscription still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."WebhookSubscription" ALTER COLUMN "tenantId" SET NOT NULL;

  -- WebhookDelivery
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('WebhookDelivery') AND lower(column_name)=lower('subscriptionId')) THEN
    UPDATE public."WebhookDelivery" t SET "tenantId" = c."tenantId"::uuid
      FROM public."WebhookSubscription" s JOIN public."Company" c ON s."companyId" = c."id"
      WHERE t."subscriptionId" = s."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."WebhookDelivery" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'WebhookDelivery still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."WebhookDelivery" ALTER COLUMN "tenantId" SET NOT NULL;

  -- DocumentTemplateVersion: backfill from DocumentTemplate.templateId -> DocumentTemplate.tenantId
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('DocumentTemplateVersion') AND lower(column_name)=lower('templateId')) THEN
    UPDATE public."DocumentTemplateVersion" t SET "tenantId" = dt."tenantId"
      FROM public."DocumentTemplate" dt WHERE t."templateId" = dt."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."DocumentTemplateVersion" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'DocumentTemplateVersion still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."DocumentTemplateVersion" ALTER COLUMN "tenantId" SET NOT NULL;

  -- DocumentSignature
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND lower(table_name)=lower('DocumentSignature') AND lower(column_name)=lower('companyId')) THEN
    UPDATE public."DocumentSignature" t SET "tenantId" = c."tenantId"::uuid
      FROM public."Company" c WHERE t."companyId" = c."id" AND t."tenantId" IS NULL;
  END IF;
  SELECT count(*) INTO v_count FROM public."DocumentSignature" WHERE "tenantId" IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'DocumentSignature still has % NULL tenantId rows; please fix before applying NOT NULL', v_count;
  END IF;
  ALTER TABLE public."DocumentSignature" ALTER COLUMN "tenantId" SET NOT NULL;

END
$$;
