import { NextResponse } from 'next/server'
import { db, seedIfNeeded, createTransaction as dbCreateTransaction } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

type ParsedRow = {
  date: string
  description: string
  amount: number
  category?: 'Income' | 'Expense' | 'Transfer'
  accountId?: string
  externalId?: string
}
// --- Parsing Utilities ---
const MAX_BYTES = 2_000_000 // ~2MB safety cap
const MAX_ROWS = 5_000      // hard cap to keep processing bounded

function parseDelimited(text: string, delimiter: ',' | '\t'): string[][] {
  // Minimal CSV parser with quoted field support and CRLF handling
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  // Normalize line endings
  const s = text.replace(/\r\n?/g, '\n')
  while (i < s.length) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue } // escaped quote
        inQuotes = false; i++; continue
      }
      field += ch; i++; continue
    } else {
      if (ch === '"') { inQuotes = true; i++; continue }
      if (ch === delimiter) { row.push(field); field = ''; i++; continue }
      if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; if (rows.length > MAX_ROWS) break; continue }
      field += ch; i++; continue
    }
  }
  // push last field/row if any
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter(r => r.length > 0 && r.some(c => (c ?? '').trim().length > 0))
}
function parseCsv(text: string) { return parseDelimited(text, ',') }
function parseTsv(text: string) { return parseDelimited(text, '\t') }

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, '') // strip BOM if present
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
}

const dateKeys = new Set(['date','posted date','txn date','transaction date','statement date'])
const descKeys = new Set(['description','memo','memo/description','details','detail','bank detail','name','payee','narrative'])
const amountKeys = new Set(['amount','amt'])
const debitKeys = new Set(['debit','withdrawal','money out'])
const creditKeys = new Set(['credit','deposit','money in'])
const extIdKeys = new Set(['externalid','fitid','id','reference','ref'])
const accountIdKeys = new Set(['account id','accountid','account'])
const categoryKeys = new Set(['category','type'])

function parseAmountParts(v: string): number | null {
  if (!v) return null
  const trimmed = v.trim()
  if (!trimmed) return null
  const neg = /^\(.*\)$/.test(trimmed)
  const cleaned = trimmed.replace(/[,$]/g, '').replace(/^[\(]|[\)]$/g, '').replace(/\$/g,'')
  const n = Number(cleaned)
  if (!isFinite(n)) return null
  return neg ? -Math.abs(n) : n
}

function rowToObject(headers: string[], cols: string[]): Record<string, string> {
  const obj: Record<string,string> = {}
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i]
    obj[key] = (cols[i] ?? '').trim()
  }
  return obj
}

function normalizeRow(r: Record<string, string>): ParsedRow | null {
  // Build a normalized-key lookup
  const map = new Map<string,string>()
  for (const [k, v] of Object.entries(r)) map.set(normalizeHeader(k), v)
  // Date
  let date = ''
  for (const k of map.keys()) if (dateKeys.has(k)) { date = (map.get(k) || '').trim(); if (date) break }
  // Description
  let description = ''
  for (const k of map.keys()) if (descKeys.has(k)) { description = (map.get(k) || '').trim(); if (description) break }
  // Amount: support Amount OR Debit/Credit
  let amount: number | null = null
  for (const k of map.keys()) if (amountKeys.has(k)) { amount = parseAmountParts(map.get(k) || ''); if (amount !== null) break }
  if (amount === null) {
    // Try debit/credit
    let debit: number | null = null
    let credit: number | null = null
    for (const k of map.keys()) if (debitKeys.has(k)) { debit = parseAmountParts(map.get(k) || ''); if (debit !== null) break }
    for (const k of map.keys()) if (creditKeys.has(k)) { credit = parseAmountParts(map.get(k) || ''); if (credit !== null) break }
    if (debit !== null || credit !== null) {
      const d = Math.abs(debit || 0)
      const c = Math.abs(credit || 0)
      amount = c - d // credit increases balance; debit decreases
    }
  }
  if (!date || !description || amount === null || !isFinite(amount)) return null
  // Optional fields
  let category: any = undefined
  for (const k of map.keys()) if (categoryKeys.has(k)) { const v = (map.get(k) || '').trim(); if (['Income','Expense','Transfer'].includes(v)) { category = v; break } }
  let accountId: string | undefined = undefined
  for (const k of map.keys()) if (accountIdKeys.has(k)) { const v = (map.get(k) || '').trim(); if (v) { accountId = v; break } }
  let externalId: string | undefined = undefined
  for (const k of map.keys()) if (extIdKeys.has(k)) { const v = (map.get(k) || '').trim(); if (v) { externalId = v; break } }
  return { date, description, amount, category, accountId, externalId }
}

