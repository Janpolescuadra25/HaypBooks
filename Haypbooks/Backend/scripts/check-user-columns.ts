#!/usr/bin/env tsx
/**
 * Check what columns exist in the User table
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking User table columns...\n')
  
  const userColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_name = 'User' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `
  
  console.log('User table columns:')
  userColumns.forEach((col, idx) => {
    console.log(`  ${idx + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
  })
  
  const hasCompanyName = userColumns.some(c => c.column_name === 'companyName' || c.column_name === 'companyname')
  console.log(`\n✓ Has companyName field: ${hasCompanyName}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)
