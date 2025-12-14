-- Create or replace trigger function that tolerates both quoted and unquoted column names
CREATE OR REPLACE FUNCTION public.ensure_company_belongs_to_tenant()
RETURNS TRIGGER AS $$
DECLARE
  comp_tenant TEXT;
  v_companyId TEXT;
  v_tenantId TEXT;
BEGIN
  BEGIN
    v_companyId := NEW."companyId";
  EXCEPTION WHEN others THEN
    v_companyId := NULL;
  END;
  IF v_companyId IS NULL THEN
    BEGIN
      v_companyId := NEW.companyid;
    EXCEPTION WHEN others THEN
      v_companyId := NULL;
    END;
  END IF;

  IF v_companyId IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_tenantId := NEW."tenantId";
  EXCEPTION WHEN others THEN
    v_tenantId := NULL;
  END;
  IF v_tenantId IS NULL THEN
    BEGIN
      v_tenantId := NEW.tenantid;
    EXCEPTION WHEN others THEN
      v_tenantId := NULL;
    END;
  END IF;

  SELECT "tenantId" INTO comp_tenant FROM public."Company" WHERE id = v_companyId;
  IF comp_tenant IS NULL THEN
    RAISE EXCEPTION 'invalid companyId % on %', v_companyId, TG_TABLE_NAME;
  END IF;
  IF comp_tenant::text != v_tenantId::text THEN
    RAISE EXCEPTION 'company tenant mismatch for companyId=% tenantId=% table=%', v_companyId, v_tenantId, TG_TABLE_NAME;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
