'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  RefreshCw, Link2, Upload, Settings2, Search,
  ChevronRight, X, Plus, Minus,
  AlertCircle, CheckCircle2, Loader2, User, Building2, Briefcase,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

// ─── COA + Contact types ─────────────────────────────────────────────────────

interface CoaAccount {
  id: string
  code: string
  name: string
  category?: string
}

interface EntityOption {
  id: string
  name: string
  entityType: 'Customer' | 'Vendor' | 'Employee'
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  accountName: string
  accountType: string
  currentBalance?: number
}

interface BankTransaction {
  id: string
  date: string
  description: string
  payee?: string
  category?: string
  amount: number
  type: 'credit' | 'debit'
  status: 'new' | 'matched' | 'rule' | 'pending'
  matchedEntryId?: string
  ruleId?: string
  ruleName?: string
  memo?: string
  tags?: string[]
}

interface SplitLine {
  category: string
  amount: string
  payee: string
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, ruleName }: { status: BankTransaction['status']; ruleName?: string }) {
  if (status === 'matched') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Match</span>
  if (status === 'rule')    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 gap-1"><Settings2 size={10} />{ruleName ?? 'Rule'}</span>
  if (status === 'pending') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">New</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ForReviewPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  // Accounts
  const [accounts, setAccounts]       = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  // Transactions
  const [items, setItems]             = useState<BankTransaction[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Filters
  const [search, setSearch]           = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [amtFrom, setAmtFrom]         = useState('')
  const [amtTo, setAmtTo]             = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Selection
  const [selected, setSelected]       = useState<Set<string>>(new Set())

  // Detail panel
  const [activeRow, setActiveRow]     = useState<BankTransaction | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editPayee, setEditPayee]     = useState('')
  const [editMemo, setEditMemo]       = useState('')
  const [editTags, setEditTags]       = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Find Match modal
  const [matchOpen, setMatchOpen]     = useState(false)
  const [matchDateFrom, setMatchDateFrom] = useState('')
  const [matchDateTo, setMatchDateTo] = useState('')
  const [matchAmtExact, setMatchAmtExact] = useState('')
  const [matchType, setMatchType]     = useState('All')
  const [matchSearch, setMatchSearch] = useState('')
  const [matchResults, setMatchResults] = useState<any[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  // COA accounts and entity options
  const [coaAccounts, setCoaAccounts] = useState<CoaAccount[]>([])
  const [entities, setEntities]       = useState<EntityOption[]>([])
  const [coaSearch, setCoaSearch]     = useState('')
  const [entitySearch, setEntitySearch] = useState('')
  const [coaOpen, setCoaOpen]         = useState(false)
  const [entityOpen, setEntityOpen]   = useState(false)
  const coaRef = useRef<HTMLDivElement>(null)
  const entityRef = useRef<HTMLDivElement>(null)

  // Detail panel selected account/entity
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [selectedEntityId, setSelectedEntityId]   = useState<string>('')

  // Batch categorize modal
  const [batchModalOpen, setBatchModalOpen]   = useState(false)
  const [batchAccountId, setBatchAccountId]   = useState('')
  const [batchEntityId, setBatchEntityId]     = useState('')
  const [batchCoaSearch, setBatchCoaSearch]   = useState('')
  const [batchEntitySearch, setBatchEntitySearch] = useState('')
  const [batchCoaOpen, setBatchCoaOpen]       = useState(false)
  const [batchEntityOpen, setBatchEntityOpen] = useState(false)
  const [batchLoading, setBatchLoading]       = useState(false)
  const [batchError, setBatchError]           = useState<string | null>(null)
  const batchCoaRef    = useRef<HTMLDivElement>(null)
  const batchEntityRef = useRef<HTMLDivElement>(null)

  // Split modal
  const [splitOpen, setSplitOpen]     = useState(false)
  const [splitLines, setSplitLines]   = useState<SplitLine[]>([
    { category: '', amount: '', payee: '' },
    { category: '', amount: '', payee: '' },
  ])
  const [splitError, setSplitError]   = useState<string | null>(null)
  const [splitLoading, setSplitLoading] = useState(false)

  // Pagination
  const [page, setPage]               = useState(1)
  const PAGE_SIZE = 25

  // ─── Load COA accounts ──────────────────────────────────────────────────────

  const loadCoa = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await apiClient.get(`/companies/${companyId}/accounts`)
      const list: any[] = res.data?.accounts ?? res.data ?? []
      setCoaAccounts(list.map((a: any) => ({
        id: a.id,
        code: a.code ?? '',
        name: a.name ?? '',
        category: a.type?.category ?? a.category ?? '',
      })))
    } catch { /* non-fatal */ }
  }, [companyId])

  // ─── Load entities (customers, vendors, employees) ───────────────────────────

  const loadEntities = useCallback(async () => {
    if (!companyId) return
    try {
      const [custRes, vendorRes, empRes] = await Promise.allSettled([
        apiClient.get(`/companies/${companyId}/customers`),
        apiClient.get(`/companies/${companyId}/vendors`),
        apiClient.get(`/companies/${companyId}/employees`),
      ])
      const opts: EntityOption[] = []
      if (custRes.status === 'fulfilled') {
        const list: any[] = custRes.value.data?.customers ?? custRes.value.data ?? []
        list.forEach((c: any) => opts.push({ id: c.contactId ?? c.id, name: c.contact?.displayName ?? c.name ?? c.displayName ?? 'Unknown', entityType: 'Customer' }))
      }
      if (vendorRes.status === 'fulfilled') {
        const list: any[] = vendorRes.value.data?.vendors ?? vendorRes.value.data ?? []
        list.forEach((v: any) => opts.push({ id: v.contactId ?? v.id, name: v.contact?.displayName ?? v.name ?? v.displayName ?? 'Unknown', entityType: 'Vendor' }))
      }
      if (empRes.status === 'fulfilled') {
        const list: any[] = empRes.value.data?.employees ?? empRes.value.data ?? []
        list.forEach((e: any) => opts.push({ id: e.id, name: e.name ?? e.fullName ?? 'Unknown', entityType: 'Employee' }))
      }
      setEntities(opts)
    } catch { /* non-fatal */ }
  }, [companyId])

  // ─── Load accounts ──────────────────────────────────────────────────────────

  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await apiClient.get(`/companies/${companyId}/banking/accounts`)
      setAccounts(res.data ?? [])
    } catch {
      // non-fatal — account selector shows "All Accounts" fallback
    }
  }, [companyId])

  // ─── Load transactions ──────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const accountId = selectedAccount !== 'all' ? selectedAccount : undefined
      const endpoint = accountId
        ? `/companies/${companyId}/banking/accounts/${accountId}/transactions`
        : `/companies/${companyId}/banking/accounts`

      if (!accountId) {
        // When "all accounts" is selected, load transactions from each account
        const acctRes = await apiClient.get(`/companies/${companyId}/banking/accounts`)
        const accts: BankAccount[] = acctRes.data ?? []
        if (accts.length === 0) { setItems(MOCK_TRANSACTIONS); return }

        const allTxns: BankTransaction[] = []
        for (const acct of accts.slice(0, 5)) { // cap at 5 to avoid too many requests
          try {
            const txnRes = await apiClient.get(`/companies/${companyId}/banking/accounts/${acct.id}/transactions`, {
              params: { tab: 'for-review', page: 1, pageSize: 50 },
            })
            const data: any[] = txnRes.data?.transactions ?? txnRes.data ?? []
            allTxns.push(...data)
          } catch { /* skip unavailable accounts */ }
        }
        setItems(allTxns.length > 0 ? allTxns : MOCK_TRANSACTIONS)
      } else {
        const res = await apiClient.get(`/companies/${companyId}/banking/accounts/${accountId}/transactions`, {
          params: { tab: 'for-review', page: 1, pageSize: 200 },
        })
        const data = res.data?.transactions ?? res.data ?? []
        setItems(Array.isArray(data) && data.length > 0 ? data : MOCK_TRANSACTIONS)
      }
    } catch {
      setItems(MOCK_TRANSACTIONS)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedAccount])

  useEffect(() => { if (companyId) { loadAccounts(); fetchTransactions(); loadCoa(); loadEntities() } }, [companyId, fetchTransactions, loadAccounts, loadCoa, loadEntities])

  // Open detail panel
  const openRow = (tx: BankTransaction) => {
    setActiveRow(tx)
    setEditCategory(tx.category ?? '')
    setSelectedAccountId('')
    setEditPayee(tx.payee ?? '')
    setSelectedEntityId('')
    setEditMemo(tx.memo ?? '')
    setEditTags((tx.tags ?? []).join(', '))
    setActionError(null)
    setCoaOpen(false)
    setEntityOpen(false)
  }

  // ─── Filter + pagination ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.payee ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q)
      )
    }
    if (dateFrom) list = list.filter(t => t.date >= dateFrom)
    if (dateTo)   list = list.filter(t => t.date <= dateTo)
    if (amtFrom)  list = list.filter(t => Math.abs(t.amount) >= parseFloat(amtFrom))
    if (amtTo)    list = list.filter(t => Math.abs(t.amount) <= parseFloat(amtTo))
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter.toLowerCase())
    return list
  }, [items, search, dateFrom, dateTo, amtFrom, amtTo, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary
  const forReviewCount   = items.length
  const pendingAmount    = items.reduce((s, t) => s + Math.abs(t.amount), 0)
  const matchCount       = items.filter(t => t.status === 'matched').length
  const ruleCount        = items.filter(t => t.status === 'rule').length

  // ─── Row selection ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const toggleAll = () => setSelected(prev =>
    prev.size === paged.length ? new Set() : new Set(paged.map(t => t.id))
  )

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const accountForActive = selectedAccount !== 'all' ? selectedAccount : accounts[0]?.id

  async function addTransaction() {
    if (!activeRow || !accountForActive) return
    setActionLoading(true); setActionError(null)
    try {
      await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${activeRow.id}`, {
        status: 'categorized',
        accountId: selectedAccountId || undefined,
        category: editCategory || undefined,
        contactId: selectedEntityId || undefined,
        memo: editMemo || undefined,
        transactionType: 'Bank Transaction',
        tags: editTags.split(',').map(s => s.trim()).filter(Boolean),
      })
      setItems(prev => prev.filter(t => t.id !== activeRow.id))
      setActiveRow(null)
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? 'Failed to add transaction.')
    } finally { setActionLoading(false) }
  }

  async function excludeTransaction() {
    if (!activeRow || !accountForActive) return
    setActionLoading(true); setActionError(null)
    try {
      await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${activeRow.id}`, {
        status: 'excluded',
      })
      setItems(prev => prev.filter(t => t.id !== activeRow.id))
      setActiveRow(null)
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? 'Failed to exclude transaction.')
    } finally { setActionLoading(false) }
  }

  async function batchExclude() {
    if (!accountForActive || selected.size === 0) return
    setLoading(true)
    try {
      await Promise.all([...selected].map(id =>
        apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${id}`, { status: 'excluded' })
      ))
      setItems(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set())
    } catch { setError('Batch exclude partially failed. Please refresh.') }
    finally { setLoading(false) }
  }

  async function batchCategorize() {
    if (selected.size === 0) return
    setBatchAccountId('')
    setBatchEntityId('')
    setBatchCoaSearch('')
    setBatchEntitySearch('')
    setBatchError(null)
    setBatchModalOpen(true)
  }

  async function submitBatchCategorize() {
    if (!batchAccountId || !accountForActive) return
    setBatchLoading(true); setBatchError(null)
    const coaAcct = coaAccounts.find(a => a.id === batchAccountId)
    const entity  = entities.find(e => e.id === batchEntityId)
    try {
      await apiClient.post(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/batch-categorize`, {
        transactionIds: [...selected],
        accountId: batchAccountId,
        contactId: batchEntityId || undefined,
        category: coaAcct ? `${coaAcct.code} ${coaAcct.name}` : undefined,
        transactionType: 'Bank Transaction',
      })
      setItems(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set())
      setBatchModalOpen(false)
    } catch (e: any) {
      setBatchError(e?.response?.data?.message ?? 'Batch categorize failed. Please try again.')
    } finally { setBatchLoading(false) }
  }

  // Find Match
  async function searchMatches() {
    if (!activeRow || !companyId) return
    setMatchLoading(true)
    try {
      const res = await apiClient.get(`/companies/${companyId}/ar/invoices`, {
        params: { search: matchSearch || undefined, dateFrom: matchDateFrom || undefined, dateTo: matchDateTo || undefined, status: 'open' },
      })
      setMatchResults(res.data?.invoices ?? res.data ?? [])
    } catch { setMatchResults([]) }
    finally { setMatchLoading(false) }
  }

  async function confirmMatch() {
    if (!activeRow || !selectedMatch || !accountForActive) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${activeRow.id}`, {
        status: 'matched', matchedEntryId: selectedMatch,
      })
      setItems(prev => prev.filter(t => t.id !== activeRow.id))
      setActiveRow(null); setMatchOpen(false); setSelectedMatch(null)
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? 'Failed to match.')
    } finally { setActionLoading(false) }
  }

  // Split
  const splitTotal = splitLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const splitValid = activeRow && Math.abs(splitTotal - Math.abs(activeRow.amount)) < 0.01

  async function saveSplit() {
    if (!activeRow || !splitValid || !accountForActive) return
    setSplitLoading(true); setSplitError(null)
    try {
      await apiClient.post(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${activeRow.id}/split`,
        splitLines.map(l => ({ category: l.category, amount: parseFloat(l.amount), payee: l.payee }))
      )
      setItems(prev => prev.filter(t => t.id !== activeRow.id))
      setActiveRow(null); setSplitOpen(false)
    } catch (e: any) {
      setSplitError(e?.response?.data?.message ?? 'Split failed.')
    } finally { setSplitLoading(false) }
  }

  // ─── Dismissable error ───────────────────────────────────────────────────────

  if (cidLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bank Transactions</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} transactions to review</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Account selector */}
            <select
              value={selectedAccount}
              onChange={e => { setSelectedAccount(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-w-[180px]"
              aria-label="Select bank account"
            >
              <option value="all">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
            </select>

            <button
              onClick={fetchTransactions}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} /> Update
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              <Link2 size={14} /> Link Account
            </button>
            <a href="/banking-cash/bank-rules/csv-upload" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              <Upload size={14} /> Upload CSV
            </a>
            <a href="/banking-cash/bank-rules/rules" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100">
              <Settings2 size={14} /> Manage Rules
            </a>
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-500">For Review</p>
            <p className="text-xl font-bold text-slate-800">{forReviewCount}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-600/80">Amount Pending</p>
            <p className="text-xl font-bold text-amber-900">{formatCurrency(pendingAmount, currency)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <p className="text-xs text-emerald-600/80">Matches Found</p>
            <p className="text-xl font-bold text-emerald-900">{matchCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-600/80">Rules Applied</p>
            <p className="text-xl font-bold text-blue-900">{ruleCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex flex-wrap gap-2 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search description, payee…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} aria-label="From date" className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value); setPage(1) }}   aria-label="To date"   className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="number" min="0" step="0.01" value={amtFrom} onChange={e => { setAmtFrom(e.target.value); setPage(1) }} placeholder="Min amt" aria-label="Min amount" className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="number" min="0" step="0.01" value={amtTo}   onChange={e => { setAmtTo(e.target.value); setPage(1) }}   placeholder="Max amt" aria-label="Max amount" className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>All</option>
            <option value="New">New</option>
            <option value="Matched">Matched</option>
            <option value="Rule Applied">Rule Applied</option>
            <option value="Pending">Pending</option>
          </select>
          {(search || dateFrom || dateTo || amtFrom || amtTo || statusFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setAmtFrom(''); setAmtTo(''); setStatusFilter('All'); setPage(1) }}
              className="px-3 py-2 text-sm text-slate-500 hover:text-rose-600">Clear</button>
          )}
        </div>

        {/* Batch actions */}
        {selected.size > 0 && (
          <div className="px-6 pb-3 flex items-center gap-3">
            <span className="text-sm text-slate-600">{selected.size} selected</span>
            <button onClick={batchCategorize} className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Batch Categorize</button>
            <button onClick={batchExclude}    className="px-3 py-1.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Batch Exclude</button>
            <button onClick={() => setSelected(new Set())} className="px-2 py-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-6 mt-4 flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Transaction Table ── */}
        <div className={`flex-1 overflow-auto px-6 py-5 ${activeRow ? 'hidden md:block' : ''}`}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  </th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Payee</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
                    <p className="text-slate-400 text-sm">Loading transactions…</p>
                  </td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center">
                    <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={32} />
                    <p className="font-medium text-slate-600">All caught up!</p>
                    <p className="text-sm text-slate-400">No transactions to review.</p>
                  </td></tr>
                ) : paged.map(tx => (
                  <tr
                    key={tx.id}
                    onClick={() => openRow(tx)}
                    className={`border-t border-slate-100 hover:bg-emerald-50/40 cursor-pointer transition-colors ${activeRow?.id === tx.id ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(tx.id) }}>
                      <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">{tx.payee ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">{tx.category ?? <span className="text-slate-300 italic">Uncategorized</span>}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {tx.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(tx.amount), currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={tx.status} ruleName={tx.ruleName} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">←</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">→</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {activeRow && (
          <div className="w-full md:w-[380px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm truncate max-w-[260px]">{activeRow.description}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activeRow.date} · {activeRow.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(activeRow.amount), currency)}</p>
              </div>
              <button onClick={() => setActiveRow(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
            </div>

            <div className="px-5 py-4 flex-1 space-y-4">
              {/* Account (COA) — searchable dropdown */}
              <div ref={coaRef} className="relative">
                <label className="block text-xs font-medium text-slate-500 mb-1">Account (Category)</label>
                <button
                  type="button"
                  onClick={() => { setCoaOpen(o => !o); setEntityOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between"
                >
                  <span className={selectedAccountId ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedAccountId
                      ? (() => { const a = coaAccounts.find(x => x.id === selectedAccountId); return a ? `${a.code} ${a.name}` : editCategory || 'Select account…' })()
                      : editCategory || 'Select account…'}
                  </span>
                  <ChevronRight size={12} className={`text-slate-400 transition-transform ${coaOpen ? 'rotate-90' : ''}`} />
                </button>
                {coaOpen && (
                  <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 flex flex-col">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        value={coaSearch}
                        onChange={e => setCoaSearch(e.target.value)}
                        placeholder="Search accounts…"
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {coaAccounts
                        .filter(a => !coaSearch || `${a.code} ${a.name}`.toLowerCase().includes(coaSearch.toLowerCase()))
                        .map(a => (
                          <button key={a.id} type="button"
                            onClick={() => { setSelectedAccountId(a.id); setEditCategory(`${a.code} ${a.name}`); setCoaOpen(false); setCoaSearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${selectedAccountId === a.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                          >
                            <span className="font-mono text-xs text-slate-400 mr-2">{a.code}</span>{a.name}
                            {a.category && <span className="ml-1 text-[11px] text-slate-400">({a.category})</span>}
                          </button>
                        ))}
                      {coaAccounts.filter(a => !coaSearch || `${a.code} ${a.name}`.toLowerCase().includes(coaSearch.toLowerCase())).length === 0 && (
                        <p className="px-3 py-4 text-xs text-slate-400 text-center">No accounts match</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Name (entity) — searchable dropdown */}
              <div ref={entityRef} className="relative">
                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                <button
                  type="button"
                  onClick={() => { setEntityOpen(o => !o); setCoaOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between"
                >
                  <span className={selectedEntityId ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedEntityId
                      ? (() => { const e = entities.find(x => x.id === selectedEntityId); return e ? e.name : editPayee || 'Select entity…' })()
                      : editPayee || 'Select entity…'}
                  </span>
                  <ChevronRight size={12} className={`text-slate-400 transition-transform ${entityOpen ? 'rotate-90' : ''}`} />
                </button>
                {entityOpen && (
                  <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 flex flex-col">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        value={entitySearch}
                        onChange={e => setEntitySearch(e.target.value)}
                        placeholder="Search customers, vendors…"
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {entities
                        .filter(e => !entitySearch || e.name.toLowerCase().includes(entitySearch.toLowerCase()))
                        .map(e => (
                          <button key={e.id} type="button"
                            onClick={() => { setSelectedEntityId(e.id); setEditPayee(e.name); setEntityOpen(false); setEntitySearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${selectedEntityId === e.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'} flex items-center gap-2`}
                          >
                            {e.entityType === 'Customer' && <User size={12} className="text-emerald-500 shrink-0" />}
                            {e.entityType === 'Vendor' && <Building2 size={12} className="text-blue-500 shrink-0" />}
                            {e.entityType === 'Employee' && <Briefcase size={12} className="text-purple-500 shrink-0" />}
                            <span>{e.name}</span>
                            <span className="ml-auto text-[11px] text-slate-400">{e.entityType}</span>
                          </button>
                        ))}
                      {entities.filter(e => !entitySearch || e.name.toLowerCase().includes(entitySearch.toLowerCase())).length === 0 && (
                        <p className="px-3 py-4 text-xs text-slate-400 text-center">No entities match</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Memo</label>
                <textarea rows={2} value={editMemo} onChange={e => setEditMemo(e.target.value)} placeholder="Optional note…"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tags (comma-separated)</label>
                <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="tag1, tag2"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {actionError && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />{actionError}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 py-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={addTransaction} disabled={actionLoading}
                  className="px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60 flex items-center justify-center gap-1">
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
                </button>
                <button onClick={() => { setMatchOpen(true); searchMatches() }}
                  className="px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1">
                  <Search size={14} /> Find Match
                </button>
                <button onClick={() => setSplitOpen(true)}
                  className="px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1">
                  <ChevronRight size={14} /> Split
                </button>
                <button onClick={excludeTransaction} disabled={actionLoading}
                  className="px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 flex items-center justify-center gap-1">
                  <Minus size={14} /> Exclude
                </button>
              </div>
              <button
                onClick={() => { /* future: create rule from transaction */ setActionError('Create Rule: use Manage Rules to set up a bank rule based on this transaction.') }}
                className="w-full px-3 py-2 text-sm font-medium text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1">
                <Settings2 size={14} /> Create Rule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Find Match Modal ── */}
      {matchOpen && activeRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Find Match</h2>
                <p className="text-xs text-slate-500 mt-0.5">Bank amount: <span className="font-semibold">{formatCurrency(Math.abs(activeRow.amount), currency)}</span></p>
              </div>
              <button onClick={() => { setMatchOpen(false); setSelectedMatch(null) }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-2">
              <input value={matchSearch} onChange={e => setMatchSearch(e.target.value)} placeholder="Search customer, invoice#…"
                className="flex-1 min-w-[160px] px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="date" value={matchDateFrom} onChange={e => setMatchDateFrom(e.target.value)} aria-label="Match from date" className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="date" value={matchDateTo}   onChange={e => setMatchDateTo(e.target.value)}   aria-label="Match to date"   className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input value={matchAmtExact} onChange={e => setMatchAmtExact(e.target.value)} placeholder="Exact amount" type="number" step="0.01"
                className="w-28 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select value={matchType} onChange={e => setMatchType(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>All</option>
                <option>Invoices</option>
                <option>Bills</option>
                <option>Payments</option>
                <option>Transfers</option>
              </select>
              <button onClick={searchMatches} className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Search</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {matchLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>
              ) : matchResults.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-12">No matches found. Try adjusting your filters.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-2 w-8" />
                    <th className="px-4 py-2 text-left">Ref</th>
                    <th className="px-4 py-2 text-left">Customer / Vendor</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr></thead>
                  <tbody>
                    {matchResults.map((r: any) => (
                      <tr key={r.id} onClick={() => setSelectedMatch(r.id)}
                        className={`border-t border-slate-100 cursor-pointer ${selectedMatch === r.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-2 text-center">
                          <input type="radio" checked={selectedMatch === r.id} onChange={() => setSelectedMatch(r.id)} className="text-emerald-600 focus:ring-emerald-500" />
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-900">{r.invoiceNumber ?? r.billNumber ?? r.reference ?? r.id}</td>
                        <td className="px-4 py-2 text-slate-600">{r.customerName ?? r.vendorName ?? '—'}</td>
                        <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{r.date ?? r.invoiceDate ?? r.dueDate ?? '—'}</td>
                        <td className="px-4 py-2 text-right font-semibold tabular-nums">{formatCurrency(r.totalAmount ?? r.amount ?? 0, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {selectedMatch && (
              <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-emerald-50">
                <p className="text-xs text-emerald-700 font-medium">
                  Selected total vs bank: <span className="tabular-nums">{formatCurrency(Math.abs(activeRow.amount), currency)}</span>
                </p>
                <button onClick={confirmMatch} disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {actionLoading ? 'Matching…' : 'Match'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Batch Categorize Modal ── */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Batch Categorize</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selected.size} transaction{selected.size !== 1 ? 's' : ''} selected</p>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            {/* COA Account */}
            <div className="px-5 pt-4 pb-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Account (Category) <span className="text-rose-400">*</span></label>
              <div ref={batchCoaRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setBatchCoaOpen(o => !o); setBatchEntityOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between"
                >
                  <span className={batchAccountId ? 'text-slate-900' : 'text-slate-400'}>
                    {batchAccountId
                      ? (() => { const a = coaAccounts.find(x => x.id === batchAccountId); return a ? `${a.code} ${a.name}` : 'Select account…' })()
                      : 'Select account…'}
                  </span>
                  <ChevronRight size={12} className={`text-slate-400 transition-transform ${batchCoaOpen ? 'rotate-90' : ''}`} />
                </button>
                {batchCoaOpen && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 flex flex-col">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        value={batchCoaSearch}
                        onChange={e => setBatchCoaSearch(e.target.value)}
                        placeholder="Search accounts…"
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {coaAccounts
                        .filter(a => !batchCoaSearch || `${a.code} ${a.name}`.toLowerCase().includes(batchCoaSearch.toLowerCase()))
                        .map(a => (
                          <button key={a.id} type="button"
                            onClick={() => { setBatchAccountId(a.id); setBatchCoaOpen(false); setBatchCoaSearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${batchAccountId === a.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                          >
                            <span className="font-mono text-xs text-slate-400 mr-2">{a.code}</span>{a.name}
                            {a.category && <span className="ml-1 text-[11px] text-slate-400">({a.category})</span>}
                          </button>
                        ))}
                      {coaAccounts.filter(a => !batchCoaSearch || `${a.code} ${a.name}`.toLowerCase().includes(batchCoaSearch.toLowerCase())).length === 0 && (
                        <p className="px-3 py-4 text-xs text-slate-400 text-center">No accounts match</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Name (entity) */}
            <div className="px-5 pb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Name <span className="text-slate-400">(optional)</span></label>
              <div ref={batchEntityRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setBatchEntityOpen(o => !o); setBatchCoaOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between"
                >
                  <span className={batchEntityId ? 'text-slate-900' : 'text-slate-400'}>
                    {batchEntityId
                      ? (() => { const e = entities.find(x => x.id === batchEntityId); return e ? e.name : 'Select entity…' })()
                      : 'Select entity…'}
                  </span>
                  <ChevronRight size={12} className={`text-slate-400 transition-transform ${batchEntityOpen ? 'rotate-90' : ''}`} />
                </button>
                {batchEntityOpen && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 flex flex-col">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        value={batchEntitySearch}
                        onChange={e => setBatchEntitySearch(e.target.value)}
                        placeholder="Search customers, vendors…"
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {entities
                        .filter(e => !batchEntitySearch || e.name.toLowerCase().includes(batchEntitySearch.toLowerCase()))
                        .map(e => (
                          <button key={e.id} type="button"
                            onClick={() => { setBatchEntityId(e.id); setBatchEntityOpen(false); setBatchEntitySearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${batchEntityId === e.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'} flex items-center gap-2`}
                          >
                            {e.entityType === 'Customer' && <User size={12} className="text-emerald-500 shrink-0" />}
                            {e.entityType === 'Vendor' && <Building2 size={12} className="text-blue-500 shrink-0" />}
                            {e.entityType === 'Employee' && <Briefcase size={12} className="text-purple-500 shrink-0" />}
                            <span>{e.name}</span>
                            <span className="ml-auto text-[11px] text-slate-400">{e.entityType}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview table */}
            <div className="px-5 pb-2 border-t border-slate-100 flex-1 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 mt-3 mb-2">Preview</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-1.5 pr-3 font-medium">Description</th>
                    <th className="pb-1.5 pr-3 font-medium">Date</th>
                    <th className="pb-1.5 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter(t => selected.has(t.id)).map(t => (
                    <tr key={t.id} className="border-b border-slate-50">
                      <td className="py-1.5 pr-3 text-slate-700 truncate max-w-[220px]">{t.description}</td>
                      <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                      <td className={`py-1.5 text-right font-semibold tabular-nums ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {t.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(t.amount), currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {batchError && <p className="px-5 py-2 text-xs text-rose-500">{batchError}</p>}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setBatchModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100">Cancel</button>
              <button
                onClick={submitBatchCategorize}
                disabled={!batchAccountId || batchLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
              >
                {batchLoading ? 'Categorizing…' : `Categorize ${selected.size} transaction${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Split Modal ── */}
      {splitOpen && activeRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Split Transaction</h2>
                <p className="text-xs text-slate-500 mt-0.5">Total: {formatCurrency(Math.abs(activeRow.amount), currency)}</p>
              </div>
              <button onClick={() => setSplitOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
              {splitLines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_120px_28px] gap-2 items-center">
                  <input value={line.category} onChange={e => setSplitLines(prev => prev.map((l, j) => j === i ? { ...l, category: e.target.value } : l))}
                    placeholder="Category" className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="number" step="0.01" min="0" value={line.amount} onChange={e => setSplitLines(prev => prev.map((l, j) => j === i ? { ...l, amount: e.target.value } : l))}
                    placeholder="Amount" className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input value={line.payee} onChange={e => setSplitLines(prev => prev.map((l, j) => j === i ? { ...l, payee: e.target.value } : l))}
                    placeholder="Payee" className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button onClick={() => setSplitLines(prev => prev.length > 2 ? prev.filter((_, j) => j !== i) : prev)} className="text-slate-300 hover:text-rose-500"><Minus size={14} /></button>
                </div>
              ))}
              <button onClick={() => setSplitLines(prev => [...prev, { category: '', amount: '', payee: '' }])}
                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                <Plus size={14} /> Add Split Line
              </button>

              <div className={`flex justify-between text-sm font-medium pt-1 border-t border-slate-100 ${splitValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                <span>Split total</span>
                <span className="tabular-nums">{formatCurrency(splitTotal, currency)} / {formatCurrency(Math.abs(activeRow.amount), currency)}</span>
              </div>
              {!splitValid && splitTotal > 0 && (
                <p className="text-xs text-rose-500">Split lines must sum to {formatCurrency(Math.abs(activeRow.amount), currency)}.</p>
              )}
              {splitError && <p className="text-xs text-rose-500">{splitError}</p>}
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setSplitOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={saveSplit} disabled={!splitValid || splitLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                {splitLoading ? 'Saving…' : 'Save Split'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Mock data (shown when API returns no transactions) ───────────────────────

const MOCK_TRANSACTIONS: BankTransaction[] = [
  { id: 'm1', date: '2026-04-10', description: 'GRAB PHILIPPINES',         payee: 'Grab',          category: '',                 amount: -250,    type: 'debit',  status: 'new' },
  { id: 'm2', date: '2026-04-09', description: 'MERALCO PAYMENT',          payee: 'Meralco',       category: '',                 amount: -3840,   type: 'debit',  status: 'rule', ruleName: 'Utilities' },
  { id: 'm3', date: '2026-04-09', description: 'CUSTOMER PAYMENT INV-0041',payee: 'Acme Corp',     category: 'Accounts Receivable', amount: 15000, type: 'credit', status: 'matched' },
  { id: 'm4', date: '2026-04-08', description: 'OFFICE DEPOT',             payee: 'Office Depot',  category: '',                 amount: -1200,   type: 'debit',  status: 'new' },
  { id: 'm5', date: '2026-04-08', description: 'BDO BANK CHARGE',          payee: 'BDO',           category: '',                 amount: -150,    type: 'debit',  status: 'pending' },
  { id: 'm6', date: '2026-04-07', description: 'SHOPEE VENDOR PAYOUT',     payee: 'Shopee',        category: '',                 amount: 8500,    type: 'credit', status: 'new' },
  { id: 'm7', date: '2026-04-07', description: 'PLDT FIBER MONTHLY',       payee: 'PLDT',          category: '',                 amount: -1899,   type: 'debit',  status: 'rule', ruleName: 'Utilities' },
]
