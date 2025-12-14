import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

type GroupKey = 'invoices' | 'bills' | 'customers' | 'vendors' | 'transactions' | 'accounts'

type ResultItem = {
  id: string
  type: GroupKey
  title: string
  subtitle?: string
  href: string
  meta?: string
}

type Group = { items: ResultItem[]; total: number; hasMore: boolean }

function includes(hay: string | undefined, q: string) {
  if (!hay) return false
  return hay.toLowerCase().includes(q)
}

export async function GET(req: Request) {
  try {
    if (!db.seeded) { try { seedIfNeeded() } catch {} }
    const url = new URL(req.url)
    const qRaw = (url.searchParams.get('q') || '').trim()
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(25, limitParam ? Number(limitParam) || 5 : 5))
    const q = qRaw.toLowerCase()

    // If no query or very short, return empty to avoid noise
    if (!q || q.length < 2) {
      const empty: Record<GroupKey, Group> = {
        invoices: { items: [], total: 0, hasMore: false },
        bills: { items: [], total: 0, hasMore: false },
        customers: { items: [], total: 0, hasMore: false },
        vendors: { items: [], total: 0, hasMore: false },
        transactions: { items: [], total: 0, hasMore: false },
        accounts: { items: [], total: 0, hasMore: false },
      }
      return NextResponse.json({ query: qRaw, groups: empty })
    }

    const role = getRoleFromCookies()

    const groups: Record<GroupKey, Group> = {
      invoices: { items: [], total: 0, hasMore: false },
      bills: { items: [], total: 0, hasMore: false },
      customers: { items: [], total: 0, hasMore: false },
      vendors: { items: [], total: 0, hasMore: false },
      transactions: { items: [], total: 0, hasMore: false },
      accounts: { items: [], total: 0, hasMore: false },
    }
  const baseCurrency: string = (db.settings?.baseCurrency as string) || 'USD'

    // Invoices
    if (hasPermission(role, 'invoices:read')) {
      const matches = db.invoices.filter(inv =>
        includes(inv.number, q) || includes(db.customers.find(c => c.id === inv.customerId)?.name, q)
      )
      groups.invoices.total = matches.length
      groups.invoices.items = matches.slice(0, limit).map(inv => ({
        id: inv.id,
        type: 'invoices',
        title: `${inv.number} · ${db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId}`,
        subtitle: `${inv.status.toUpperCase()} · ${inv.date.slice(0,10)}`,
        href: `/invoices/${inv.id}?from=%2Fsearch`,
        meta: formatCurrency(Number(inv.total || 0), baseCurrency)
      }))
      groups.invoices.hasMore = matches.length > groups.invoices.items.length
    }

    // Bills
    if (hasPermission(role, 'bills:read')) {
      const matches = db.bills.filter(b =>
        includes(b.number, q) || includes(db.vendors.find(v => v.id === b.vendorId)?.name, q)
      )
      groups.bills.total = matches.length
      groups.bills.items = matches.slice(0, limit).map(b => ({
        id: b.id,
        type: 'bills',
        title: `${b.number} · ${db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId}`,
        subtitle: `${b.status.toUpperCase()} · due ${b.dueDate.slice(0,10)}`,
        href: `/bills/${b.id}?from=%2Fsearch`,
        meta: formatCurrency(Number(b.total || 0), baseCurrency)
      }))
      groups.bills.hasMore = matches.length > groups.bills.items.length
    }

    // Customers
    if (hasPermission(role, 'customers:read')) {
      const matches = db.customers.filter(c => includes(c.name, q))
      groups.customers.total = matches.length
      groups.customers.items = matches.slice(0, limit).map(c => ({
        id: c.id,
        type: 'customers',
        title: c.name,
        href: `/customers/${c.id}?from=%2Fsearch`
      }))
      groups.customers.hasMore = matches.length > groups.customers.items.length
    }

    // Vendors
    if (hasPermission(role, 'vendors:read')) {
      const matches = db.vendors.filter(v => includes(v.name, q))
      groups.vendors.total = matches.length
      groups.vendors.items = matches.slice(0, limit).map(v => ({
        id: v.id,
        type: 'vendors',
        title: v.name,
        href: `/vendors/${v.id}?from=%2Fsearch`
      }))
      groups.vendors.hasMore = matches.length > groups.vendors.items.length
    }

    // Transactions (bank feed)
    if (hasPermission(role, 'journal:read')) {
      const matches = db.transactions.filter(t => includes(t.description, q))
      groups.transactions.total = matches.length
      groups.transactions.items = matches.slice(0, limit).map(t => ({
        id: t.id,
        type: 'transactions',
        title: t.description,
        subtitle: t.date.slice(0,10),
        href: `/bank-transactions?from=%2Fsearch`,
        meta: formatCurrency(Number(t.amount || 0), baseCurrency)
      }))
      groups.transactions.hasMore = matches.length > groups.transactions.items.length
    }

    // Accounts (chart of accounts)
    if (hasPermission(role, 'journal:read')) {
      const matches = db.accounts.filter(a => includes(a.number, q) || includes(a.name, q))
      groups.accounts.total = matches.length
      groups.accounts.items = matches.slice(0, limit).map(a => ({
        id: a.id,
        type: 'accounts',
        title: `${a.number} · ${a.name}`,
        subtitle: a.type,
        href: `/reports/account-ledger?account=${encodeURIComponent(a.number)}&from=%2Fsearch`
      }))
      groups.accounts.hasMore = matches.length > groups.accounts.items.length
    }

    return NextResponse.json({ query: qRaw, groups })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Search failed') }, { status: 500 })
  }
}
