import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main(){
  const t = await p.tenant.findFirst({ where: { subdomain: 'demo' } })
  const tasks = await p.task.findMany({ where: { workspaceId: t?.id } })
  console.log('tasks:', tasks.length, tasks.map(x=>({ id: x.id, title: x.title, companyId: x.companyId })))
  await p.$disconnect()
}
main().catch(e=>{ console.error(e); process.exit(1) })