export async function POST(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ct = req.headers.get('content-type') || ''
  let rows: ParsedRow[] = []
  let totalRows = 0
  if (ct.includes('text/csv')) {
    const text = await req.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    const grid = parseCsv(text)
    if (grid.length === 0) return NextResponse.json({ added: 0, duplicates: 0, skipped: 0, totalRows: 0 })
    const headers = grid[0].map(normalizeHeader)
    totalRows = Math.min(grid.length - 1, MAX_ROWS)
    const parsed = [] as ParsedRow[]
    for (let i = 1; i <= totalRows; i++) {
      const obj = rowToObject(headers, grid[i] || [])
      const n = normalizeRow(obj)
      if (n) parsed.push(n)
    }
    rows = parsed
  } else if (ct.includes('text/tab-separated-values')) {
    const text = await req.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    const grid = parseTsv(text)
    if (grid.length === 0) return NextResponse.json({ added: 0, duplicates: 0, skipped: 0, totalRows: 0 })
    const headers = grid[0].map(normalizeHeader)
    totalRows = Math.min(grid.length - 1, MAX_ROWS)
    const parsed = [] as ParsedRow[]
    for (let i = 1; i <= totalRows; i++) {
      const obj = rowToObject(headers, grid[i] || [])
      const n = normalizeRow(obj)
      if (n) parsed.push(n)
    }
    rows = parsed
  } else if (ct.includes('application/ofx') || ct.includes('application/x-ofx') || ct.includes('text/ofx')) {
    const text = await req.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    rows = parseOfx(text)
    totalRows = rows.length
  } else if (ct.includes('application/qif') || ct.includes('text/qif')) {
    const text = await req.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    rows = parseQif(text)
    totalRows = rows.length
  } else if (ct.includes('application/xml') || ct.includes('text/xml')) {
    const text = await req.text()
    if (text.length > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    rows = parseCamt053(text)
    totalRows = rows.length
  } else if (ct.includes('multipart/form-data')) {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })
    if (typeof (file as any).size === 'number' && (file as any).size > MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    const name = (file as any).name ? String((file as any).name) : ''
    const lower = name.toLowerCase()
    const text = await file.text()
    let grid: string[][] | null = null
    if (lower.endsWith('.tsv')) {
      grid = parseTsv(text)
    } else if (lower.endsWith('.csv') || file.type.includes('text/csv')) {
      grid = parseCsv(text)
    } else if (lower.endsWith('.ofx')) {
      rows = parseOfx(text)
    } else if (lower.endsWith('.qif')) {
      rows = parseQif(text)
    } else if (lower.endsWith('.xml')) {
      rows = parseCamt053(text)
    } else if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || file.type.includes('application/vnd.ms-excel')) {
      return NextResponse.json({ error: 'Excel parsing not enabled in mock. Please upload CSV/TSV or enable XLSX support.' }, { status: 415 })
    } else {
      // Try CSV as a fallback
      grid = parseCsv(text)
    }
    if (rows.length === 0 && grid) {
      if (grid.length === 0) return NextResponse.json({ added: 0, duplicates: 0, skipped: 0, totalRows: 0 })
      const headers = grid[0].map(normalizeHeader)
      totalRows = Math.min(grid.length - 1, MAX_ROWS)
      const parsed = [] as ParsedRow[]
      for (let i = 1; i <= totalRows; i++) {
        const obj = rowToObject(headers, grid[i] || [])
        const n = normalizeRow(obj)
        if (n) parsed.push(n)
      }
      rows = parsed
    } else {
      totalRows = rows.length
    }
  } else {
    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 415 })
  }

  let added = 0
  let duplicates = 0
  let invalidOrSkipped = (totalRows || rows.length) - rows.length // invalid rows skipped during normalize
  for (const r of rows) {
    const duplicate = db.transactions.find(t => (
      (r.externalId && t.externalId === r.externalId) ||
      (!r.externalId && t.date.slice(0,10) === r.date && t.amount === r.amount && t.description === r.description)
    ))
    if (duplicate) { duplicates++; continue }
    dbCreateTransaction({
      date: r.date,
      description: r.description,
      category: r.category || (r.amount >= 0 ? 'Income' : 'Expense'),
      amount: r.amount,
      accountId: r.accountId || db.accounts[0].id,
      bankStatus: 'imported',
      source: 'import',
      externalId: r.externalId,
    } as any)
    added++
  }
  const totalConsidered = totalRows || rows.length
  const skipped = invalidOrSkipped + Math.max(0, (rows.length + (totalRows ? 0 : 0)) - (added + duplicates)) // normalize already accounted
  return NextResponse.json({ added, duplicates, skipped, totalRows: totalConsidered })
}

