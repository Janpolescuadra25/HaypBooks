const { PrismaClient } = require('@prisma/client');
const targetTables = ['WorkspaceUser','CompanyUser','PracticeUser'];
(async function(){
  const prisma = new PrismaClient();
  try{
    for(const t of targetTables){
      const cols = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1", t);
      const colNames = cols.map(r => r.column_name);
      const hasQuoted = colNames.includes('userId');
      const hasLower = colNames.includes('userid');
      if(hasQuoted && !hasLower){
        console.log('[PATCH] Creating lowercase userid on', t);
        await prisma.$executeRawUnsafe(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS userid uuid`);
        await prisma.$executeRawUnsafe(`UPDATE public."${t}" SET userid = "userId"::uuid WHERE userid IS NULL AND "userId" IS NOT NULL`);
        console.log('[PATCH] Populated userid for', t);
      } else if (hasLower){
        console.log('[OK] Lowercase userid already exists on', t);
      } else {
        console.log('[SKIP] No userId found on', t);
      }
    }
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
