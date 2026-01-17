#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findDuplicates() {
  console.log('Scanning for duplicate companies per tenant (case-insensitive name)...')
  const rows: any[] = await prisma.$queryRaw`
    SELECT c."tenantId", lower(c.name) as lname, json_agg(json_build_object('id', c.id, 'name', c.name, 'createdAt', c."createdAt" ORDER BY c."createdAt")) as companies, count(*)
    FROM public."Company" c
    GROUP BY c."tenantId", lower(c.name)
    HAVING count(*) > 1
    ORDER BY c."tenantId";
  `

  if (!rows || rows.length === 0) {
    console.log('No duplicate companies found. Great!')
    return
  }

  console.log(`Found ${rows.length} duplicate name groups:`)
  for (const r of rows) {
    console.log('---')
    console.log('tenantId:', r.tenantId)
    console.log('normalized name:', r.lname)
    try {
      const comps = r.companies as any[]
      comps.forEach((c, i) => {
        console.log(`  [${i}] id=${c.id} name=${c.name} createdAt=${c.createdAt}`)
      })
    } catch (e) {
      console.log('  (failed to parse companies payload)')
    }
  }
}

findDuplicates()
  .catch((e) => { console.error('Error scanning duplicates:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
