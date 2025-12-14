import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main(){
  const t = await p.tenant.findFirst({ where: { subdomain: 'demo' } })
  const u = await p.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
  const c = await p.company.findFirst({ where: { tenantId: t?.id } })
  console.log('tenant', t?.id)
  console.log('user', u?.id)
  console.log('company', c?.id)
  try{
    await p.$executeRaw`INSERT INTO public."Task" ("tenantId","companyId","title","description","status","priority","createdById","assigneeId","reminderSent","createdAt","updatedAt") VALUES (${t?.id}, ${c?.id || null}, 'raw test', 'desc','PENDING','MEDIUM', ${u?.id}, NULL, false, now(), now())`
    console.log('inserted raw')
  }catch(e){ console.error('raw insert error', e) }
  await p.$disconnect()
}
main().catch(e=>{console.error(e); process.exit(1)})