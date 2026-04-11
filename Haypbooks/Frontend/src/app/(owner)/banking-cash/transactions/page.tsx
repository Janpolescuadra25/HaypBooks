'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, Briefcase, Building2, Check, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, FileUp, GitMerge, Link2, Loader2, RefreshCw,
  RotateCcw, Scissors, Search, Sparkles, User, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import {
  MOCK_COA_ACCOUNTS,
  MOCK_ENTITIES,
  MOCK_TRANSACTIONS,
  mockJEs,
  mockStore,
  categorizeTransaction  as glCategorize,
  excludeTransaction     as glExclude,
  undoCategorize         as glUndo,
  applyRules             as glApplyRules,
  matchTransaction       as glMatch,
  detectAutoMatches,
  findHistoryMatch,
  addToHistory,
  type MockBankTransaction,
  type MockSplitLine,
  type MatchSuggestion,
} from './mockGLState'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  name: string
  accountNumber?: string
  balance?: number
}

interface BankTransaction {
  id: string
  date: string
  description: string
  contactId?: string
  contactName?: string
  accountId?: string
  accountName?: string
  amount: number
  status: string
  transactionType?: string
  journalEntryId?: string
  journalEntryRef?: string
  bankRef?: string
  memo?: string
  createdAt?: string
  ruleName?: string
  splitLines?: MockSplitLine[]
}

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

type StatusFilter = 'review' | 'categorized' | 'excluded'
type SortKey      = 'date' | 'description' | 'name' | 'account' | 'withdrawal' | 'deposit'
type SortDir      = 'asc' | 'desc'

// ─── Module-level helpers ─────────────────────────────────────────────────────

function normaliseStatus(s?: string): string {
  if (!s) return 'PENDING'
  const u = s.toUpperCase()
  if (u === 'CATEGORIZED' || u === 'CATEGORISED') return 'CATEGORIZED'
  if (u === 'MATCHED')  return 'MATCHED'
  if (u === 'EXCLUDED') return 'EXCLUDED'
  return 'PENDING'
}

function fmtDate(d: string) {
  if (!d) return '—'
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return d }
}

const STATUS_BORDER: Record<string, string> = {
  PENDING:     'border-l-4 border-amber-400',
  CATEGORIZED: 'border-l-4 border-emerald-400',
  MATCHED:     'border-l-4 border-blue-400',
  EXCLUDED:    'border-l-4 border-slate-300',
}

const PAGE_SIZE = 25

const DEFAULT_COL_W: Record<string, number> = {
  checkbox: 40, date: 110, description: 260, name: 150,
  account: 180, withdrawal: 120, deposit: 120, actions: 100,
}

// ─── Mock fallback — convert from mockGLState types ───────────────────────────

function mockTxToBankTx(m: MockBankTransaction): BankTransaction {
  return {
    id:              m.id,
    date:            m.date,
    description:     m.description,
    contactId:       m.contactId,
    contactName:     m.contactName,
    accountId:       m.accountId,
    accountName:     m.accountName,
    amount:          m.amount,
    status:          m.status,
    transactionType: m.transactionType,
    journalEntryId:  m.journalEntryId,
    memo:            m.memo,
    ruleName:        m.ruleName,
    splitLines:      m.splitLines,
  }
}

// Seed mockStore if not already set (idempotent across hot-reloads)
if (mockStore.items.length === 0) {
  mockStore.items = [...MOCK_TRANSACTIONS]
}

// ─── SkeletonRows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100">
          <td className="px-3 py-3 border-r border-slate-100 w-10"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-48 bg-slate-200 rounded" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-28 bg-slate-200 rounded" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-32 bg-slate-200 rounded" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-20 bg-slate-200 rounded ml-auto" /></td>
          <td className="px-3 py-3 border-r border-slate-100"><div className="h-3.5 w-20 bg-slate-200 rounded ml-auto" /></td>
          <td className="px-3 py-3"><div className="h-6 w-14 bg-slate-200 rounded" /></td>
        </tr>
      ))}
    </>
  )
}

// ─── EntityIcon ───────────────────────────────────────────────────────────────

function EntityIcon({ type }: { type: string }) {
  if (type === 'Customer') return <User size={11} className="text-emerald-500 shrink-0" />
  if (type === 'Vendor')   return <Building2 size={11} className="text-blue-500 shrink-0" />
  return <Briefcase size={11} className="text-purple-500 shrink-0" />
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ col, sk, sd }: { col: SortKey; sk: SortKey; sd: SortDir }) {
  if (sk !== col) return <ChevronDown size={12} className="inline ml-0.5 text-slate-300" />
  return sd === 'asc'
    ? <ChevronUp   size={12} className="inline ml-0.5 text-slate-700" />
    : <ChevronDown size={12} className="inline ml-0.5 text-slate-700" />
}

// ─── CoaDropdown (module-level) ───────────────────────────────────────────────

