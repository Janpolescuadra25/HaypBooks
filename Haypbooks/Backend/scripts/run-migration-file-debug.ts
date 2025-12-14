import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

async function run() {
  const prisma = new PrismaClient()
  try {
    const path = process.argv[2]
    if (!path) {
      console.error('Usage: ts-node run-migration-file-debug.ts <path-to-sql-file>')
      process.exit(1)
    }
    const sql = fs.readFileSync(path, 'utf8')
    console.log('Executing SQL file:', path)
    const statements = splitSqlStatements(sql)
    for (const stmt of statements) {
      const s = stmt.trim()
      if (!s) continue
      console.log('\nExecuting statement:', s.slice(0, 200).replace(/\n/g, ' ') + (s.length > 200 ? '...' : ''))
      try {
        await prisma.$executeRawUnsafe(s)
        console.log('  OK')
      } catch (e: any) {
        console.error('  ERROR', e && e.message ? e.message : e)
        break
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

run().catch((e) => {
  console.error('Unexpected error', e)
  process.exit(1)
})

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let i = 0
  let inSingle = false
  let inDouble = false
  let inDollar = false
  let dollarTag = ''
  while (i < sql.length) {
    const ch = sql[i]
    const next = sql[i + 1]
    current += ch
    if (!inSingle && !inDouble && !inDollar && ch === '$' && sql[i + 1] === '$') {
      inDollar = true
      dollarTag = '$$'
      current += next
      i += 1
    } else if (inDollar && dollarTag && current.endsWith(dollarTag)) {
      // closing dollar tag
      inDollar = false
    } else if (!inDouble && !inDollar && ch === "'") {
      inSingle = !inSingle
    } else if (!inSingle && !inDollar && ch === '"') {
      inDouble = !inDouble
    }

    if (!inSingle && !inDouble && !inDollar && ch === ';') {
      // consider statement boundary if followed by newline or end of file
      const rem = sql.slice(i + 1)
      const m = rem.match(/^[\r\n]/)
      if (m || i + 1 >= sql.length) {
        statements.push(current.trim())
        current = ''
      }
    }
    i++
  }
  if (current.trim()) statements.push(current.trim())
  return statements
}
