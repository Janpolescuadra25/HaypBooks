import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
;(async()=>{
  try {
    console.log('Dropping TenantUser_pkey CASCADE')
    await p.$executeRawUnsafe('ALTER TABLE public."TenantUser" DROP CONSTRAINT IF EXISTS "TenantUser_pkey" CASCADE')
    try {
      console.log('Dropping NOT NULL on tenantId_old (if exists)')
      await p.$executeRawUnsafe('ALTER TABLE public."TenantUser" ALTER COLUMN "tenantId_old" DROP NOT NULL')
    } catch(e:any) { console.warn('Drop NOT NULL failed (ok):', e?.message || e) }
    console.log('Done')
  } catch (e:any) {
    console.error('Error:', e?.message || e)
    process.exit(1)
  } finally {
    await p.$disconnect()
  }
})()
