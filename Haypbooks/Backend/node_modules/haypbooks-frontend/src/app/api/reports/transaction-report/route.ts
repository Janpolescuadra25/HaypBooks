import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  id: string
  date: string
  type: string
  number: string
  name: string
  memo: string
  amount: number // signed, income positive, expense negative
}


function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  // 6 rows mixing income/expense
  const rows: Row[] = [
    { id: `inv_${1000+seed%40}`, date: day(0), type: 'Invoice', number: `INV-${1000+seed%40}`, name: 'Customer A', memo: 'Consulting', amount: 1500 },
    { id: `rc_${4000+seed%40}`, date: day(1), type: 'Receipt', number: `RC-${4000+seed%40}`, name: 'Customer A', memo: 'Payment', amount: 500 },
    { id: `bill_${2000+seed%40}`, date: day(2), type: 'Bill', number: `B-${2000+seed%40}`, name: 'Vendor B', memo: 'Supplies', amount: -300 },
    { id: `je_${3000+seed%40}`, date: day(3), type: 'Journal Entry', number: `JE-${3000+seed%40}`, name: '', memo: 'Accrual', amount: 0 },
    { id: `exp_${2100+seed%40}`, date: day(4), type: 'Expense', number: `E-${2100+seed%40}`, name: 'Vendor C', memo: 'Meals', amount: -75 },
    { id: `dep_${1100+seed%40}`, date: day(5), type: 'Deposit', number: `D-${1100+seed%40}`, name: 'Bank', memo: 'Owner injection', amount: 1000 },
  ]
  const sIso = start || null
  const eIso = end || null
  return rows.filter(r => {
    if (sIso && r.date < sIso) return false
    if (eIso && r.date > eIso) return false
    return true
  })
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso, start, end)
  const totals = rows.reduce((acc, r) => { acc.net += r.amount; return acc }, { net: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
