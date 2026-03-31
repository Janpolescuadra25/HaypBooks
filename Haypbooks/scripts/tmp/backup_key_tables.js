const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
;(async()=>{
  try {
    const dir = path.resolve(__dirname, '../../Backend/backups')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g,'-')
    console.log('Backing up Tenant/Company/TenantUser/TenantInvite to', dir)

    const tenants = await prisma.tenant.findMany({})
    fs.writeFileSync(path.join(dir, `tenants_${ts}.json`), JSON.stringify(tenants, null, 2))
    console.log('Tenants:', tenants.length)

    const tenantUsers = await prisma.tenantUser.findMany({})
    fs.writeFileSync(path.join(dir, `tenantUsers_${ts}.json`), JSON.stringify(tenantUsers, null, 2))
    console.log('TenantUsers:', tenantUsers.length)

    const companies = await prisma.company.findMany({})
    fs.writeFileSync(path.join(dir, `companies_${ts}.json`), JSON.stringify(companies, null, 2))
    console.log('Companies:', companies.length)

    const invites = await prisma.tenantInvite.findMany({})
    fs.writeFileSync(path.join(dir, `tenantInvites_${ts}.json`), JSON.stringify(invites, null, 2))
    console.log('TenantInvites:', invites.length)

    console.log('Backup files saved to', dir)
  } catch (e) {
    console.error('Backup failed:', e?.message || e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