// --- Light parsers for OFX/QIF/CAMT.053 (best-effort for mock) ---
function parseOfx(text: string): ParsedRow[] {
  // OFX SGML-like; look for <STMTTRN> blocks and fields: <DTPOSTED>, <TRNAMT>, <NAME> or <MEMO>, <FITID>
  const rows: ParsedRow[] = []
  const norm = text.replace(/\r\n?/g, '\n')
  const parts = norm.split(/<\s*STMTTRN\s*>/i)
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i]
    const get = (tag: string) => {
      const m = new RegExp(`<\s*${tag}\s*>\s*([^\n<\r]+)`, 'i').exec(block)
      return m ? m[1].trim() : ''
    }
    const dt = get('DTPOSTED') || get('DTAVAIL')
    const amtStr = get('TRNAMT')
    const name = get('NAME') || get('MEMO') || 'Statement line'
    const fitid = get('FITID') || undefined
    const date = dt ? dt.slice(0,8).replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3') : ''
    const amount = parseAmountParts(amtStr)
    if (date && typeof amount === 'number') rows.push({ date, description: name, amount, externalId: fitid })
  }
  return rows
}

function parseQif(text: string): ParsedRow[] {
  const rows: ParsedRow[] = []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  let cur: any = {}
  for (const ln of lines) {
    if (!ln) continue
    const tag = ln[0]
    const val = ln.slice(1).trim()
    if (tag === '!') { continue } // header
    if (tag === '^') {
      // end record
      if (cur.D && cur.T) {
        const date = cur.D.replace(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/, (_m: any, m: string, d: string, y: string) => {
          const yy = y.length === 2 ? `20${y}` : y
          const mm = m.padStart(2,'0'); const dd = d.padStart(2,'0')
          return `${yy}-${mm}-${dd}`
        })
        const amount = parseAmountParts(cur.T)
        const desc = cur.M || cur.P || 'Statement line'
        if (date && typeof amount === 'number') rows.push({ date, description: desc, amount })
      }
      cur = {}
      continue
    }
    cur[tag] = val
  }
  return rows
}

function parseCamt053(xml: string): ParsedRow[] {
  const rows: ParsedRow[] = []
  // Very lightweight XML parsing by regex for specific fields
  const ntryRegex = /<\s*Ntry\b[\s\S]*?<\s*\/\s*Ntry\s*>/gi
  const amtRegex = /<\s*Amt[^>]*>([^<]+)<\s*\/\s*Amt\s*>/i
  const cdtDbtIndRegex = /<\s*CdtDbtInd\s*>(CREDIT|DEBIT)<\s*\/\s*CdtDbtInd\s*>/i
  const bookDtRegex = /<\s*BookgDt\s*>[\s\S]*?<\s*Dt\s*>([^<]+)<\s*\/\s*Dt\s*>[\s\S]*?<\s*\/\s*BookgDt\s*>/i
  const addtlRegex = /<\s*AddtlNtryInf\s*>([^<]+)<\s*\/\s*AddtlNtryInf\s*>/i
  const remInfoRegex = /<\s*Ustrd\s*>([^<]+)<\s*\/\s*Ustrd\s*>/i
  const refRegex = /<\s*NtryRef\s*>([^<]+)<\s*\/\s*NtryRef\s*>/i
  let m: RegExpExecArray | null
  while ((m = ntryRegex.exec(xml)) !== null) {
    const block = m[0]
    const amtStr = (amtRegex.exec(block)?.[1] || '').trim()
    const ind = (cdtDbtIndRegex.exec(block)?.[1] || 'CREDIT').toUpperCase()
    const dateStr = (bookDtRegex.exec(block)?.[1] || '').slice(0,10)
    const desc = addtlRegex.exec(block)?.[1] || remInfoRegex.exec(block)?.[1] || 'Statement line'
    const ref = refRegex.exec(block)?.[1]
    const raw = parseAmountParts(amtStr)
    if (typeof raw !== 'number' || !dateStr) continue
    const amount = ind === 'DEBIT' ? -Math.abs(raw) : Math.abs(raw)
    rows.push({ date: dateStr, description: desc, amount, externalId: ref })
  }
  return rows
}
