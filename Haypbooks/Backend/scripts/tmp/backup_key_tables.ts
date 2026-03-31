import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
;(async()=>{
  try {
    const dir = path.resolve(__dirname, '../../backups')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g,'-')
    console.log('Backing up Tenant/Company/TenantUser/TenantInvite to', dir)

    const tenants: any = await prisma.$queryRawUnsafe('SELECT id, row_to_json(t) as row FROM public."Tenant" t ORDER BY "createdAt" DESC LIMIT 1000')
    fs.writeFileSync(path.join(dir, `tenants_${ts}.json`), JSON.stringify(tenants, null, 2))
    console.log('Tenants (sample):', (tenants as any).length)

    const tenantUsers: any = await prisma.$queryRawUnsafe('SELECT * FROM public."TenantUser" LIMIT 2000')
    fs.writeFileSync(path.join(dir, `tenantUsers_${ts}.json`), JSON.stringify(tenantUsers, null, 2))
    console.log('TenantUsers (sample):', (tenantUsers as any).length)

    const companies: any = await prisma.$queryRawUnsafe('SELECT * FROM public."Company" LIMIT 1000')
    fs.writeFileSync(path.join(dir, `companies_${ts}.json`), JSON.stringify(companies, null, 2))
    console.log('Companies (sample):', (companies as any).length)

    const invites: any = await prisma.$queryRawUnsafe('SELECT * FROM public."TenantInvite" LIMIT 1000')
    fs.writeFileSync(path.join(dir, `tenantInvites_${ts}.json`), JSON.stringify(invites, null, 2))
    console.log('TenantInvites (sample):', (invites as any).length)

    console.log('Backup files saved to', dir)
  } catch (e: any) {
    console.error('Backup failed:', e?.message || e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
