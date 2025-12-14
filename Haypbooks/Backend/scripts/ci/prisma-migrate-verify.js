#!/usr/bin/env node
const { execSync } = require('child_process')

try {
  console.log('> npx prisma migrate status --schema=prisma/schema.prisma')
  execSync('npx prisma migrate status --schema=prisma/schema.prisma', { stdio: 'inherit' })
  console.log('Prisma migrate status OK')
  process.exit(0)
} catch (e) {
  console.error('Prisma migrate status failed:', e && e.message ? e.message : e)
  process.exit(1)
}
