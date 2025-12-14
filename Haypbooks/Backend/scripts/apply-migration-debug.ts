import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

;(async () => {
  const prisma = new PrismaClient()
  try {
    const sql = fs.readFileSync('prisma/migrations/phase17-timesheets.sql', 'utf8')
    console.log('Executing SQL file...')
    const statements = sql.split(/;[\n\r]+/) // split on semicolons followed by newline(s)
    for (const stmt of statements) {
      const s = stmt.trim()
      if (!s) continue
      console.log('Executing statement:', s.slice(0, 80).replace(/\n/g, ' ') + (s.length > 80 ? '...' : ''))
      try {
        const r = await prisma.$executeRawUnsafe(s)
        console.log('  OK')
      } catch (e) {
        console.error('  ERROR', e)
      }
    }
  } catch (e) {
    console.error('Error running SQL:', e)
  } finally {
    await prisma.$disconnect()
  }
})()
