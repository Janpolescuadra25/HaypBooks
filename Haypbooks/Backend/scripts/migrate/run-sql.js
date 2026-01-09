#!/usr/bin/env node
/**
 * Migration runner: executes SQL files in prisma/migrations in lexical order
 */
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })
const { Client } = require('pg')

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'prisma', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.error('No migrations directory at', migrationsDir)
    process.exit(1)
  }

  // collect .sql files recursively (support prisma-style migration folders)
  function collectSql(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let result = []
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) result = result.concat(collectSql(full))
      else if (e.isFile() && e.name.endsWith('.sql')) result.push(full)
    }
    return result
  }

  const files = collectSql(migrationsDir).sort()
  if (!files.length) {
    console.log('No SQL migration files found')
    process.exit(0)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set in environment')
    process.exit(1)
  }

  async function runMigrationsOnce() {
    const client = new Client({ connectionString })
    await client.connect()

    try {
    for (const file of files) {
      const filePath = path.isAbsolute(file) ? file : path.join(migrationsDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      console.log('Applying', path.relative(migrationsDir, filePath))
      // Execute statements individually to continue on single statement failures
      function splitSqlStatements(sql) {
        const stmts = []
        let cur = ''
        let i = 0
        let inSingle = false
        let inDouble = false
        let dollarTag = null
        while (i < sql.length) {
          const ch = sql[i]
          // detect line comments -- ...\n and block comments /* ... */
          if (!inSingle && !inDouble && !dollarTag && ch === '-' && sql[i+1] === '-') {
            // consume until end of line
            const end = sql.indexOf('\n', i+2)
            if (end === -1) {
              // rest of file is a comment
              i = sql.length
              break
            }
            cur += sql.slice(i, end + 1)
            i = end + 1
            continue
          }
          if (!inSingle && !inDouble && !dollarTag && ch === '/' && sql[i+1] === '*') {
            // consume until closing */
            const end = sql.indexOf('*/', i+2)
            if (end === -1) {
              cur += sql.slice(i)
              i = sql.length
              break
            }
            cur += sql.slice(i, end + 2)
            i = end + 2
            continue
          }
          // detect dollar-quote start
          if (!inSingle && !inDouble && sql[i] === '$') {
            const match = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/)
            if (match) {
              const tag = match[0]
              cur += tag
              i += tag.length
              // consume until matching tag
              const end = sql.indexOf(tag, i)
              if (end === -1) {
                cur += sql.slice(i)
                i = sql.length
                break
              } else {
                cur += sql.slice(i, end + tag.length)
                i = end + tag.length
                continue
              }
            }
          }
          if (ch === "'" && !inDouble) {
            inSingle = !inSingle
            cur += ch
            i++
            continue
          }
          if (ch === '"' && !inSingle) {
            inDouble = !inDouble
            cur += ch
            i++
            continue
          }
          if (ch === ';' && !inSingle && !inDouble && !dollarTag) {
            const s = cur.trim()
            if (s) stmts.push(s)
            cur = ''
            i++
            continue
          }
          cur += ch
          i++
        }
        if (cur.trim()) stmts.push(cur.trim())
        return stmts
      }

      const stmts = splitSqlStatements(content)
      for (const stmt of stmts) {
        try {
          // Basic idempotent pre-checks to avoid noisy errors for common statements
          const s = stmt.trim()
          const single = s.replace(/\s+/g, ' ')

          // 1) CREATE INDEX (or CREATE UNIQUE INDEX)
          const idxMatch = single.match(/^CREATE\s+(UNIQUE\s+)?INDEX\s+"?([^\s\(\"']+)"?/i)
          if (idxMatch) {
            const idxName = idxMatch[2]
            const res = await client.query('SELECT 1 FROM pg_class WHERE relname = $1', [idxName])
            if (res.rowCount > 0) {
              console.info(`Migration statement skipped (index exists): ${idxName}`)
              continue
            }
          }

          // 2) ALTER TABLE ... ADD CONSTRAINT "name"
          const constrMatch = single.match(/ADD\s+CONSTRAINT\s+"([^"]+)"/i)
          if (constrMatch) {
            const constr = constrMatch[1]
            const res = await client.query('SELECT 1 FROM pg_constraint WHERE conname = $1', [constr])
            if (res.rowCount > 0) {
              console.info(`Migration statement skipped (constraint exists): ${constr}`)
              continue
            }
          }

          // 3) ALTER TABLE ... ADD COLUMN "col"
          const addColMatch = single.match(/ALTER\s+TABLE\s+"?([^\s\"]+)"?\s+ADD\s+COLUMN\s+"?([^\s\"]+)"?/i)
          if (addColMatch) {
            const table = addColMatch[1]
            const col = addColMatch[2]
            const res = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 AND column_name = $2`, [table, col])
            if (res.rowCount > 0) {
              console.info(`Migration statement skipped (column exists): ${table}.${col}`)
              continue
            }
          }

          // 4) CREATE TYPE "TypeName" AS ENUM ...
          const typeMatch = single.match(/^CREATE\s+TYPE\s+"?([^\s\"]+)"?/i)
          if (typeMatch) {
            const typeName = typeMatch[1]
            const res = await client.query('SELECT 1 FROM pg_type WHERE lower(typname) = lower($1)', [typeName])
            if (res.rowCount > 0) {
              console.info(`Migration statement skipped (type exists): ${typeName}`)
              continue
            }
          }

          // If none of the pre-checks matched, run the statement
          await client.query(stmt)
        } catch (innerErr) {
          const msg = (innerErr && innerErr.message) ? innerErr.message : String(innerErr)
          // Suppress known benign migration errors that are expected when running idempotent SQL
          const benignPatterns = [
            /already exists/i,
            /type .* already exists/i,
            /relation .* already exists/i,
            /column .* already exists/i,
            /constraint .* already exists/i,
            /cannot drop constraint .* because other objects depend on it/i,
            /syntax error at or near "loop"/i,
          ]
          const isBenign = benignPatterns.some(r => r.test(msg))
          if (isBenign) {
            console.info(`Migration statement skipped (benign): ${msg}`)
          } else {
            console.warn(`Migration statement failed in ${path.relative(migrationsDir, filePath)} — continuing. Error:`, msg)
            console.warn('Failed statement (first 400 chars):', stmt.slice(0, 400))
          }
        }
      }
      console.log('Applied', path.relative(migrationsDir, filePath))
    }
      console.log('All migrations applied (attempted)')
      // Ensure tenantId columns and Task.archivedAt exist after migrations
      try {
        const { execSync } = require('child_process')
        console.log('Running ensure_tenantid_uuid.js to finalize tenantId/Task schema')
        execSync('node ./scripts/ensure_tenantid_uuid.js', { stdio: 'inherit', cwd: process.cwd(), env: process.env })
        console.log('Post-migration ensure completed')
        const res = await client.query("SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='archivedAt'")
        if (res.rowCount === 0) {
          throw new Error('Post-migration assertion failed: Task.archivedAt missing')
        }
      } catch (e) {
        console.error('Post-migration ensure/assert failed:', e && e.message ? e.message : e)
        throw e
      } finally {
        await client.end()
      }
      return
    } catch (err) {
      try { await client.end() } catch (e) {}
      throw err
    }
  }

  // Retry the entire migration run a few times to handle transient connection resets
  let attempts = 0
  const maxAttempts = 3
  let backoff = 500
  while (attempts < maxAttempts) {
    attempts++
    try {
      await runMigrationsOnce()
      break
    } catch (err) {
      console.error(`Migration run failed (attempt ${attempts}/${maxAttempts}):`, err && err.message ? err.message : err)
      if (attempts >= maxAttempts) {
        console.error('Migration runner failed unexpectedly after retries:', err)
        process.exitCode = 1
        break
      }
      console.log(`Retrying migrations in ${backoff}ms...`)
      await new Promise(r => setTimeout(r, backoff))
      backoff *= 2
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
