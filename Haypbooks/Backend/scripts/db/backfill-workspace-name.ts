#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run(dry = true) {
  console.log(`Workspace name backfill (dry=${dry})`)

  // Ensure column exists (idempotent)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS workspace_name text`)
    console.log('Ensured column workspace_name exists on Tenant')
  } catch (e) {
    console.warn('Warning: failed to ensure column exists (continuing):', e?.message || e)
  }

  // Count how many tenants would be updated
  const toUpdate = await prisma.$queryRaw`
    SELECT id, name, workspace_name FROM public."Tenant" WHERE workspace_name IS NULL OR workspace_name = ''
  ` as Array<{ id: string; name: string | null; workspace_name: string | null }>

  console.log(`Found ${toUpdate.length} tenants with missing workspace_name`)
  if (toUpdate.length === 0) return

  for (const t of toUpdate) {
    console.log(`  Tenant ${t.id} -> name=${t.name ?? '<null>'}`)
  }

  if (dry) {
    console.log('Dry run complete. To apply updates re-run with --apply')
    return
  }

  console.log('Applying updates...')
  // If name is present, use it; otherwise set a deterministic fallback 'Workspace-<shortid>' to avoid NULLs
  const res = await prisma.$executeRawUnsafe(`
    UPDATE public."Tenant" SET workspace_name = COALESCE(NULLIF(name,''), ('Workspace-' || substring(id::text from 1 for 8))) WHERE workspace_name IS NULL OR workspace_name = ''
  `)
  console.log('Update result:', res)
}

const args = process.argv.slice(2)
const apply = args.includes('--apply')

run(!apply).catch((e)=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
