#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  const res = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS missing FROM public."Tenant" WHERE workspace_name IS NULL OR workspace_name = ''`)
  const missing = res && res[0] ? res[0].missing : 0
  console.log(`workspace_name missing count: ${missing}`)
  if (missing > 0) {
    console.error('ERROR: Some tenants are missing workspace_name; run backfill-workspace-name or investigate')
    process.exit(2)
  }
  console.log('All tenants have workspace_name populated')
}

run().catch((e)=>{ console.error(e); process.exit(1) }).finally(async ()=>{ await prisma.$disconnect() })