function CoaDropdown({
  open, onToggle, searchVal, onSearch, value, onChange, accounts, topClose,
  dropRef,
}: {
  open: boolean
  onToggle: () => void
  searchVal: string
  onSearch: (v: string) => void
  value: string
  onChange: (id: string) => void
  accounts: CoaAccount[]
  topClose?: () => void
  dropRef: React.RefObject<HTMLDivElement>
}) {
  const sel = accounts.find(a => a.id === value)
  const visible = accounts.filter(
    a => !searchVal || `${a.code} ${a.name}`.toLowerCase().includes(searchVal.toLowerCase()),
  )
  return (
    <div ref={dropRef} className="relative">
      <button
        type="button"
        onClick={() => { onToggle(); topClose?.() }}
        className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {sel ? `${sel.code} ${sel.name}` : 'Select account…'}
        </span>
        <ChevronDown size={12} className="text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={searchVal}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search accounts…"
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {visible.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => { onChange(a.id); onSearch('') }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${value === a.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
              >
                <span className="font-mono text-xs text-slate-400 mr-2">{a.code}</span>{a.name}
                {a.category && <span className="ml-1 text-[11px] text-slate-400">({a.category})</span>}
              </button>
            ))}
            {visible.length === 0 && <p className="px-3 py-4 text-xs text-slate-400 text-center">No accounts match</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EntityDropdown (module-level) ────────────────────────────────────────────

function EntityDropdown({
  open, onToggle, searchVal, onSearch, value, onChange, options, topClose, dropRef,
}: {
  open: boolean
  onToggle: () => void
  searchVal: string
  onSearch: (v: string) => void
  value: string
  onChange: (id: string) => void
  options: EntityOption[]
  topClose?: () => void
  dropRef: React.RefObject<HTMLDivElement>
}) {
  const sel = options.find(e => e.id === value)
  const visible = options.filter(
    e => !searchVal || e.name.toLowerCase().includes(searchVal.toLowerCase()),
  )
  return (
    <div ref={dropRef} className="relative">
      <button
        type="button"
        onClick={() => { onToggle(); topClose?.() }}
        className="w-full text-left px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {sel ? sel.name : 'Select entity…'}
        </span>
        <ChevronDown size={12} className="text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={searchVal}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search customers, vendors…"
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {visible.map(e => (
              <button
                key={e.id}
                type="button"
                onClick={() => { onChange(e.id); onSearch('') }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${value === e.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'} flex items-center gap-2`}
              >
                <EntityIcon type={e.entityType} />
                <span>{e.name}</span>
                <span className="ml-auto text-[11px] text-slate-400">{e.entityType}</span>
              </button>
            ))}
            {visible.length === 0 && <p className="px-3 py-4 text-xs text-slate-400 text-center">No entities match</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BankFeedPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt    = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtAmt = useCallback((n: number) => {
    const abs = formatCurrency(Math.abs(n), currency)
    return n < 0 ? `-${abs}` : `+${abs}`
  }, [currency])

  // ── Accounts ───────────────────────────────────────────────────────────────
  const [accounts,     setAccounts]     = useState<BankAccount[]>([])
  const [selectedAcct, setSelectedAcct] = useState<string>('')

  // ── Transactions ───────────────────────────────────────────────────────────
  const [items,     setItems]     = useState<BankTransaction[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  // ── Filter / sort ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('review')
  const [search,    setSearch]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [minAmt,    setMinAmt]    = useState('')
  const [maxAmt,    setMaxAmt]    = useState('')
  const [sortKey,   setSortKey]   = useState<SortKey>('date')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')
  const [page,      setPage]      = useState(1)
  const [matchFilter, setMatchFilter] = useState<'all' | 'has-suggestion' | 'no-suggestion' | 'matched'>('all')
  const [typeFilter,  setTypeFilter]  = useState<'all' | 'withdrawal' | 'deposit'>('all')

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ── Expandable row ─────────────────────────────────────────────────────────
  const [expandedId,      setExpandedId]      = useState<string | null>(null)
  const [editMode,        setEditMode]        = useState(false)
  const [inlineCoa,       setInlineCoa]       = useState('')
  const [inlineEnt,       setInlineEnt]       = useState('')
  const [inlineMemo,      setInlineMemo]      = useState('')
  const [inlineCoaSearch, setInlineCoaSearch] = useState('')
  const [inlineEntSearch, setInlineEntSearch] = useState('')
  const [inlineCoaOpen,   setInlineCoaOpen]   = useState(false)
  const [inlineEntOpen,   setInlineEntOpen]   = useState(false)
  const [inlineSaving,    setInlineSaving]    = useState(false)
  const [quickMatchConfirm, setQuickMatchConfirm] = useState<{ txId: string; jeId: string; matchType: 'Bank Payment' | 'Bank Receipt'; jeRef: string; jeAmount: number } | null>(null)
  const inlineCoaRef = useRef<HTMLDivElement>(null)
  const inlineEntRef = useRef<HTMLDivElement>(null)

  // ── Router ──────────────────────────────────────────────────────────────────
  const router = useRouter()

  // ── Auto-match suggestions ─────────────────────────────────────────────────
  const [matchSuggestions, setMatchSuggestions] = useState<Record<string, number>>({})

  // ── Batch modal ────────────────────────────────────────────────────────────
  const [batchOpen,      setBatchOpen]      = useState(false)
  const [batchCoa,       setBatchCoa]       = useState('')
  const [batchEnt,       setBatchEnt]       = useState('')
  const [batchCoaSearch, setBatchCoaSearch] = useState('')
  const [batchEntSearch, setBatchEntSearch] = useState('')
  const [batchCoaOpen,   setBatchCoaOpen]   = useState(false)
  const [batchEntOpen,   setBatchEntOpen]   = useState(false)
  const [batchLoading,   setBatchLoading]   = useState(false)
  const [batchError,     setBatchError]     = useState('')
  const batchCoaRef = useRef<HTMLDivElement>(null)
  const batchEntRef = useRef<HTMLDivElement>(null)

  // ── COA & entities ─────────────────────────────────────────────────────────
  const [coa,      setCoa]      = useState<CoaAccount[]>(() =>
    MOCK_COA_ACCOUNTS.map(a => ({ id: a.id, code: a.code, name: a.name, category: a.type })),
  )
  const [entities, setEntities] = useState<EntityOption[]>(() =>
    MOCK_ENTITIES.map(e => ({ id: e.id, name: e.name, entityType: e.type })),
  )

  // ── Column widths ──────────────────────────────────────────────────────────
  const [colW, setColW] = useState<Record<string, number>>(DEFAULT_COL_W)
  const resizingRef = useRef<{ key: string; startX: number; startW: number } | null>(null)

  // ── CSV file input ref ─────────────────────────────────────────────────────
  const csvRef = useRef<HTMLInputElement>(null)

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState('')
  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3500)
  }, [])

  // ── Link Account modal ─────────────────────────────────────────────────────
  const [linkAcctOpen, setLinkAcctOpen] = useState(false)

  // ── Apply Rules ────────────────────────────────────────────────────────────
  const [applyRulesLoading, setApplyRulesLoading] = useState(false)

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const r = await apiClient.get(`/companies/${companyId}/banking/accounts`)
      const list: BankAccount[] = Array.isArray(r.data) ? r.data : r.data?.accounts ?? []
      setAccounts(list)
      if (list.length > 0) setSelectedAcct(prev => prev || list[0].id)
    } catch { /* non-fatal */ }
  }, [companyId])

  const loadTransactions = useCallback(async (acctId: string) => {
    if (!companyId || !acctId) return
    setLoading(true); setError(null); setUsingMock(false)
    try {
      const r = await apiClient.get(
        `/companies/${companyId}/banking/accounts/${acctId}/transactions`,
        { params: { pageSize: 500, page: 1 } },
      )
      const raw: any[] = r.data?.transactions ?? r.data ?? []
      const mapped: BankTransaction[] = raw.map(t => ({
        id:              t.id,
        date:            (t.date ?? t.transactionDate ?? t.createdAt ?? '').substring(0, 10),
        description:     t.description ?? t.memo ?? '—',
        contactId:       t.contactId,
        contactName:     t.contactName ?? t.payee,
        accountId:       t.accountId,
        accountName:     t.accountName ?? t.category,
        amount:          t.amount ?? 0,
        status:          normaliseStatus(t.status),
        transactionType: t.transactionType,
        journalEntryId:  t.journalEntryId,
        memo:            t.memo,
        bankRef:         t.bankRef,
        createdAt:       t.createdAt,
      }))
      if (mapped.length > 0) { setItems(mapped) }
      else { setItems(mockStore.items.map(mockTxToBankTx)); setUsingMock(true) }
    } catch {
      // Fall back to live mock state (which may have been mutated by interactions)
      setItems(mockStore.items.map(mockTxToBankTx)); setUsingMock(true)
    } finally { setLoading(false) }
  }, [companyId])

  const loadCoa = useCallback(async () => {
    if (!companyId) return
    try {
      const r = await apiClient.get(`/companies/${companyId}/accounts`)
      const fetched = (Array.isArray(r.data) ? r.data : r.data?.accounts ?? []).map((a: any): CoaAccount => ({
        id: a.id, code: a.code ?? '', name: a.name, category: a.category ?? a.accountType,
      }))
      if (fetched.length > 0) setCoa(fetched)
      // else keep the mock COA that was set as initial state
    } catch { /* keep mock COA */ }
  }, [companyId])

  const loadEntities = useCallback(async () => {
    if (!companyId) return
    try {
      const [c, v, e] = await Promise.allSettled([
        apiClient.get(`/companies/${companyId}/customers`),
        apiClient.get(`/companies/${companyId}/vendors`),
        apiClient.get(`/companies/${companyId}/employees`),
      ])
      const out: EntityOption[] = []
      if (c.status === 'fulfilled') {
        const rows: any[] = Array.isArray(c.value.data) ? c.value.data : c.value.data?.customers ?? []
        rows.forEach(r => out.push({ id: r.id, name: r.displayName ?? r.name ?? r.companyName ?? r.id, entityType: 'Customer' }))
      }
      if (v.status === 'fulfilled') {
        const rows: any[] = Array.isArray(v.value.data) ? v.value.data : v.value.data?.vendors ?? []
        rows.forEach(r => out.push({ id: r.id, name: r.displayName ?? r.name ?? r.companyName ?? r.id, entityType: 'Vendor' }))
      }
      if (e.status === 'fulfilled') {
        const rows: any[] = Array.isArray(e.value.data) ? e.value.data : e.value.data?.employees ?? []
        rows.forEach(r => out.push({ id: r.id, name: r.displayName ?? r.name ?? (`${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || r.id), entityType: 'Employee' }))
      }
      if (out.length > 0) setEntities(out)
      // else keep mock entities that were set as initial state
    } catch { /* keep mock entities */ }
  }, [companyId])

  // Initialize items immediately from mock (don't wait for API)
  useEffect(() => {
    if (!loading && items.length === 0) {
      setItems(mockStore.items.map(mockTxToBankTx))
      setUsingMock(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute auto-match suggestions whenever items change
  useEffect(() => {
    const suggestions = detectAutoMatches()
    const counts: Record<string, number> = {}
    for (const [txId, matches] of Object.entries(suggestions)) {
      counts[txId] = matches.length
    }
    setMatchSuggestions(counts)
  }, [items])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (companyId) { loadAccounts(); loadCoa(); loadEntities() } }, [companyId])

  useEffect(() => {
    if (selectedAcct) { setPage(1); setSelected(new Set()); loadTransactions(selectedAcct) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAcct])

  // ─── Column resize ─────────────────────────────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizingRef.current; if (!r) return
      const min = DEFAULT_COL_W[r.key] ?? 60
      setColW(prev => ({ ...prev, [r.key]: Math.max(min, r.startW + e.clientX - r.startX) }))
    }
    const onUp = () => { resizingRef.current = null; document.body.style.cursor = '' }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [])

  const startResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault(); e.stopPropagation()
    resizingRef.current = { key, startX: e.clientX, startW: colW[key] ?? DEFAULT_COL_W[key] ?? 100 }
    document.body.style.cursor = 'col-resize'
  }

  // ─── Click-outside for dropdowns ──────────────────────────────────────────

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node
      if (inlineCoaRef.current && !inlineCoaRef.current.contains(t)) setInlineCoaOpen(false)
      if (inlineEntRef.current && !inlineEntRef.current.contains(t))  setInlineEntOpen(false)
      if (batchCoaRef.current  && !batchCoaRef.current.contains(t))   setBatchCoaOpen(false)
      if (batchEntRef.current  && !batchEntRef.current.contains(t))   setBatchEntOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ─── Derived / filtered ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter === 'review')      list = list.filter(t => t.status === 'PENDING')
    else if (statusFilter === 'categorized') list = list.filter(t => t.status === 'CATEGORIZED' || t.status === 'MATCHED')
    else if (statusFilter === 'excluded')    list = list.filter(t => t.status === 'EXCLUDED')

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.contactName ?? '').toLowerCase().includes(q) ||
        (t.accountName ?? '').toLowerCase().includes(q),
      )
    }
    if (dateFrom) list = list.filter(t => t.date >= dateFrom)
    if (dateTo)   list = list.filter(t => t.date <= dateTo)
    if (minAmt)   list = list.filter(t => Math.abs(t.amount) >= parseFloat(minAmt))
    if (maxAmt)   list = list.filter(t => Math.abs(t.amount) <= parseFloat(maxAmt))

    if (matchFilter === 'has-suggestion')  list = list.filter(t => (matchSuggestions[t.id] ?? 0) > 0)
    if (matchFilter === 'no-suggestion')   list = list.filter(t => (matchSuggestions[t.id] ?? 0) === 0 && t.status === 'PENDING')
    if (matchFilter === 'matched')         list = list.filter(t => t.status === 'MATCHED')
    if (typeFilter === 'withdrawal')       list = list.filter(t => t.amount < 0)
    if (typeFilter === 'deposit')          list = list.filter(t => t.amount > 0)

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date')         cmp = a.date.localeCompare(b.date)
      else if (sortKey === 'description') cmp = a.description.localeCompare(b.description)
      else if (sortKey === 'name')    cmp = (a.contactName ?? '').localeCompare(b.contactName ?? '')
      else if (sortKey === 'account') cmp = (a.accountName ?? '').localeCompare(b.accountName ?? '')
      else if (sortKey === 'withdrawal' || sortKey === 'deposit') cmp = a.amount - b.amount
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, statusFilter, search, dateFrom, dateTo, minAmt, maxAmt, matchFilter, typeFilter, matchSuggestions, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ─── Balance calcs ─────────────────────────────────────────────────────────
  const totalWithdrawals = items.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalDeposits    = items.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const netAmount        = totalDeposits - totalWithdrawals
  const booksTotal       = items
    .filter(t => t.status === 'CATEGORIZED' || t.status === 'MATCHED')
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const diffAmt          = (totalWithdrawals + totalDeposits) - booksTotal

  // ─── Status counts ─────────────────────────────────────────────────────────
  const nReview      = items.filter(t => t.status === 'PENDING').length
  const nCategorized = items.filter(t => t.status === 'CATEGORIZED' || t.status === 'MATCHED').length
  const nExcluded    = items.filter(t => t.status === 'EXCLUDED').length

  // ─── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  // ─── Selection ─────────────────────────────────────────────────────────────
  const allPageSelected = pageRows.length > 0 && pageRows.every(t => selected.has(t.id))
  const toggleAll = () => {
    setSelected(prev => {
      const n = new Set(prev)
      if (allPageSelected) pageRows.forEach(t => n.delete(t.id))
      else pageRows.forEach(t => n.add(t.id))
      return n
    })
  }
  const toggleRow = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ─── Toggle expand (all statuses) ────────────────────────────────────────
  const toggleExpand = (id: string, tx: BankTransaction) => {
    if (expandedId === id) {
      setExpandedId(null); setEditMode(false)
    } else {
      setExpandedId(id); setEditMode(false)
      // Pre-fill from existing categorization, or from history if PENDING
      let coaId  = tx.accountId ?? ''
      let entId  = tx.contactId ?? ''
      if (!coaId && tx.status === 'PENDING') {
        const hist = findHistoryMatch(tx.description)
        if (hist) {
          coaId = hist.accountId
          entId = hist.contactId ?? ''
        }
      }
      setInlineCoa(coaId)
      setInlineEnt(entId)
      setInlineMemo(tx.memo ?? '')
      setInlineCoaSearch(''); setInlineEntSearch('')
      setInlineCoaOpen(false); setInlineEntOpen(false)
      setQuickMatchConfirm(null)
    }
  }

  const saveInline = async () => {
    if (!expandedId) return
    setInlineSaving(true)
    const tx = items.find(t => t.id === expandedId)
    if (!tx) { setInlineSaving(false); return }

    // Update mock state
    const mockTx = mockStore.items.find(m => m.id === expandedId)
    if (mockTx) {
      const coaAcct = coa.find(c => c.id === inlineCoa)
      const entOpt  = entities.find(e => e.id === inlineEnt)
      const updated = glCategorize(mockTx, inlineCoa, coaAcct?.name ?? '', inlineEnt || undefined, entOpt?.name, inlineMemo || undefined)
      mockStore.items = mockStore.items.map(m => m.id === expandedId ? updated : m)
      // Record in categorization history
      if (inlineCoa) {
        addToHistory(
          mockTx.description,
          inlineCoa,
          coaAcct?.name ?? '',
          coaAcct?.code ?? '',
          inlineEnt || null,
          entOpt?.name ?? null,
        )
      }
    }

    // Try real API
    try {
      if (companyId) {
        await apiClient.patch(
          `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${expandedId}`,
          { status: 'CATEGORIZED', accountId: inlineCoa || undefined, contactId: inlineEnt || undefined, memo: inlineMemo || undefined, transactionType: 'Bank Transaction' },
        )
      }
    } catch { /* ignore for mock mode */ }

    setItems(prev => prev.map(t => t.id !== expandedId ? t : {
      ...t, status: 'CATEGORIZED',
      transactionType: t.amount < 0 ? 'Bank Payment' : 'Bank Receipt',
      accountId:   inlineCoa || t.accountId,
      accountName: coa.find(c => c.id === inlineCoa)?.name ?? t.accountName,
      contactId:   inlineEnt || t.contactId,
      contactName: entities.find(e => e.id === inlineEnt)?.name ?? t.contactName,
      memo:        inlineMemo || t.memo,
    }))
    setExpandedId(null); setEditMode(false)
    showToast('Transaction categorized')
    setInlineSaving(false)
  }

  // ─── Undo ─────────────────────────────────────────────────────────────────
  const undoTransaction = async (tx: BankTransaction) => {
    // Update mock state
    const mockTx = mockStore.items.find(m => m.id === tx.id)
    if (mockTx) {
      const updated = glUndo(mockTx)
      mockStore.items = mockStore.items.map(m => m.id === tx.id ? updated : m)
    }
    // Try real API
    try {
      if (companyId) {
        await apiClient.patch(
          `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${tx.id}`,
          { status: 'PENDING' },
        )
      }
    } catch { /* ignore for mock mode */ }

    const typeLabel =
      tx.transactionType === 'Bank Payment'       ? 'Bank Payment' :
      tx.transactionType === 'Bank Receipt'        ? 'Bank Receipt' :
      tx.transactionType === 'Split Transaction'   ? 'Split' :
      tx.status === 'MATCHED'                      ? 'Match' : 'Categorize'

    setItems(prev => prev.map(t => t.id === tx.id ? {
      ...t, status: 'PENDING', transactionType: undefined, journalEntryId: undefined,
      accountId: undefined, accountName: undefined, contactId: undefined, contactName: undefined,
      memo: undefined, ruleName: undefined, splitLines: undefined,
    } : t))
    setExpandedId(null); setEditMode(false)
    showToast(`${typeLabel} undone — moved back to For Review`)
  }

  // ─── Quick Match (inline) ─────────────────────────────────────────────────
  const handleQuickMatch = (tx: BankTransaction, jeId: string, matchType: 'Bank Payment' | 'Bank Receipt', jeRef: string) => {
    const mockTx = mockStore.items.find(m => m.id === tx.id)
    if (!mockTx) return
    const updated = glMatch(mockTx, jeId, matchType)
    mockStore.items = mockStore.items.map(m => m.id === tx.id ? updated : m)
    setItems(prev => prev.map(t => t.id === tx.id
      ? { ...t, status: 'MATCHED', transactionType: matchType, journalEntryId: jeId,
          accountName: updated.accountName, contactName: updated.contactName }
      : t))
    setExpandedId(null); setEditMode(false)
    setQuickMatchConfirm(null)
    showToast(`Matched to ${jeRef}`)
  }

  // ─── Smart Match Action ────────────────────────────────────────────────────
  // Called from the [Match (N)] button in the Actions column.
  // 1 suggestion → match immediately; 2+ suggestions → expand + scroll to match cards.
  const smartMatchAction = useCallback((tx: BankTransaction) => {
    const count = matchSuggestions[tx.id] ?? 0
    if (count === 0) {
      toggleExpand(tx.id, tx)
      return
    }
    if (count === 1) {
      // Exactly 1 match — do it right away (no expand needed)
      const scanned = detectAutoMatches([mockStore.items.find(m => m.id === tx.id)!].filter(Boolean))
      const matches = scanned[tx.id] ?? []
      if (matches.length === 1) {
        const { je } = matches[0]
        const mType: 'Bank Payment' | 'Bank Receipt' = tx.amount < 0 ? 'Bank Payment' : 'Bank Receipt'
        const jeRef = je.referenceNo ?? je.id.slice(0, 8)
        if (Math.abs(tx.amount) > 50000) {
          // Large amount — expand so user can confirm via card UI
          toggleExpand(tx.id, tx)
          setTimeout(() => {
            document.getElementById(`match-cards-${tx.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 120)
        } else {
          handleQuickMatch(tx, je.id, mType, jeRef)
        }
        return
      }
    }
    // 2+ matches — expand row and scroll to match cards
    toggleExpand(tx.id, tx)
    setTimeout(() => {
      document.getElementById(`match-cards-${tx.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 120)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchSuggestions])

  // ─── Exclude ─────────────────────────────────────────────────────────────
  const excludeRows = async (ids: string[]) => {
    // Update mock state
    ids.forEach(id => {
      const mockTx = mockStore.items.find(m => m.id === id)
      if (mockTx) {
        const updated = glExclude(mockTx)
        mockStore.items = mockStore.items.map(m => m.id === id ? updated : m)
      }
    })
    // Try real API
    try {
      if (companyId) {
        await Promise.all(ids.map(id =>
          apiClient.patch(`/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${id}`, { status: 'EXCLUDED' }),
        ))
      }
    } catch { /* ignore for mock mode */ }

    setItems(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'EXCLUDED' } : t))
    setSelected(new Set())
    showToast(`${ids.length} transaction${ids.length !== 1 ? 's' : ''} excluded`)
  }

  // ─── Batch categorize ─────────────────────────────────────────────────────
  const openBatch = () => {
    setBatchCoa(''); setBatchEnt(''); setBatchCoaSearch(''); setBatchEntSearch('')
    setBatchCoaOpen(false); setBatchEntOpen(false); setBatchError('')
    setBatchOpen(true)
  }

  const submitBatch = async () => {
    if (!batchCoa) return
    const count = selected.size
    setBatchLoading(true); setBatchError('')
    const coaAcct = coa.find(a => a.id === batchCoa)
    const entOpt  = entities.find(e => e.id === batchEnt)

    // Update mock state for each selected pending tx
    selected.forEach(id => {
      const mockTx = mockStore.items.find(m => m.id === id)
      if (mockTx && mockTx.status === 'PENDING') {
        const updated = glCategorize(mockTx, batchCoa, coaAcct?.name ?? '', batchEnt || undefined, entOpt?.name)
        mockStore.items = mockStore.items.map(m => m.id === id ? updated : m)
      }
    })

    // Try real API
    try {
      if (companyId) {
        await apiClient.post(
          `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/batch-categorize`,
          {
            transactionIds: [...selected],
            accountId: batchCoa,
            contactId: batchEnt || undefined,
            category: coaAcct ? `${coaAcct.code} ${coaAcct.name}` : undefined,
            transactionType: 'Bank Transaction',
          },
        )
      }
    } catch { /* ignore for mock mode */ }

    setItems(prev => prev.map(t => !selected.has(t.id) ? t : {
      ...t, status: 'CATEGORIZED',
      transactionType: t.amount < 0 ? 'Bank Payment' : 'Bank Receipt',
      accountId:   batchCoa,
      accountName: coaAcct?.name,
      contactId:   batchEnt || t.contactId,
      contactName: entOpt?.name ?? t.contactName,
    }))
    setSelected(new Set()); setBatchOpen(false)
    showToast(`${count} transaction${count !== 1 ? 's' : ''} categorized`)
    setBatchLoading(false)
  }

  // ─── Misc ─────────────────────────────────────────────────────────────────
  const hasFilters = !!(search || dateFrom || dateTo || minAmt || maxAmt || matchFilter !== 'all' || typeFilter !== 'all')
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setMinAmt(''); setMaxAmt(''); setMatchFilter('all'); setTypeFilter('all') }
  const acctObj = accounts.find(a => a.id === selectedAcct)

  // ─── Apply Rules ──────────────────────────────────────────────────────────
  const handleApplyRules = async () => {
    setApplyRulesLoading(true)
    const updated = glApplyRules(mockStore.items)
    let count = 0
    updated.forEach(u => {
      mockStore.items = mockStore.items.map(m => m.id === u.id ? u : m)
      count++
    })
    setItems(mockStore.items.map(mockTxToBankTx))
    setApplyRulesLoading(false)
    showToast(count > 0 ? `${count} rule${count !== 1 ? 's' : ''} applied` : 'No matching rules found')
  }

  const thClass = 'relative px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide bg-slate-50 border-r border-slate-200 select-none overflow-hidden'
  const tdClass = 'px-3 py-3 text-sm text-slate-700 border-r border-slate-200 overflow-hidden'

  function ResizeHandle({ col }: { col: string }) {
    return (
      <div
        className="absolute top-0 right-0 h-full w-1.5 hover:bg-emerald-400/40 transition-colors"
        style={{ cursor: 'col-resize' }}
        onMouseDown={e => startResize(e, col)}
      />
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (cidLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  const totalMinW = Object.values(colW).reduce((s, v) => s + v, 0)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── A. Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <h2 className="text-lg font-semibold text-slate-800 whitespace-nowrap">Bank transactions</h2>
          <select
            value={selectedAcct}
            onChange={e => setSelectedAcct(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 max-w-[260px] truncate"
          >
            {accounts.length === 0 && <option value="">— No accounts —</option>}
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}{a.accountNumber ? ` •••• ${a.accountNumber.slice(-4)}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input ref={csvRef} type="file" accept=".csv" className="hidden"
            onChange={() => showToast('CSV upload coming soon')} />
          <button
            onClick={() => setLinkAcctOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Link2 size={14} /> Link Account
          </button>
          <button
            onClick={handleApplyRules}
            disabled={applyRulesLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-emerald-500 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            {applyRulesLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Apply Rules
          </button>
          <button
            onClick={() => csvRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileUp size={14} /> Upload CSV
          </button>
          <button
            onClick={() => selectedAcct && loadTransactions(selectedAcct)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Update
          </button>
        </div>
      </div>

      {/* ── B. Balance summary line ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-6 py-2 text-sm text-slate-500 flex items-center gap-3 flex-wrap">
        <span>Withdrawals: <span className="font-semibold text-red-600">{fmt(totalWithdrawals)}</span></span>
        <span className="text-slate-300">·</span>
        <span>Deposits: <span className="font-semibold text-emerald-700">{fmt(totalDeposits)}</span></span>
        <span className="text-slate-300">·</span>
        <span>Net: <span className={`font-semibold ${netAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(netAmount)}</span></span>
        <span className="text-slate-300">·</span>
        <span>In Books: <span className="font-medium text-slate-700">{fmt(booksTotal)}</span></span>
        <span className="text-slate-300">·</span>
        <span>
          Diff:{' '}
          <span className={`font-semibold ${diffAmt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {fmt(diffAmt)}
          </span>
          {diffAmt > 0 && <span className="ml-1 text-xs text-slate-400">({nReview} uncategorized)</span>}
        </span>
        {usingMock && (
          <span className="ml-2 text-xs text-amber-500 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded">
            Sample data
          </span>
        )}
      </div>

      {/* ── C. Filter bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        {/* Auto-match summary */}
        {Object.keys(matchSuggestions).length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            💡 {Object.keys(matchSuggestions).length} transaction{Object.keys(matchSuggestions).length !== 1 ? 's have' : ' has'} suggested matches
          </div>
        )}
        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { key: 'review',      label: 'For Review',   count: nReview },
              { key: 'categorized', label: 'Categorized',  count: nCategorized },
              { key: 'excluded',    label: 'Excluded',     count: nExcluded },
            ] as const
          ).map(f => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1) }}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === f.key
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-600 border-emerald-500 hover:bg-emerald-50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Match filter */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium w-14 shrink-0">Match:</span>
          {(
            [
              { key: 'all',            label: 'All' },
              { key: 'has-suggestion', label: 'Has Suggestion' },
              { key: 'no-suggestion',  label: 'No Suggestion' },
              { key: 'matched',        label: 'Matched' },
            ] as const
          ).map(f => (
            <button
              key={f.key}
              onClick={() => { setMatchFilter(f.key); setPage(1) }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                matchFilter === f.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-400 hover:bg-blue-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium w-14 shrink-0">Type:</span>
          {(
            [
              { key: 'all',        label: 'All' },
              { key: 'withdrawal', label: 'Withdrawal' },
              { key: 'deposit',    label: 'Deposit' },
            ] as const
          ).map(f => (
            <button
              key={f.key}
              onClick={() => { setTypeFilter(f.key); setPage(1) }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === f.key
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-600 border-slate-400 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search + date + amount */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search description, name…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
            />
          </div>
          <input type="date" aria-label="Date from" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <span className="text-slate-400 text-xs">→</span>
          <input type="date" aria-label="Date to" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <input type="number" placeholder="Min ₱" value={minAmt}
            onChange={e => { setMinAmt(e.target.value); setPage(1) }}
            className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <span className="text-slate-400 text-xs">→</span>
          <input type="number" placeholder="Max ₱" value={maxAmt}
            onChange={e => { setMaxAmt(e.target.value); setPage(1) }}
            className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <span className="ml-auto text-xs text-slate-400">{filtered.length} records</span>
        </div>
      </div>

      {/* ── D. Batch action bar ───────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="sticky top-[45px] z-30 bg-white border-b border-slate-200 shadow-sm px-6 py-2.5 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{selected.size} selected</span>
          <button
            onClick={openBatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Batch Categorize <ChevronDown size={12} />
          </button>
          <button
            onClick={() => excludeRows([...selected])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Batch Exclude
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">

        {/* Error banner */}
        {error && !loading && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => selectedAcct && loadTransactions(selectedAcct)} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ── E. Table ─────────────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table
              className="w-full text-left border-collapse"
              style={{ tableLayout: 'fixed', minWidth: totalMinW }}
            >
              <thead>
                <tr className="border-b-2 border-slate-200">
                  {/* Checkbox */}
                  <th className={thClass} style={{ width: colW.checkbox }}>
                    <div className="flex items-center justify-center">
                      <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    </div>
                    <ResizeHandle col="checkbox" />
                  </th>
                  {/* Date */}
                  <th className={`${thClass} cursor-pointer`} style={{ width: colW.date }}
                      onClick={() => handleSort('date')}>
                    Date <SortIcon col="date" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="date" />
                  </th>
                  {/* Description */}
                  <th className={`${thClass} cursor-pointer`} style={{ width: colW.description }}
                      onClick={() => handleSort('description')}>
                    Description <SortIcon col="description" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="description" />
                  </th>
                  {/* Name */}
                  <th className={`${thClass} cursor-pointer`} style={{ width: colW.name }}
                      onClick={() => handleSort('name')}>
                    Name <SortIcon col="name" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="name" />
                  </th>
                  {/* Account */}
                  <th className={`${thClass} cursor-pointer`} style={{ width: colW.account }}
                      onClick={() => handleSort('account')}>
                    Account <SortIcon col="account" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="account" />
                  </th>
                  {/* Withdrawal */}
                  <th className={`${thClass} text-right cursor-pointer`} style={{ width: colW.withdrawal }}
                      onClick={() => handleSort('withdrawal')}>
                    Withdrawal <SortIcon col="withdrawal" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="withdrawal" />
                  </th>
                  {/* Deposit */}
                  <th className={`${thClass} text-right cursor-pointer`} style={{ width: colW.deposit }}
                      onClick={() => handleSort('deposit')}>
                    Deposit <SortIcon col="deposit" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="deposit" />
                  </th>
                  {/* Actions */}
                  <th className={thClass} style={{ width: colW.actions }}>
                    Actions
                    <ResizeHandle col="actions" />
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && <SkeletonRows />}

                {!loading && pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      {hasFilters || statusFilter !== 'review' ? (
                        <div className="text-slate-400 text-sm">
                          <p>No transactions match your filters.</p>
                          <button onClick={clearFilters} className="mt-2 text-xs text-emerald-600 underline">Clear filters</button>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm">
                          <p className="font-medium text-slate-500 mb-1">No transactions found</p>
                          <p className="text-xs">Upload a bank statement CSV to get started.</p>
                          <button onClick={() => csvRef.current?.click()}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50">
                            <FileUp size={14} /> Upload CSV
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {!loading && pageRows.map(tx => (
                  <>
                    <tr
                      key={tx.id}
                      onClick={() => toggleExpand(tx.id, tx)}
                      className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer ${STATUS_BORDER[tx.status] ?? ''} ${selected.has(tx.id) ? 'bg-emerald-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className={`${tdClass} text-center`} style={{ width: colW.checkbox }}
                          onClick={e => { e.stopPropagation(); toggleRow(tx.id) }}>
                        <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleRow(tx.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                      </td>
                      {/* Date */}
                      <td className={tdClass} style={{ width: colW.date }}>
                        <span className="text-slate-600 text-xs whitespace-nowrap">{fmtDate(tx.date)}</span>
                      </td>
                      {/* Description */}
                      <td className={tdClass} style={{ width: colW.description }}>
                        <div className="font-medium text-slate-800 truncate flex items-center gap-1">
                          <span className="truncate">{tx.description}</span>
                          {tx.status === 'PENDING' && (matchSuggestions[tx.id] ?? 0) > 0 && (
                            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                              {matchSuggestions[tx.id]} match{matchSuggestions[tx.id] > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                        {tx.bankRef && <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{tx.bankRef}</div>}
                      </td>
                      {/* Name */}
                      <td className={tdClass} style={{ width: colW.name }}>
                        {tx.contactName
                          ? <span className="truncate block text-slate-700">{tx.contactName}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      {/* Account */}
                      <td className={tdClass} style={{ width: colW.account }}>
                        {tx.accountName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 max-w-full truncate">
                            {tx.accountName}
                          </span>
                        ) : tx.status === 'PENDING' ? (() => {
                          const hist = findHistoryMatch(tx.description)
                          return hist
                            ? <span className="text-slate-400 italic text-xs truncate block" title={`Suggested: ${hist.accountName}`}>{hist.accountName}*</span>
                            : <span className="text-slate-300">—</span>
                        })() : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      {/* Withdrawal */}
                      <td className={`${tdClass} text-right font-mono font-semibold`} style={{ width: colW.withdrawal }}>
                        {tx.amount < 0
                          ? <span className="text-red-600">{fmt(Math.abs(tx.amount))}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      {/* Deposit */}
                      <td className={`${tdClass} text-right font-mono font-semibold`} style={{ width: colW.deposit }}>
                        {tx.amount > 0
                          ? <span className="text-emerald-700">{fmt(tx.amount)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      {/* Actions */}
                      <td className={tdClass} style={{ width: colW.actions }}
                          onClick={e => e.stopPropagation()}>
                        {tx.status === 'PENDING' && (
                          (matchSuggestions[tx.id] ?? 0) > 0 ? (
                            <button
                              onClick={e => { e.stopPropagation(); smartMatchAction(tx) }}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              <GitMerge size={11} /> Match ({matchSuggestions[tx.id]})
                            </button>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); toggleExpand(tx.id, tx) }}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                              Add
                            </button>
                          )
                        )}
                        {tx.status === 'CATEGORIZED' && tx.transactionType === 'Split Transaction' && (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                              <Scissors size={12} className="text-purple-600 shrink-0" />
                              <button
                                onClick={() => undoTransaction(tx)}
                                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                              >
                                <RotateCcw size={11} /> Undo Split
                              </button>
                            </div>
                          </div>
                        )}
                        {tx.status === 'MATCHED' && (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                              <Link2 size={12} className="text-blue-600 shrink-0" />
                              <button
                                onClick={() => undoTransaction(tx)}
                                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                              >
                                <RotateCcw size={11} /> Undo Match
                              </button>
                            </div>
                          </div>
                        )}
                        {tx.status === 'CATEGORIZED' && tx.transactionType !== 'Split Transaction' && (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                              <Check size={12} className="text-emerald-600 shrink-0" />
                              <button
                                onClick={() => undoTransaction(tx)}
                                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                              >
                                <RotateCcw size={11} /> Undo
                              </button>
                            </div>
                          </div>
                        )}
                        {tx.status === 'EXCLUDED' && (
                          <button
                            onClick={() => undoTransaction(tx)}
                            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                          >
                            <RotateCcw size={11} /> Undo
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* ── F. Expandable row form (all statuses) ── */}
                    {expandedId === tx.id && (
                      <tr key={`${tx.id}-inline`} className="border-b border-slate-100">
                        <td colSpan={8} className="px-0 py-0">

                          {/* PENDING */}
                          {tx.status === 'PENDING' && (
                            <div className="px-6 py-4 bg-emerald-50/60 border-l-4 border-emerald-400">
                              {/* ── Suggested match cards ── */}
                              {matchSuggestions[tx.id] > 0 && (() => {
                                const allMatches = (() => {
                                  const result: { je: import('./mockGLState').MatchSuggestion['je']; diff: number; isExact: boolean }[] = []
                                  const scanned = detectAutoMatches([mockStore.items.find(m => m.id === tx.id)!].filter(Boolean))
                                  return scanned[tx.id] ?? []
                                })()
                                return (
                                  <div id={`match-cards-${tx.id}`} className="mb-4">
                                    <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                                      <GitMerge size={12} /> {allMatches.length} suggested match{allMatches.length !== 1 ? 'es' : ''} found
                                    </p>
                                    <div className="space-y-1.5">
                                      {allMatches.map(({ je, isExact }) => {
                                        const matchType: 'Bank Payment' | 'Bank Receipt' = tx.amount < 0 ? 'Bank Payment' : 'Bank Receipt'
                                        const jeRef = je.referenceNo ?? je.id.slice(0, 8)
                                        const isThisConfirming = quickMatchConfirm?.txId === tx.id && quickMatchConfirm?.jeId === je.id
                                        return (
                                          <div key={je.id} className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs" onClick={e => e.stopPropagation()}>
                                            <span className={`px-1.5 py-0.5 rounded font-medium text-[10px] ${je.type === 'Bill' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{je.type}</span>
                                            <span className="font-mono text-slate-500">{jeRef}</span>
                                            {je.contactName && <span className="text-slate-700 truncate max-w-[120px]">{je.contactName}</span>}
                                            <span className={`font-mono font-semibold ${isExact ? 'text-emerald-700' : 'text-amber-600'}`}>{fmtAmt(je.totalAmount)}</span>
                                            {!isExact && <span className="text-amber-500 text-[10px]">≈</span>}
                                            <button
                                              onClick={() => router.push(`/banking-cash/transactions/view-record?type=${je.type === 'Bill' ? 'bill' : 'invoice'}&id=${je.id}&txnId=${tx.id}`)}
                                              className="text-blue-600 hover:underline text-[11px] font-medium"
                                            >
                                              View
                                            </button>
                                            <div className="ml-auto flex items-center gap-1.5">
                                              {isThisConfirming ? (
                                                <>
                                                  <span className="text-amber-700 text-[11px] font-semibold">Confirm match?</span>
                                                  <button onClick={() => handleQuickMatch(tx, je.id, matchType, jeRef)}
                                                    className="px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700">Yes, match</button>
                                                  <button onClick={() => setQuickMatchConfirm(null)}
                                                    className="px-2 py-0.5 border border-slate-300 text-slate-600 rounded text-[11px] hover:bg-slate-50">Cancel</button>
                                                </>
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    if (Math.abs(tx.amount) > 50000) {
                                                      setQuickMatchConfirm({ txId: tx.id, jeId: je.id, matchType, jeRef, jeAmount: je.totalAmount })
                                                    } else {
                                                      handleQuickMatch(tx, je.id, matchType, jeRef)
                                                    }
                                                  }}
                                                  className="px-2.5 py-0.5 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700"
                                                >Match</button>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                    <div className="flex items-center gap-2 my-3">
                                      <div className="flex-1 border-t border-slate-200" />
                                      <span className="text-[11px] text-slate-400">or categorize manually</span>
                                      <div className="flex-1 border-t border-slate-200" />
                                    </div>
                                  </div>
                                )
                              })()}
                              <div className="max-w-2xl space-y-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Categorize: <span className="normal-case font-normal text-slate-700">{tx.description}</span>
                                  <span className={`ml-2 font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtAmt(tx.amount)}</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Account (COA)</label>
                                    <CoaDropdown
                                      open={inlineCoaOpen} onToggle={() => { setInlineCoaOpen(o => !o); setInlineEntOpen(false) }}
                                      searchVal={inlineCoaSearch} onSearch={setInlineCoaSearch}
                                      value={inlineCoa} onChange={setInlineCoa}
                                      accounts={coa} topClose={() => setInlineEntOpen(false)} dropRef={inlineCoaRef}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                                    <EntityDropdown
                                      open={inlineEntOpen} onToggle={() => { setInlineEntOpen(o => !o); setInlineCoaOpen(false) }}
                                      searchVal={inlineEntSearch} onSearch={setInlineEntSearch}
                                      value={inlineEnt} onChange={setInlineEnt}
                                      options={entities} topClose={() => setInlineCoaOpen(false)} dropRef={inlineEntRef}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Memo</label>
                                  <input value={inlineMemo} onChange={e => setInlineMemo(e.target.value)}
                                    placeholder="Optional memo…"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => { setExpandedId(null); setEditMode(false) }}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                  <button onClick={saveInline} disabled={inlineSaving || !inlineCoa}
                                    className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-1.5">
                                    {inlineSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Categorize
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); router.push(`/banking-cash/transactions/match?txnId=${tx.id}`) }}
                                    className="px-3 py-1.5 text-xs font-medium border border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
                                    <GitMerge size={12} /> Find Match…
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); router.push(`/banking-cash/transactions/split?txnId=${tx.id}`) }}
                                    className="px-3 py-1.5 text-xs font-medium border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-1.5">
                                    <Scissors size={12} /> Split
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CATEGORIZED – Split */}
                          {tx.status === 'CATEGORIZED' && tx.transactionType === 'Split Transaction' && tx.splitLines && (
                            <div className="px-6 py-4 bg-slate-50 border-l-4 border-purple-400">
                              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-3">
                                <Scissors size={13} /> Split Transaction · {fmtAmt(tx.amount)}
                              </div>
                              <div className="space-y-1 mb-3 max-w-xl">
                                {tx.splitLines.map((sl, i) => (
                                  <div key={i} className="flex justify-between items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                                    <span className="text-slate-700 font-medium">{sl.accountName}</span>
                                    <span className="font-mono font-semibold text-slate-800">{fmt(sl.amount)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => router.push(`/banking-cash/transactions/split?txnId=${tx.id}`)}
                                  className="px-3 py-1.5 text-xs font-medium border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-1.5">
                                  <Scissors size={12} /> Edit Split
                                </button>
                                <button onClick={() => undoTransaction(tx)}
                                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                                  <RotateCcw size={11} /> Undo Split
                                </button>
                              </div>
                            </div>
                          )}

                          {/* CATEGORIZED – read-only summary */}
                          {tx.status === 'CATEGORIZED' && tx.transactionType !== 'Split Transaction' && !editMode && (
                            <div className="px-6 py-4 bg-slate-50 border-l-4 border-emerald-400">
                              {tx.ruleName && (
                                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                  <Sparkles size={12} /> Auto-categorized by rule: <span className="font-semibold ml-1">{tx.ruleName}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 max-w-2xl">
                                <div><p className="text-slate-400 mb-0.5">Account</p><p className="text-slate-700 font-medium">{tx.accountName ?? '—'}</p></div>
                                <div><p className="text-slate-400 mb-0.5">Name</p><p className="text-slate-700">{tx.contactName ?? '—'}</p></div>
                                <div><p className="text-slate-400 mb-0.5">Type</p><p className="text-slate-700">{tx.transactionType ?? '—'}</p></div>
                                <div><p className="text-slate-400 mb-0.5">Journal Entry</p><p className="text-emerald-700 font-medium font-mono text-[11px]">{tx.journalEntryRef ?? tx.journalEntryId?.slice(0, 8) ?? '—'}</p></div>
                                {tx.memo && <div className="col-span-2 sm:col-span-4"><p className="text-slate-400 mb-0.5">Memo</p><p className="text-slate-600 italic">{tx.memo}</p></div>}
                              </div>
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setEditMode(true)}
                                  className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-white">Edit</button>
                                <button onClick={() => undoTransaction(tx)}
                                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                                  <RotateCcw size={11} /> Undo Categorization
                                </button>
                              </div>
                            </div>
                          )}

                          {/* CATEGORIZED – edit mode */}
                          {tx.status === 'CATEGORIZED' && tx.transactionType !== 'Split Transaction' && editMode && (
                            <div className="px-6 py-4 bg-slate-50 border-l-4 border-emerald-400">
                              <div className="max-w-2xl space-y-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Edit Categorization: <span className="normal-case font-normal text-slate-700">{tx.description}</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Account (COA)</label>
                                    <CoaDropdown
                                      open={inlineCoaOpen} onToggle={() => { setInlineCoaOpen(o => !o); setInlineEntOpen(false) }}
                                      searchVal={inlineCoaSearch} onSearch={setInlineCoaSearch}
                                      value={inlineCoa} onChange={setInlineCoa}
                                      accounts={coa} topClose={() => setInlineEntOpen(false)} dropRef={inlineCoaRef}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                                    <EntityDropdown
                                      open={inlineEntOpen} onToggle={() => { setInlineEntOpen(o => !o); setInlineCoaOpen(false) }}
                                      searchVal={inlineEntSearch} onSearch={setInlineEntSearch}
                                      value={inlineEnt} onChange={setInlineEnt}
                                      options={entities} topClose={() => setInlineCoaOpen(false)} dropRef={inlineEntRef}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Memo</label>
                                  <input value={inlineMemo} onChange={e => setInlineMemo(e.target.value)}
                                    placeholder="Optional memo…"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => setEditMode(false)}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                  <button onClick={saveInline} disabled={inlineSaving || !inlineCoa}
                                    className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-1.5">
                                    {inlineSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save Changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* MATCHED */}
                          {tx.status === 'MATCHED' && (() => {
                            const je = mockJEs.find(j => j.id === tx.journalEntryId)
                            return (
                              <div className="px-6 py-4 bg-blue-50/40 border-l-4 border-blue-500">
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-3">
                                  <GitMerge size={13} /> Matched to {je?.type ?? 'Document'}
                                </div>
                                {je && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 max-w-2xl">
                                    <div><p className="text-slate-400 mb-0.5">Type</p><p className="text-blue-700 font-medium">{je.type}</p></div>
                                    <div><p className="text-slate-400 mb-0.5">Reference</p><p className="text-slate-700 font-mono">{je.referenceNo ?? je.id.slice(0, 8)}</p></div>
                                    <div><p className="text-slate-400 mb-0.5">Date</p><p className="text-slate-700">{fmtDate(je.date)}</p></div>
                                    <div><p className="text-slate-400 mb-0.5">Party</p><p className="text-slate-700">{je.contactName ?? '—'}</p></div>
                                    <div><p className="text-slate-400 mb-0.5">JE Amount</p><p className="text-slate-700 font-mono">{fmt(je.totalAmount)}</p></div>
                                    <div><p className="text-slate-400 mb-0.5">Bank Tx</p><p className="text-slate-700 font-mono">{fmtAmt(tx.amount)}</p></div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  {je && (
                                    <button onClick={() => showToast(`Viewing ${je.type} ${je.referenceNo ?? je.id.slice(0, 8)}`)}
                                      className="px-3 py-1.5 text-xs font-medium border border-blue-400 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1.5">
                                      <GitMerge size={12} /> View {je.type}
                                    </button>
                                  )}
                                  <button onClick={() => undoTransaction(tx)}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                                    <RotateCcw size={11} /> Undo Match
                                  </button>
                                </div>
                              </div>
                            )
                          })()}

                          {/* EXCLUDED */}
                          {tx.status === 'EXCLUDED' && (
                            <div className="px-6 py-4 bg-slate-50/80 border-l-4 border-slate-300">
                              <p className="text-xs text-slate-500 mb-3">This transaction has been excluded from the bank feed and will not be posted to the general ledger.</p>
                              <div onClick={e => e.stopPropagation()}>
                                <button onClick={() => undoTransaction(tx)}
                                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                                  <RotateCcw size={11} /> Undo Exclude
                                </button>
                              </div>
                            </div>
                          )}

                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── I. Pagination ──────────────────────────────────────────────── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6))
                  const n = start + i
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {n}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Pagination info when only 1 page */}
          {!loading && totalPages === 1 && filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">Showing all {filtered.length} records</span>
            </div>
          )}
        </div>
      </div>

      {/* ── G. (detail panel removed – expandable rows used instead) ── */}

      {/* ── Link Account modal ────────────────────────────────────────────── */}
      {linkAcctOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Link2 size={16} className="text-emerald-600" /> Link Bank Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose a Philippine bank to connect via Open Finance</p>
              </div>
              <button onClick={() => setLinkAcctOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 grid grid-cols-3 gap-3">
              {[
                { name: 'BDO Unibank',     abbr: 'BDO',  color: 'bg-blue-600' },
                { name: 'BPI',             abbr: 'BPI',  color: 'bg-red-600'  },
                { name: 'Metrobank',       abbr: 'MBK',  color: 'bg-yellow-600' },
                { name: 'Security Bank',   abbr: 'SBC',  color: 'bg-orange-600' },
                { name: 'PNB',             abbr: 'PNB',  color: 'bg-green-700' },
                { name: 'Land Bank',       abbr: 'LBP',  color: 'bg-emerald-700' },
                { name: 'China Bank',      abbr: 'CBC',  color: 'bg-red-800'  },
                { name: 'UnionBank',       abbr: 'UBP',  color: 'bg-indigo-600' },
                { name: 'Maybank PH',      abbr: 'MAY',  color: 'bg-yellow-500' },
              ].map(bank => (
                <button
                  key={bank.abbr}
                  onClick={() => { showToast(`${bank.name} — connection coming soon`); setLinkAcctOpen(false) }}
                  className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition-all group"
                >
                  <div className={`w-10 h-10 ${bank.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {bank.abbr}
                  </div>
                  <span className="text-xs text-slate-600 text-center font-medium leading-tight">{bank.name}</span>
                </button>
              ))}
            </div>
            <div className="px-5 pb-4 text-center text-xs text-slate-400">
              Connections use BSP Open Finance Framework. Bank data is read-only.
            </div>
          </div>
        </div>
      )}

      {/* ── H. Batch categorize modal ──────────────────────────────────────── */}
      {batchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Batch Categorize</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selected.size} transaction{selected.size !== 1 ? 's' : ''} selected</p>
              </div>
              <button onClick={() => setBatchOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            {/* Account (required) */}
            <div className="px-5 pt-4 pb-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Account <span className="text-red-400">*</span>
              </label>
              <CoaDropdown
                open={batchCoaOpen}
                onToggle={() => { setBatchCoaOpen(o => !o); setBatchEntOpen(false) }}
                searchVal={batchCoaSearch}
                onSearch={setBatchCoaSearch}
                value={batchCoa}
                onChange={setBatchCoa}
                accounts={coa}
                topClose={() => setBatchEntOpen(false)}
                dropRef={batchCoaRef}
              />
            </div>

            {/* Name (optional) */}
            <div className="px-5 pb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Name <span className="text-slate-400">(optional)</span>
              </label>
              <EntityDropdown
                open={batchEntOpen}
                onToggle={() => { setBatchEntOpen(o => !o); setBatchCoaOpen(false) }}
                searchVal={batchEntSearch}
                onSearch={setBatchEntSearch}
                value={batchEnt}
                onChange={setBatchEnt}
                options={entities}
                topClose={() => setBatchCoaOpen(false)}
                dropRef={batchEntRef}
              />
            </div>

            {/* Preview table */}
            <div className="px-5 border-t border-slate-100 flex-1 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 mt-3 mb-2">Preview</p>
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase">
                    <th className="px-3 py-2 text-left font-semibold border-r border-slate-200">Date</th>
                    <th className="px-3 py-2 text-left font-semibold border-r border-slate-200">Description</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter(t => selected.has(t.id)).map(t => (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap border-r border-slate-200">{fmtDate(t.date)}</td>
                      <td className="px-3 py-2 text-slate-700 truncate max-w-[200px] border-r border-slate-200">{t.description}</td>
                      <td className={`px-3 py-2 text-right font-semibold tabular-nums ${t.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {fmtAmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                    <td className="px-3 py-2 text-slate-500 border-r border-slate-200" colSpan={2}>Total</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {fmt(items.filter(t => selected.has(t.id)).reduce((s, t) => s + Math.abs(t.amount), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {batchError && <p className="px-5 py-2 text-xs text-red-500">{batchError}</p>}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setBatchOpen(false)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={submitBatch}
                disabled={!batchCoa || batchLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {batchLoading && <Loader2 size={13} className="animate-spin" />}
                {batchLoading ? 'Categorizing…' : `✓ Categorize ${selected.size} Item${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">
          <Check size={14} /> {toast}
        </div>
      )}
    </div>
  )
}
