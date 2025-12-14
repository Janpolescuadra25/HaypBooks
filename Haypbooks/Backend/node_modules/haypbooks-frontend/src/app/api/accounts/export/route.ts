import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import type { NextRequest } from 'next/server'
import { db } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

// Import accounts data by reusing the GET logic file scope
import * as accountsModule from '@/app/api/accounts/route'

type Account = { id: string; number: string; name: string; type: string; active?: boolean; reconcilable?: boolean; openingBalanceDate?: string; parentId?: string; parentNumber?: string; detailType?: string; balance?: number }

function computeRollups(accounts: Account[]): Record<string, number> {
  const byId: Record<string, Account> = {}
  const children: Record<string, Account[]> = {}
  accounts.forEach(a => { byId[a.id] = a })
  accounts.forEach(a => {
    if (a.parentId) {
      children[a.parentId] ||= []
      children[a.parentId].push(a)
    }
  })
  const memo: Record<string, number> = {}
  const sumTree = (id: string): number => {
    if (memo[id] != null) return memo[id]
    const self = Number(byId[id]?.balance || 0)
    const kids = children[id] || []
    const total = kids.reduce((s, c) => s + sumTree(c.id), self)
    memo[id] = Number(total.toFixed(2))
    return memo[id]
  }
  accounts.forEach(a => { sumTree(a.id) })
  return memo
}

export async function GET(req: NextRequest) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const asOfParam = url.searchParams.get('asOf')
  const asOfIso = asOfParam ? String(asOfParam).slice(0,10) : new Date().toISOString().slice(0,10)
  // rollup parity – support rollup=1 or includeRollup=1
  const rollup = url.searchParams.get('rollup') === '1' || url.searchParams.get('includeRollup') === '1'
  // Always include balances for export parity; append includeBalances=1 when delegating
  const apiUrl = new URL(req.url)
  apiUrl.searchParams.set('includeBalances', '1')
  if (asOfParam) apiUrl.searchParams.set('asOf', asOfIso)
  // Call the handler to obtain accounts data (not ideal, but fine for mock)
  const json = await (accountsModule as any).GET(new Request(apiUrl.toString()))
  const data = await (json as Response).json() as { accounts: Account[] }
  // CSV-Version opt-in
  const versionFlag = parseCsvVersionFlag(req)
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const rows = [
    ...(versionFlag ? [['CSV-Version','1']] : []),
    [buildCsvCaption(null, null, asOfIso)],
    [],
  ['Number','Name','Type','Detail Type','Parent Number','ID','Active','Reconcilable','Opening Balance Date','Balance'],
  ...(() => {
      const list = data.accounts
      const rollups = rollup ? computeRollups(list) : {}
      return list.map(a => [
        a.number,
        a.name,
        a.type,
        a.detailType || '',
        a.parentNumber || '',
        a.id,
        (a.active !== false ? 'Yes' : 'No'),
        (a.reconcilable ? 'Yes' : 'No'),
        (a.openingBalanceDate || ''),
        formatCurrency(Number(rollup ? (rollups as any)[a.id] ?? Number(a.balance || 0) : Number(a.balance || 0)), baseCurrency)
      ])
    })()
  ]
  const csv = rows.map(r => r.map(x => typeof x === 'string' && x.includes(',') ? `"${x}"` : String(x)).join(',')).join('\n')
  const filename = buildCsvFilename('accounts', { asOfIso })
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}
