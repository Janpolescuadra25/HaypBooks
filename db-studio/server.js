// ── Haypbooks DB Studio Server ─────────────────────────────────────────────
// Run: node server.js  (or: npm run dev)
// Opens: http://localhost:4000

const fs = require('fs')
const path = require('path')

// Load .env manually (no dotenv dependency)
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.trim().split('=')
    if (k && !k.startsWith('#')) process.env[k] = v.join('=')
  })
}

const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

// ── DB Connection ──────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.connect()
  .then(c => { c.release(); console.log('✅ PostgreSQL connected') })
  .catch(e => { console.error('❌ DB connect failed:', e.message); process.exit(1) })

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// ── Module Groupings ───────────────────────────────────────────────────────
// Maps group name → list of table name patterns (lowercase match)
const MODULE_GROUPS = [
  {
    name: 'General Ledger',
    icon: '📒',
    color: '#10b981',
    patterns: ['account', 'journal', 'closing', 'accounting_period', 'account_balance', 'account_type', 'account_sub', 'account_segment', 'chart_of', 'cashflow', 'cash_flow', 'accrual', 'period_close']
  },
  {
    name: 'Invoices & AR',
    icon: '🧾',
    color: '#6366f1',
    patterns: ['invoice', 'credit_note', 'customer_statement', 'customer_credit', 'quote', 'customer_refund', 'chargeback', 'revenue_recogn', 'ar_', 'dunning', 'price_list', 'write_off']
  },
  {
    name: 'Bills & AP',
    icon: '📄',
    color: '#ef4444',
    patterns: ['bill', 'debit_note', 'ap_', 'bill_payment', 'bill_line', 'accounts_payable', 'vendor_credit', 'receipt', 'mileage_log']
  },
  {
    name: 'Payments',
    icon: '💳',
    color: '#f59e0b',
    patterns: ['payment', 'refund', 'check_', 'checks']
  },
  {
    name: 'Banking',
    icon: '🏦',
    color: '#3b82f6',
    patterns: ['bank', 'reconcil', 'cash_over', 'deposit', 'credit_line', 'company_card', 'business_loan', 'merchant_account', 'credit_health']
  },
  {
    name: 'Payroll & HR',
    icon: '👥',
    color: '#8b5cf6',
    patterns: ['payroll', 'employee', 'contractor', 'time_', 'timesheet', 'leave', 'overtime', 'workforce', 'deduction', 'payslip', 'salary', 'benefit', 'shift_', 'government_remit', 'loan_repay']
  },
  {
    name: 'Inventory',
    icon: '📦',
    color: '#f97316',
    patterns: ['inventory', 'product', 'item', 'assembly', 'warehouse', 'stock', 'lot_serial', 'reorder', 'cogs', 'purchase_order', 'receiving', 'back_order']
  },
  {
    name: 'Projects & Assets',
    icon: '🏗️',
    color: '#06b6d4',
    patterns: ['project', 'asset', 'fixed_asset', 'depreciation', 'construction', 'cost_code', 'change_order', 'contract_retention', 'work_in_progress', 'project_billing', 'project_retainer']
  },
  {
    name: 'Customers & Vendors',
    icon: '🤝',
    color: '#14b8a6',
    patterns: ['customer', 'vendor', 'contact', 'supplier']
  },
  {
    name: 'Tax & Compliance',
    icon: '🛡️',
    color: '#dc2626',
    patterns: ['tax', 'vat', 'bir', 'compliance', 'withholding', 'alphalist', 'bir_', 'percentage_tax', 'final_tax', 'advance_pricing', 'phi', 'sss', 'philhealth', 'pagibig', 'internal_control', 'control_test', 'policy_document', 'fraud', 'filing_']
  },
  {
    name: 'Budgets & Reports',
    icon: '📊',
    color: '#84cc16',
    patterns: ['budget', 'report', 'dashboard', 'snapshot', 'forecast', 'analytic', 'insight', 'data_quality']
  },
  {
    name: 'Workspace & Company',
    icon: '🏢',
    color: '#a855f7',
    patterns: ['company', 'workspace', 'firm', 'subscription', 'plan', 'feature', 'tenant', 'consolidat', 'currency', 'country', 'legal_entit']
  },
  {
    name: 'Automation & AI',
    icon: '🤖',
    color: '#ec4899',
    patterns: ['ai_', 'ai ', 'automation', 'recurring', 'scheduled', 'rule_', 'workflow', 'approval', 'notification', 'dead_letter', 'archive']
  },
  {
    name: 'System & Security',
    icon: '⚙️',
    color: '#64748b',
    patterns: ['audit', 'api_', 'user', 'role', 'permission', 'otp', 'session', 'token', 'consent', 'data_retention', 'rate_limit', 'attachment', 'import_', 'export_', 'team', 'login_history']
  },
]

