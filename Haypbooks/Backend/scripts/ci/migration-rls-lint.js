const fs = require('fs')
const path = require('path')

function parseCreateTables(sql) {
  const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\"?([\w]+)\"?\.)?\"?([\w]+)\"?/ig
  const tenantColRegex = /tenant[_]?id(?:_txt)?/i
  const tables = []
  let match
  while ((match = createRegex.exec(sql)) !== null) {
    const tableName = match[2]
    // Now find the table block to see if tenant column present
    const start = match.index
    // find the end of the create table block by locating the next ');' after the opening paren
    const openParen = sql.indexOf('(', start)
    let endPos = -1
    if (openParen >= 0) {
      endPos = sql.indexOf(');', openParen)
      if (endPos === -1) endPos = Math.min(openParen + 2000, sql.length)
    }
    const snippet = endPos > start ? sql.substring(start, endPos) : sql.substring(start, Math.min(start + 2000, sql.length))
    if (tenantColRegex.test(snippet)) tables.push(tableName)
  }
  return tables
}

function parseAlterAddTenantColumns(sql) {
  const alterRegex = /ALTER\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?[\w]+"?\.)?"?([\w]+)"?\s+ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?"?tenantId(?:_txt)?"?/ig
  const tables = []
  let m
  while ((m = alterRegex.exec(sql)) !== null) {
    tables.push(m[1])
  }
  return tables
}

function indexExistsForTable(sql, tableName) {
  const idxRegex = new RegExp(`CREATE\s+(?:UNIQUE\s+)?INDEX[\s\S]*ON\s+(?:"?[\w]+"?\.)?"?${tableName}"?\s*\([^)]*(?:tenantId|tenantId_txt)[^)]*\)`, 'i')
  const uniqueConstraintRegex = new RegExp(`CONSTRAINT\s+\"[\w]+\"[\s\S]*UNIQUE\s*\([^)]*(?:tenantId|tenantId_txt)[^)]*\)`, 'i')
  const uniqueInlineRegex = new RegExp(`UNIQUE\s*\([^)]*(?:tenantId|tenantId_txt)[^)]*\)`, 'i')
  return idxRegex.test(sql) || uniqueConstraintRegex.test(sql) || uniqueInlineRegex.test(sql)
}

function foreignKeyExistsForTable(sql, tableName) {
  // Look for explicit foreign key referencing Tenant
    const fkRegex = new RegExp(`FOREIGN\\s+KEY\\s*\\([^)]*(?:tenantId|tenantId_txt)[^)]*\\)[\\s\\S]*REFERENCES[\\s\\S]*"?Tenant"?`, 'i')
  // inline column reference: tenantId TEXT REFERENCES "Tenant"("id")
    const inlineRefRegex = new RegExp(`(?:tenantId|tenantId_txt)[^,)]*REFERENCES[\\s\\S]*"?Tenant"?\\s*\\(\\s*\"?id\"?\\s*\\)`, 'i')
  // Look for constraint name checks
  const name = `${tableName}_tenant_fkey`
  const nameTid = `${tableName}_tenantId_fkey`
  const connameRegex = new RegExp(`conname\s*\=\s*'${name}'`, 'i')
  const connameRegexTid = new RegExp(`conname\s*\=\s*'${nameTid}'`, 'i')
  // Look for ADD CONSTRAINT or ALTER TABLE ... ADD CONSTRAINT lines for the named constraint
  const addConstraintRegex = new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+\"?${name}\"?`, 'i')
  const addConstraintRegexTid = new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+\"?${nameTid}\"?`, 'i')
  // explicit alter table referencing the specific table and referencing Tenant
  const alterFkExactRegex = new RegExp(`ALTER\s+TABLE[\s\S]*"?${tableName}"?[\s\S]*ADD\s+CONSTRAINT[\s\S]*REFERENCES[\s\S]*"?Tenant"?`, 'i')
  const addConstraintShorthand = new RegExp(`ADD\s+CONSTRAINT\s+\"?${name}\"?`, 'i')
  const addConstraintShorthandTid = new RegExp(`ADD\s+CONSTRAINT\s+\"?${nameTid}\"?`, 'i')
  const tableMentionRegex = new RegExp(`"?${tableName}"?`, 'i')
  const referencesTenantRegex = new RegExp(`REFERENCES[\s\S]*"?Tenant"?`, 'i')
  const containsConstraintName = sql.indexOf("'" + name + "'") > -1 || sql.indexOf('"' + name + '"') > -1 || sql.indexOf("'" + nameTid + "'") > -1 || sql.indexOf('"' + nameTid + '"') > -1
  const has = fkRegex.test(sql) || inlineRefRegex.test(sql) || connameRegex.test(sql) || connameRegexTid.test(sql) || addConstraintRegex.test(sql) || addConstraintRegexTid.test(sql) || addConstraintShorthand.test(sql) || addConstraintShorthandTid.test(sql) || alterFkExactRegex.test(sql) || containsConstraintName || (tableMentionRegex.test(sql) && referencesTenantRegex.test(sql))
  return has
}

