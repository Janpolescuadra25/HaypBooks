const { PrismaClient } = require('@prisma/client');
(async function(){
  const p = new PrismaClient();
  try{
    console.log('[PATCH] Starting apply_convert_top_tables_tenantid_patch');
    // WorkspaceUser
    await p.$executeRawUnsafe('ALTER TABLE public."WorkspaceUser" ADD COLUMN IF NOT EXISTS tenantid_new uuid');
    await p.$executeRawUnsafe('UPDATE public."WorkspaceUser" SET tenantid_new = COALESCE(tenantid_old::uuid, "tenantId_old"::uuid) WHERE tenantid_new IS NULL AND (tenantid_old IS NOT NULL OR "tenantId_old" IS NOT NULL)');
    // create unique constraint on lower-case columns if not exists
    const uw = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE contype = 'u' AND conname = 'WorkspaceUser_tenant_user_unique'");
    if(!uw || (Array.isArray(uw) && uw.length===0)){
      console.log('[PATCH] Adding WorkspaceUser_tenant_user_unique (on tenantid_new, userid)');
      await p.$executeRawUnsafe('ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_tenant_user_unique" UNIQUE (tenantid_new, userid)');
    } else console.log('[PATCH] WorkspaceUser_tenant_user_unique exists');

    // CompanyUser & PracticeUser
    for(const t of ['CompanyUser','PracticeUser']){
      await p.$executeRawUnsafe(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS tenantid_new uuid`);
      await p.$executeRawUnsafe(`UPDATE public."${t}" SET tenantid_new = COALESCE(tenantid_old::uuid, "tenantId_old"::uuid) WHERE tenantid_new IS NULL AND (tenantid_old IS NOT NULL OR "tenantId_old" IS NOT NULL)`);
      // Add FK new if not exists (note using lowercase alias columns for referencing)
    }

    // Add NOT VALID FKs for CompanyUser & PracticeUser referencing WorkspaceUser
    const fk1 = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE conname='CompanyUser_tenantId_userId_fkey_new'");
    if(!fk1 || (Array.isArray(fk1) && fk1.length===0)){
      await p.$executeRawUnsafe('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantid_new, userid) REFERENCES public."WorkspaceUser"(tenantid_new, userid) ON DELETE CASCADE ON UPDATE CASCADE NOT VALID');
      console.log('[PATCH] CompanyUser FK created (NOT VALID)');
    }
    const fk2 = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE conname='PracticeUser_tenantId_userId_fkey_new'");
    if(!fk2 || (Array.isArray(fk2) && fk2.length===0)){
      await p.$executeRawUnsafe('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantid_new, userid) REFERENCES public."WorkspaceUser"(tenantid_new, userid) ON DELETE CASCADE ON UPDATE CASCADE NOT VALID');
      console.log('[PATCH] PracticeUser FK created (NOT VALID)');
    }

    // Company
    await p.$executeRawUnsafe('ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS tenantid_new uuid');
    await p.$executeRawUnsafe('UPDATE public."Company" SET tenantid_new = COALESCE(tenantid_old::uuid, "tenantId_old"::uuid) WHERE tenantid_new IS NULL AND (tenantid_old IS NOT NULL OR "tenantId_old" IS NOT NULL)');
    const fk3 = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE conname='Company_tenantId_fkey_new'");
    if(!fk3 || (Array.isArray(fk3) && fk3.length===0)){
      await p.$executeRawUnsafe('ALTER TABLE public."Company" ADD CONSTRAINT "Company_tenantId_fkey_new" FOREIGN KEY (tenantid_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID');
      console.log('[PATCH] Company FK created (NOT VALID)');
    }

    // JournalEntry & JournalEntryLine
    await p.$executeRawUnsafe('ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS tenantid_new uuid');
    await p.$executeRawUnsafe('UPDATE public."JournalEntry" SET tenantid_new = COALESCE(tenantid_old::uuid, "tenantId_old"::uuid) WHERE tenantid_new IS NULL AND (tenantid_old IS NOT NULL OR "tenantId_old" IS NOT NULL)');
    const fk4 = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE conname='JournalEntry_tenantId_fkey_new'");
    if(!fk4 || (Array.isArray(fk4) && fk4.length===0)){
      await p.$executeRawUnsafe('ALTER TABLE public."JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey_new" FOREIGN KEY (tenantid_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID');
      console.log('[PATCH] JournalEntry FK created (NOT VALID)');
    }

    await p.$executeRawUnsafe('ALTER TABLE public."JournalEntryLine" ADD COLUMN IF NOT EXISTS tenantid_new uuid');
    await p.$executeRawUnsafe('UPDATE public."JournalEntryLine" SET tenantid_new = COALESCE(tenantid_old::uuid, "tenantId_old"::uuid) WHERE tenantid_new IS NULL AND (tenantid_old IS NOT NULL OR "tenantId_old" IS NOT NULL)');
    const fk5 = await p.$queryRawUnsafe("SELECT 1 FROM pg_constraint WHERE conname='JournalEntryLine_tenantId_fkey_new'");
    if(!fk5 || (Array.isArray(fk5) && fk5.length===0)){
      await p.$executeRawUnsafe('ALTER TABLE public."JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenantId_fkey_new" FOREIGN KEY (tenantid_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID');
      console.log('[PATCH] JournalEntryLine FK created (NOT VALID)');
    }

    console.log('[PATCH] Patch applied: tenantId_new columns populated and NOT VALID FKs created where possible.');
  }catch(e){
    console.error('[PATCH] Error', e.message);
    process.exit(1);
  }finally{ await p.$disconnect(); }
})();