function classifyTable(tableName) {
  const lower = tableName.toLowerCase()
  for (const group of MODULE_GROUPS) {
    if (group.patterns.some(p => lower.includes(p.toLowerCase()))) {
      return group.name
    }
  }
  return 'Other'
}

// ── Helpers ────────────────────────────────────────────────────────────────
async function query(sql, params = []) {
  const client = await pool.connect()
  try {
    const res = await client.query(sql, params)
    return res
  } finally {
    client.release()
  }
}

async function getAllTables() {
  const res = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('_prisma_migrations')
    ORDER BY table_name
  `)
  return res.rows.map(r => r.table_name)
}

async function getTableCount(tableName) {
  try {
    const res = await query(`SELECT COUNT(*)::int AS cnt FROM "${tableName}"`)
    return res.rows[0].cnt
  } catch {
    return 0
  }
}

async function getTableColumns(tableName) {
  const res = await query(`
    SELECT
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_primary
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
    ) pk ON pk.column_name = c.column_name
    WHERE c.table_name = $1
      AND c.table_schema = 'public'
    ORDER BY c.ordinal_position
  `, [tableName])
  return res.rows
}

async function getForeignKeys(tableName) {
  const res = await query(`
    SELECT
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = $1
      AND tc.table_schema = 'public'
  `, [tableName])
  return res.rows
}

function getPrimaryKey(columns) {
  const pk = columns.find(c => c.is_primary)
  return pk ? pk.column_name : columns[0]?.column_name || 'id'
}

// ── API Routes ─────────────────────────────────────────────────────────────

// GET /api/modules — all tables grouped with record counts
app.get('/api/modules', async (req, res) => {
  try {
    const tables = await getAllTables()

    // Count records concurrently (limit to avoid overwhelming DB)
    const countResults = await Promise.all(
      tables.map(async t => ({ table: t, count: await getTableCount(t) }))
    )

    // Build groups
    const groups = {}
    for (const { table, count } of countResults) {
      const groupName = classifyTable(table)
      if (!groups[groupName]) {
        const meta = MODULE_GROUPS.find(g => g.name === groupName) || { icon: '📋', color: '#64748b' }
        groups[groupName] = { name: groupName, icon: meta.icon, color: meta.color, tables: [] }
      }
      groups[groupName].tables.push({ name: table, count, label: toLabel(table) })
    }

    // Sort tables within groups
    for (const g of Object.values(groups)) {
      g.tables.sort((a, b) => a.label.localeCompare(b.label))
    }

    // Return in defined order
    const ordered = MODULE_GROUPS
      .filter(g => groups[g.name])
      .map(g => groups[g.name])
    if (groups['Other']) ordered.push(groups['Other'])

    res.json({ groups: ordered, total_tables: tables.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/table/:name/schema — column definitions
app.get('/api/table/:name/schema', async (req, res) => {
  try {
    const columns = await getTableColumns(req.params.name)
    const fks = await getForeignKeys(req.params.name)
    res.json({ columns, foreign_keys: fks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Filter builder helpers ────────────────────────────────────────────────
function buildFilterClause(filters, columns, startIdx) {
  const clauses = []
  const params = []
  let idx = startIdx
  for (const f of filters) {
    const col = columns.find(c => c.column_name === f.column)
    if (!col) continue
    const q = `"${f.column}"`
    const isNumeric = ['integer','bigint','smallint','numeric','decimal','real','double precision','money'].includes(col.data_type)
    const isDate    = ['date','timestamp','timestamp without time zone','timestamp with time zone','timestamptz'].includes(col.data_type)
    switch (f.operator) {
      case 'eq':          clauses.push(`${q} = $${idx++}`); params.push(f.value); break
      case 'neq':         clauses.push(`${q} != $${idx++}`); params.push(f.value); break
      case 'gt':          clauses.push(`${q} > $${idx++}`); params.push(f.value); break
      case 'gte':         clauses.push(`${q} >= $${idx++}`); params.push(f.value); break
      case 'lt':          clauses.push(`${q} < $${idx++}`); params.push(f.value); break
      case 'lte':         clauses.push(`${q} <= $${idx++}`); params.push(f.value); break
      case 'contains':    clauses.push(`${q}::text ILIKE $${idx++}`); params.push(`%${f.value}%`); break
      case 'not_contains':clauses.push(`${q}::text NOT ILIKE $${idx++}`); params.push(`%${f.value}%`); break
      case 'starts':      clauses.push(`${q}::text ILIKE $${idx++}`); params.push(`${f.value}%`); break
      case 'ends':        clauses.push(`${q}::text ILIKE $${idx++}`); params.push(`%${f.value}`); break
      case 'is_null':     clauses.push(`${q} IS NULL`); break
      case 'not_null':    clauses.push(`${q} IS NOT NULL`); break
      case 'in': {
        const vals = String(f.value).split(',').map(v => v.trim()).filter(Boolean)
        if (!vals.length) break
        const placeholders = vals.map(() => `$${idx++}`).join(',')
        clauses.push(`${q}::text IN (${placeholders})`)
        params.push(...vals)
        break
      }
      case 'between': {
        const parts = String(f.value).split('|')
        if (parts.length === 2) {
          clauses.push(`${q} BETWEEN $${idx++} AND $${idx++}`)
          params.push(parts[0].trim(), parts[1].trim())
        }
        break
      }
      default: break
    }
  }
  return { clauses, params }
}

// GET /api/table/:name/distinct/:col — unique values for filter dropdowns
app.get('/api/table/:name/distinct/:col', async (req, res) => {
  const { name, col } = req.params
  try {
    const r = await query(
      `SELECT DISTINCT "${col}"::text AS val FROM "${name}" WHERE "${col}" IS NOT NULL ORDER BY val LIMIT 80`
    )
    res.json({ values: r.rows.map(x => x.val) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/table/:name — paginated rows with search + advanced filters
app.get('/api/table/:name', async (req, res) => {
  const { name } = req.params
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 25)
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  const sortCol = req.query.sort || null
  const sortDir = (req.query.order || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

  // Parse advanced filters: JSON array of {column, operator, value}
  let advFilters = []
  try { advFilters = JSON.parse(req.query.filters || '[]') } catch {}

  try {
    const columns = await getTableColumns(name)
    if (!columns.length) return res.status(404).json({ error: 'Table not found' })

    const pk = getPrimaryKey(columns)
    const textCols = columns.filter(c =>
      ['character varying', 'text', 'varchar', 'char', 'citext'].includes(c.data_type)
    ).slice(0, 5)

    const whereParts = []
    const params = []

    // Full-text search
    if (search && textCols.length) {
      const conditions = textCols.map((c, i) => `"${c.column_name}"::text ILIKE $${i + 1}`)
      params.push(...textCols.map(() => `%${search}%`))
      whereParts.push(`(${conditions.join(' OR ')})`)
    }

    // Advanced filters
    if (advFilters.length) {
      const { clauses, params: fp } = buildFilterClause(advFilters, columns, params.length + 1)
      whereParts.push(...clauses)
      params.push(...fp)
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
    const orderBy = sortCol ? `ORDER BY "${sortCol}" ${sortDir}` : `ORDER BY "${pk}" ${sortDir}`

    // Total count
    const countRes = await query(
      `SELECT COUNT(*)::int AS cnt FROM "${name}" ${where}`,
      params
    )
    const total = countRes.rows[0].cnt

    // Data
    const dataRes = await query(
      `SELECT * FROM "${name}" ${where} ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    res.json({
      table: name,
      columns: columns.map(c => c.column_name),
      column_types: Object.fromEntries(columns.map(c => [c.column_name, c.data_type])),
      primary_key: pk,
      rows: dataRes.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/record/:table/:pk — single record + FK lookups
app.get('/api/record/:table/:pk', async (req, res) => {
  const { table, pk: pkVal } = req.params
  try {
    const columns = await getTableColumns(table)
    const pkCol = getPrimaryKey(columns)
    const fks = await getForeignKeys(table)

    const recRes = await query(`SELECT * FROM "${table}" WHERE "${pkCol}" = $1 LIMIT 1`, [pkVal])
    if (!recRes.rows.length) return res.status(404).json({ error: 'Record not found' })

    const record = recRes.rows[0]

    // Resolve FK values (lookup label for each FK)
    const related = {}
    await Promise.all(fks.map(async fk => {
      const val = record[fk.column_name]
      if (val == null) return
      try {
        // Get first few columns of related record to show a label
        const relCols = await getTableColumns(fk.foreign_table_name)
        const labelCol = relCols.find(c =>
          ['name', 'title', 'label', 'code', 'number', 'email', 'reference'].some(kw =>
            c.column_name.toLowerCase().includes(kw)
          )
        ) || relCols[1] || relCols[0]
        if (!labelCol) return

        const relPk = getPrimaryKey(relCols)
        const relRes = await query(
          `SELECT "${relPk}", "${labelCol.column_name}" FROM "${fk.foreign_table_name}" WHERE "${fk.foreign_column_name}" = $1 LIMIT 1`,
          [val]
        )
        if (relRes.rows.length) {
          related[fk.column_name] = {
            table: fk.foreign_table_name,
            pk: relRes.rows[0][relPk],
            label: String(relRes.rows[0][labelCol.column_name] ?? ''),
            fk_column: fk.foreign_column_name
          }
        }
      } catch {}
    }))

    // Reverse relations: tables that reference this table
    const reverseRes = await query(`
      SELECT
        kcu.table_name AS from_table,
        kcu.column_name AS from_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = $1
        AND ccu.column_name = $2
        AND tc.table_schema = 'public'
      LIMIT 12
    `, [table, pkCol])

    const reverseRelated = {}
    await Promise.all(reverseRes.rows.map(async r => {
      try {
        const cntRes = await query(
          `SELECT COUNT(*)::int AS cnt FROM "${r.from_table}" WHERE "${r.from_column}" = $1`,
          [pkVal]
        )
        reverseRelated[r.from_table] = {
          table: r.from_table,
          column: r.from_column,
          count: cntRes.rows[0].cnt
        }
      } catch {}
    }))

    res.json({
      table,
      primary_key: pkCol,
      record,
      columns,
      related,
      reverse_related: reverseRelated
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/stats — database overview stats
app.get('/api/stats', async (req, res) => {
  try {
    const tables = await getAllTables()
    const sizeRes = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size,
             current_database() AS db_name,
             version() AS pg_version
    `)
    const countRes = await query(`
      SELECT SUM(reltuples)::bigint AS total_rows
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `)
    res.json({
      database: sizeRes.rows[0].db_name,
      db_size: sizeRes.rows[0].db_size,
      pg_version: sizeRes.rows[0].pg_version.split(' ').slice(0, 2).join(' '),
      total_tables: tables.length,
      estimated_total_rows: countRes.rows[0].total_rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/search?q= — cross-table search
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q || q.length < 2) return res.json({ results: [] })
  const tables = await getAllTables()
  const results = []
  await Promise.all(tables.slice(0, 40).map(async t => {
    try {
      const cols = await getTableColumns(t)
      const textCols = cols.filter(c =>
        ['character varying', 'text', 'varchar'].includes(c.data_type)
      ).slice(0, 3)
      if (!textCols.length) return
      const conds = textCols.map((c, i) => `"${c.column_name}"::text ILIKE $${i + 1}`)
      const params = textCols.map(() => `%${q}%`)
      const r = await query(`SELECT * FROM "${t}" WHERE ${conds.join(' OR ')} LIMIT 2`, params)
      r.rows.forEach(row => {
        results.push({ table: t, record: row, label: toLabel(t) })
      })
    } catch {}
  }))
  res.json({ results: results.slice(0, 20), query: q })
})

// ── Helpers ────────────────────────────────────────────────────────────────
function toLabel(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🗄️  Haypbooks DB Studio running at http://localhost:${PORT}\n`)
})
