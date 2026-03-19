const { PrismaClient } = require('@prisma/client');
(async function(){
  const p = new PrismaClient();
  try{
    console.log('[PATCH] Running guarded rename of billing tables (no-op if missing)');
    await p.$executeRawUnsafe(`DO $$ BEGIN IF to_regclass('public."TenantBillingInvoice"') IS NOT NULL AND to_regclass('public."WorkspaceBillingInvoice"') IS NULL THEN EXECUTE 'ALTER TABLE public."TenantBillingInvoice" RENAME TO "WorkspaceBillingInvoice"'; END IF; IF to_regclass('public."TenantBillingUsage"') IS NOT NULL AND to_regclass('public."WorkspaceBillingUsage"') IS NULL THEN EXECUTE 'ALTER TABLE public."TenantBillingUsage" RENAME TO "WorkspaceBillingUsage"'; END IF; END $$;`);
    console.log('[PATCH] Renames executed (if tables existed).');
  }catch(e){ console.error('[PATCH] Error', e.message); process.exit(1) } finally{ await p.$disconnect() }
})();