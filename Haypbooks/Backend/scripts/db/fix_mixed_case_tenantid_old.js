const { PrismaClient } = require('@prisma/client');
const targetTables = ['WorkspaceUser','Company','JournalEntry','JournalEntryLine'];
(async function(){
  const prisma = new PrismaClient();
  try{
    for(const t of targetTables){
      const cols = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1", t);
      const colNames = cols.map(r => r.column_name);
      const hasMixed = colNames.includes('tenantId_old');
      const hasLower = colNames.includes('tenantid_old');
      if(hasMixed && !hasLower){
        console.log('[PATCH] Creating lowercase tenantid_old on', t);
        await prisma.$executeRawUnsafe(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS tenantid_old text`);
        await prisma.$executeRawUnsafe(`UPDATE public."${t}" SET tenantid_old = "tenantId_old"::text WHERE tenantid_old IS NULL AND "tenantId_old" IS NOT NULL`);
        console.log('[PATCH] Populated tenantid_old for', t);
      } else if (hasLower){
        console.log('[OK] Lowercase tenantid_old already exists on', t);
      } else {
        console.log('[SKIP] No tenantId_old found on', t);
      }
    }
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
