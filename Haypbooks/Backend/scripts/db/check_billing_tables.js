const { PrismaClient } = require('@prisma/client');
(async function(){
  const p = new PrismaClient();
  try{
    const r = await p.$queryRawUnsafe(`SELECT to_regclass('public."TenantBillingInvoice"')::text as r`);
    console.log('TenantBillingInvoice:', (r && r[0]) ? r[0].r : r);
    const r2 = await p.$queryRawUnsafe(`SELECT to_regclass('public."TenantBillingUsage"')::text as r`);
    console.log('TenantBillingUsage:', (r2 && r2[0]) ? r2[0].r : r2);
  }catch(e){console.error('Error', e.message)}finally{ await p.$disconnect() }
})();