function migrationHasRls(sql, tableName) {
  const enableRegex = new RegExp(`ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i')
  const policyRegex = new RegExp(`CREATE\\s+POLICY[\s\S]*\\b${tableName}\\b`, 'i')
  return enableRegex.test(sql) || policyRegex.test(sql)
}

function run() {
  // Prefer migrations directory relative to this script's repository package (Backend)
  const migrationsCandidates = [
    path.resolve(__dirname, '..', '..', 'prisma', 'migrations'), // Haypbooks/Backend/prisma/migrations
    path.resolve(process.cwd(), 'prisma', 'migrations'), // repo root prisma/migrations
    path.resolve(process.cwd(), 'Haypbooks', 'Backend', 'prisma', 'migrations') // fallback path
  ]
  let migrationsDir = migrationsCandidates.find(d => fs.existsSync(d))
  if (!migrationsDir || !fs.existsSync(migrationsDir)) {
    console.log('No migrations directory; nothing to lint')
    process.exit(0)
  }

  function listSqlFiles(dir) {
    const res = []
    const items = fs.readdirSync(dir)
    for (const it of items) {
      const full = path.join(dir, it)
      if (fs.statSync(full).isDirectory()) {
        res.push(...listSqlFiles(full))
      } else if (it.endsWith('.sql')) {
        // store as relative path
        res.push(path.relative(migrationsDir, full))
      }
    }
    return res
  }
  const files = listSqlFiles(migrationsDir)
  const backupRefRegex = /tenantId_(?:uuid_old|txt)/i
  const filesWithBackups = []
  const allowedBackupFilePatterns = [
    'drop_tenantid_backups',
    'replace_policies_use_tenantid',
    'replace_policies_use_tenantid_uuid_old',
    'swap_tenantid_txt_to_tenantid',
    'drop_taxrate_tenantid_uuid_old',
    'add_tenantid_txt_and_fks_for_uuid_tables'
  ]
  // Check for any references to backup tenantId columns
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    if (backupRefRegex.test(sql)) {
      const match = sql.match(backupRefRegex)[0]
      const shouldAllow = allowedBackupFilePatterns.some(p => file.includes(p))
      if (!shouldAllow) filesWithBackups.push({ file, sql: match })
    }
  }
  if (filesWithBackups.length) {
    console.error('Migration RLS lint failed — backups references found in migration SQL (tenantId_uuid_old / tenantId_txt):')
    filesWithBackups.forEach(f => console.error('- ' + f.file + ' => ' + f.sql))
    process.exit(2)
  }
  const tableMap = new Map()
  const tenantTablesMap = new Map()
  for (const file of files) {
    const full = path.join(migrationsDir, file)
    const sql = fs.readFileSync(full, 'utf8')
    const tables = parseCreateTables(sql)
    const altered = parseAlterAddTenantColumns(sql)
    tables.forEach(t => {
      if (!tableMap.has(t)) tableMap.set(t, [])
      tableMap.get(t).push({ file, sql })
      if (!tenantTablesMap.has(t)) tenantTablesMap.set(t, [])
      tenantTablesMap.get(t).push({ file, sql })
    })
    altered.forEach(t => {
      if (!tenantTablesMap.has(t)) tenantTablesMap.set(t, [])
      tenantTablesMap.get(t).push({ file, sql })
    })
  }

  const missing = []
  const missingIndex = []
  const missingFK = []
  const allowedToBeGlobal = new Set([
    'AccountType','ApiTokenRevocation','Currency','ExchangeRate','DeadLetter','JobAttempt','OnboardingStep','Otp','SchemaMigration','Session','TaxJurisdiction','User','UserSecurityEvent','Tenant'
  ])
  for (const [table, occurrences] of tableMap.entries()) {
    // Check if any migration contains an RLS enabling for this table
    const has = occurrences.some(o => migrationHasRls(o.sql, table))
    // Also check subsequent migrations for RLS
    if (!has) {
      // search all files for enable/policy mentioning table
      const all = files.some(f => {
        const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8')
        return migrationHasRls(sql, table)
      })
      if (!all) missing.push(table)
    }
  }

  // Check for tenantId index and FK for all tables that had tenantId created via create or alter
  for (const [table, occurrences] of tenantTablesMap.entries()) {
    // Occurrences where tenantId was detected for this table
    const hasIndex = occurrences.some(o => indexExistsForTable(o.sql, table)) || files.some(f => indexExistsForTable(fs.readFileSync(path.join(migrationsDir, f), 'utf8'), table))
    const hasFKOccurs = occurrences.some(o => foreignKeyExistsForTable(o.sql, table))
    const hasFKFiles = files.some(f => foreignKeyExistsForTable(fs.readFileSync(path.join(migrationsDir, f), 'utf8'), table))
    const hasFK = hasFKOccurs || hasFKFiles
    // FK occurrences/files check: ${table}
    if (!hasIndex && !allowedToBeGlobal.has(table)) missingIndex.push(table)
    if (!hasFK && !allowedToBeGlobal.has(table)) missingFK.push(table)
  }

  if (missing.length) {
    console.error('Migration RLS lint failed — tenant-scoped tables missing RLS policies or enabling statements:')
    missing.forEach(m => console.error('- ' + m))
    if (missingIndex.length) {
      console.error('\nMigration tenant-id index lint failed — tenant-scoped tables missing tenantId index:')
      missingIndex.forEach(m => console.error('- ' + m))
      // Debug: show which files did or did not contain index for these tables
      missingIndex.forEach(table => {
        console.error('\n[Debug] Table: ' + table)
        files.forEach(f => {
          const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8')
          const has = indexExistsForTable(sql, table)
          if (has) console.error(`  + Index found in ${f}`)
          else {
            // also check in nested migration directories
            const p = path.join(migrationsDir, f)
            if (fs.statSync(p).isDirectory()) {
              const nested = fs.readdirSync(p).filter(ff => ff.endsWith('.sql'))
              nested.forEach(nf => {
                const sqln = fs.readFileSync(path.join(p, nf), 'utf8')
                if (indexExistsForTable(sqln, table)) console.error(`  + Index found in ${f}/${nf}`)
              })
            }
          }
        })
      })
    }
    if (missingFK.length) {
      console.error('\nMigration tenant-id fk lint failed — tenant-scoped tables missing tenantId FK to Tenant:')
      missingFK.forEach(m => console.error('- ' + m))
    }
    process.exit(1)
  }

  console.log('Migration RLS lint passed — all tenant-scoped tables have RLS enabling or policies in migrations')
  if (missingIndex.length) {
    console.error('\nMigration tenant-id index lint failed — tenant-scoped tables missing tenantId index:')
    missingIndex.forEach(m => console.error('- ' + m))
    process.exit(1)
  }
  if (missingFK.length) {
    console.error('\nMigration tenant-id fk lint failed — tenant-scoped tables missing tenantId FK to Tenant:')
    missingFK.forEach(m => console.error('- ' + m))
    // Debug: show which files did or did not contain FK for these tables
    missingFK.slice(0, 12).forEach(table => {
      console.error('\n[Debug] FK checks for Table: ' + table)
      files.forEach(f => {
        const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8')
        const has = foreignKeyExistsForTable(sql, table)
        if (has) console.error(`  + FK found in ${f}`)
        else {
          // Also show which individual regex checks are true, for troubleshooting
          const fkRegex = new RegExp(`FOREIGN\s+KEY\s*\([^)]*tenantId[^)]*\)[\s\S]*REFERENCES[\s\S]*"?Tenant"?`, 'i')
          const inlineRefRegex = new RegExp(`tenantId[^,)]*REFERENCES[\s\S]*"?Tenant"?\s*\(\s*\"?id\"?\s*\)`, 'i')
          const name = `${table}_tenant_fkey`
          const nameTid = `${table}_tenantId_fkey`
          const connameRegex = new RegExp(`conname\s*\=\s*'${name}'`, 'i')
          const connameRegexTid = new RegExp(`conname\s*\=\s*'${nameTid}'`, 'i')
          const addConstraintRegex = new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+\"?${name}\"?`, 'i')
          const addConstraintRegexTid = new RegExp(`ALTER\s+TABLE[\s\S]*ADD\s+CONSTRAINT\s+\"?${nameTid}\"?`, 'i')
          const addConstraintShorthand = new RegExp(`ADD\s+CONSTRAINT\s+\"?${name}\"?`, 'i')
          const addConstraintShorthandTid = new RegExp(`ADD\s+CONSTRAINT\s+\"?${nameTid}\"?`, 'i')
            console.error(`   - file: ${f} => fkRegex=${fkRegex.test(sql)}, inlineRef=${inlineRefRegex.test(sql)}, conname=${connameRegex.test(sql)}, connameTid=${connameRegexTid.test(sql)}, addConst=${addConstraintRegex.test(sql)}, addConstTid=${addConstraintRegexTid.test(sql)}, addShorth=${addConstraintShorthand.test(sql)}, addShorthTid=${addConstraintShorthandTid.test(sql)}, containsName=${sql.includes(name)}, containsNameTid=${sql.includes(nameTid)}`)
        }
      })
    })
    process.exit(1)
  }
  process.exit(0)
}

run()
