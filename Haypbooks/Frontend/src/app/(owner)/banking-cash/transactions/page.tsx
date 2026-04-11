'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle, Briefcase, Building2, Check, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, FileUp, Loader2, RefreshCw, RotateCcw,
  Search, User, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

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

type StatusFilter = 'all' | 'review' | 'categorized' | 'excluded'
type SortKey      = 'date' | 'description' | 'name' | 'account' | 'amount'
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
  checkbox: 40, date: 110, description: 260, name: 160,
  account: 190, amount: 130, actions: 100,
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

const MOCK: BankTransaction[] = [
  { id: 'm1',  date: '2026-04-10', description: 'GRAB PHILIPPINES',          amount:    -250, status: 'PENDING',     contactName: 'Grab' },
  { id: 'm2',  date: '2026-04-09', description: 'MERALCO PAYMENT',           amount:   -3840, status: 'PENDING',     contactName: 'Meralco' },
  { id: 'm3',  date: '2026-04-09', description: 'CUSTOMER PAYMENT INV-0041', amount:   15000, status: 'MATCHED',     contactName: 'Acme Corp',          accountName: 'Accounts Receivable' },
  { id: 'm4',  date: '2026-04-08', description: 'OFFICE DEPOT PURCHASE',     amount:   -1200, status: 'PENDING',     contactName: 'Office Depot' },
  { id: 'm5',  date: '2026-04-08', description: 'BDO BANK SERVICE CHARGE',   amount:    -150, status: 'CATEGORIZED', accountName: 'Bank Charges & Fees' },
  { id: 'm6',  date: '2026-04-07', description: 'SHOPEE VENDOR PAYOUT',      amount:    8500, status: 'PENDING' },
  { id: 'm7',  date: '2026-04-07', description: 'PLDT FIBER MONTHLY',        amount:   -1899, status: 'CATEGORIZED', accountName: 'Telecommunications',   contactName: 'PLDT' },
  { id: 'm8',  date: '2026-04-06', description: 'SSS CONTRIBUTION',          amount:  -12000, status: 'EXCLUDED' },
  { id: 'm9',  date: '2026-04-06', description: 'PAYROLL — APRIL 1–15',      amount: -245000, status: 'CATEGORIZED', accountName: 'Salaries & Wages' },
  { id: 'm10', date: '2026-04-05', description: 'CUSTOMER ADVANCE',          amount:   50000, status: 'PENDING',     contactName: 'GlobalEdge Solutions' },
  { id: 'm11', date: '2026-04-05', description: 'CREDIT CARD PAYMENT',       amount:  -24800, status: 'CATEGORIZED', accountName: 'Credit Card Payment' },
  { id: 'm12', date: '2026-04-04', description: 'BIR WITHHOLDING TAX',       amount:  -16240, status: 'CATEGORIZED', accountName: 'Taxes Payable' },
]

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search,    setSearch]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [minAmt,    setMinAmt]    = useState('')
  const [maxAmt,    setMaxAmt]    = useState('')
  const [sortKey,   setSortKey]   = useState<SortKey>('date')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')
  const [page,      setPage]      = useState(1)

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ── Inline categorize ──────────────────────────────────────────────────────
  const [expandedId,      setExpandedId]      = useState<string | null>(null)
  const [inlineCoa,       setInlineCoa]       = useState('')
  const [inlineEnt,       setInlineEnt]       = useState('')
  const [inlineMemo,      setInlineMemo]      = useState('')
  const [inlineCoaSearch, setInlineCoaSearch] = useState('')
  const [inlineEntSearch, setInlineEntSearch] = useState('')
  const [inlineCoaOpen,   setInlineCoaOpen]   = useState(false)
  const [inlineEntOpen,   setInlineEntOpen]   = useState(false)
  const [inlineSaving,    setInlineSaving]    = useState(false)
  const inlineCoaRef = useRef<HTMLDivElement>(null)
  const inlineEntRef = useRef<HTMLDivElement>(null)

  // ── Detail panel ───────────────────────────────────────────────────────────
  const [detailTx,       setDetailTx]       = useState<BankTransaction | null>(null)
  const [detailOpen,     setDetailOpen]     = useState(false)
  const [detailCoa,      setDetailCoa]      = useState('')
  const [detailEnt,      setDetailEnt]      = useState('')
  const [detailMemo,     setDetailMemo]     = useState('')
  const [detailCoaSearch,setDetailCoaSearch] = useState('')
  const [detailEntSearch,setDetailEntSearch] = useState('')
  const [detailCoaOpen,  setDetailCoaOpen]  = useState(false)
  const [detailEntOpen,  setDetailEntOpen]  = useState(false)
  const [detailSaving,   setDetailSaving]   = useState(false)
  const detailCoaRef = useRef<HTMLDivElement>(null)
  const detailEntRef = useRef<HTMLDivElement>(null)

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
  const [coa,      setCoa]      = useState<CoaAccount[]>([])
  const [entities, setEntities] = useState<EntityOption[]>([])

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
      else { setItems(MOCK); setUsingMock(true) }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load transactions')
      setItems(MOCK); setUsingMock(true)
    } finally { setLoading(false) }
  }, [companyId])

  const loadCoa = useCallback(async () => {
    if (!companyId) return
    try {
      const r = await apiClient.get(`/companies/${companyId}/accounts`)
      setCoa(
        (Array.isArray(r.data) ? r.data : r.data?.accounts ?? []).map((a: any): CoaAccount => ({
          id: a.id, code: a.code ?? '', name: a.name, category: a.category ?? a.accountType,
        })),
      )
    } catch { /* non-fatal */ }
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
      setEntities(out)
    } catch { /* non-fatal */ }
  }, [companyId])

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
      if (detailCoaRef.current && !detailCoaRef.current.contains(t))  setDetailCoaOpen(false)
      if (detailEntRef.current && !detailEntRef.current.contains(t))  setDetailEntOpen(false)
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

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date')         cmp = a.date.localeCompare(b.date)
      else if (sortKey === 'description') cmp = a.description.localeCompare(b.description)
      else if (sortKey === 'name')    cmp = (a.contactName ?? '').localeCompare(b.contactName ?? '')
      else if (sortKey === 'account') cmp = (a.accountName ?? '').localeCompare(b.accountName ?? '')
      else if (sortKey === 'amount')  cmp = Math.abs(a.amount) - Math.abs(b.amount)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, statusFilter, search, dateFrom, dateTo, minAmt, maxAmt, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ─── Balance calcs ─────────────────────────────────────────────────────────
  const bankTotal  = items.reduce((s, t) => s + Math.abs(t.amount), 0)
  const booksTotal = items
    .filter(t => t.status === 'CATEGORIZED' || t.status === 'MATCHED')
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const diffAmt = bankTotal - booksTotal

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

  // ─── Inline categorize ────────────────────────────────────────────────────
  const openInline = (tx: BankTransaction) => {
    setExpandedId(tx.id)
    setInlineCoa(tx.accountId ?? '')
    setInlineEnt(tx.contactId ?? '')
    setInlineMemo(tx.memo ?? '')
    setInlineCoaSearch(''); setInlineEntSearch('')
    setInlineCoaOpen(false); setInlineEntOpen(false)
  }

  const saveInline = async () => {
    if (!companyId || !expandedId) return
    setInlineSaving(true)
    try {
      await apiClient.patch(
        `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${expandedId}`,
        { status: 'CATEGORIZED', accountId: inlineCoa || undefined, contactId: inlineEnt || undefined, memo: inlineMemo || undefined, transactionType: 'Bank Transaction' },
      )
      setItems(prev => prev.map(t => t.id !== expandedId ? t : {
        ...t, status: 'CATEGORIZED',
        accountId: inlineCoa || t.accountId,
        accountName: coa.find(c => c.id === inlineCoa)?.name ?? t.accountName,
        contactId: inlineEnt || t.contactId,
        contactName: entities.find(e => e.id === inlineEnt)?.name ?? t.contactName,
        memo: inlineMemo || t.memo,
      }))
      setExpandedId(null)
      showToast('Transaction categorized')
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to categorize')
    } finally { setInlineSaving(false) }
  }

  // ─── Undo ─────────────────────────────────────────────────────────────────
  const undoTransaction = async (tx: BankTransaction) => {
    if (!companyId) return
    try {
      await apiClient.patch(
        `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${tx.id}`,
        { status: 'PENDING' },
      )
      setItems(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'PENDING' } : t))
      showToast('Reset to For Review')
    } catch { showToast('Failed to undo') }
  }

  // ─── Exclude ─────────────────────────────────────────────────────────────
  const excludeRows = async (ids: string[]) => {
    if (!companyId) return
    try {
      await Promise.all(ids.map(id =>
        apiClient.patch(`/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${id}`, { status: 'EXCLUDED' }),
      ))
      setItems(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'EXCLUDED' } : t))
      setSelected(new Set())
      showToast(`${ids.length} transaction${ids.length !== 1 ? 's' : ''} excluded`)
    } catch { showToast('Failed to exclude') }
  }

  // ─── Detail panel ─────────────────────────────────────────────────────────
  const openDetail = (tx: BankTransaction) => {
    setDetailTx(tx); setDetailCoa(tx.accountId ?? ''); setDetailEnt(tx.contactId ?? '')
    setDetailMemo(tx.memo ?? ''); setDetailCoaSearch(''); setDetailEntSearch('')
    setDetailCoaOpen(false); setDetailEntOpen(false); setDetailSaving(false)
    setDetailOpen(true)
  }

  const saveDetail = async () => {
    if (!companyId || !detailTx) return
    setDetailSaving(true)
    try {
      await apiClient.patch(
        `/companies/${companyId}/banking/accounts/${selectedAcct}/transactions/${detailTx.id}`,
        { status: 'CATEGORIZED', accountId: detailCoa || undefined, contactId: detailEnt || undefined, memo: detailMemo || undefined, transactionType: 'Bank Transaction' },
      )
      setItems(prev => prev.map(t => t.id !== detailTx.id ? t : {
        ...t, status: 'CATEGORIZED',
        accountId: detailCoa || t.accountId,
        accountName: coa.find(c => c.id === detailCoa)?.name ?? t.accountName,
        contactId: detailEnt || t.contactId,
        contactName: entities.find(e => e.id === detailEnt)?.name ?? t.contactName,
        memo: detailMemo || t.memo,
      }))
      setDetailOpen(false); showToast('Transaction categorized')
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to categorize')
    } finally { setDetailSaving(false) }
  }

  // ─── Batch categorize ─────────────────────────────────────────────────────
  const openBatch = () => {
    setBatchCoa(''); setBatchEnt(''); setBatchCoaSearch(''); setBatchEntSearch('')
    setBatchCoaOpen(false); setBatchEntOpen(false); setBatchError('')
    setBatchOpen(true)
  }

  const submitBatch = async () => {
    if (!companyId || !batchCoa) return
    const count = selected.size
    setBatchLoading(true); setBatchError('')
    try {
      const coaAcct = coa.find(a => a.id === batchCoa)
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
      setItems(prev => prev.map(t => !selected.has(t.id) ? t : {
        ...t, status: 'CATEGORIZED',
        accountId: batchCoa,
        accountName: coaAcct?.name,
        contactId: batchEnt || t.contactId,
        contactName: entities.find(e => e.id === batchEnt)?.name ?? t.contactName,
      }))
      setSelected(new Set()); setBatchOpen(false)
      showToast(`${count} transaction${count !== 1 ? 's' : ''} categorized`)
    } catch (e: any) {
      setBatchError(e?.response?.data?.message ?? 'Batch categorize failed')
    } finally { setBatchLoading(false) }
  }

  // ─── Misc ─────────────────────────────────────────────────────────────────
  const hasFilters = !!(search || dateFrom || dateTo || minAmt || maxAmt)
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setMinAmt(''); setMaxAmt('') }
  const acctObj = accounts.find(a => a.id === selectedAcct)

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
      <div className="bg-white border-b border-slate-100 px-6 py-2 text-sm text-slate-500">
        <span>Bank: <span className="font-medium text-slate-700">{fmt(bankTotal)}</span></span>
        <span className="mx-3 text-slate-300">·</span>
        <span>In Books: <span className="font-medium text-slate-700">{fmt(booksTotal)}</span></span>
        <span className="mx-3 text-slate-300">·</span>
        <span>
          Difference:{' '}
          <span className={`font-semibold ${diffAmt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {fmt(diffAmt)}
          </span>
          {diffAmt > 0 && <span className="ml-1 text-xs text-slate-400">({nReview} uncategorized)</span>}
        </span>
        {usingMock && (
          <span className="ml-4 text-xs text-amber-500 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded">
            Sample data
          </span>
        )}
      </div>

      {/* ── C. Filter bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { key: 'all',         label: 'All',          count: items.length },
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
                  {/* Amount */}
                  <th className={`${thClass} text-right cursor-pointer`} style={{ width: colW.amount }}
                      onClick={() => handleSort('amount')}>
                    Amount <SortIcon col="amount" sk={sortKey} sd={sortDir} />
                    <ResizeHandle col="amount" />
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
                    <td colSpan={7} className="px-4 py-16 text-center">
                      {hasFilters || statusFilter !== 'all' ? (
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
                      onClick={() => { if (expandedId !== tx.id) openDetail(tx) }}
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
                        <div className="font-medium text-slate-800 truncate">{tx.description}</div>
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
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      {/* Amount */}
                      <td className={`${tdClass} text-right font-mono font-semibold`} style={{ width: colW.amount }}>
                        <span className={tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}>
                          {fmtAmt(tx.amount)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className={tdClass} style={{ width: colW.actions }}
                          onClick={e => e.stopPropagation()}>
                        {tx.status === 'PENDING' && (
                          <button
                            onClick={() => openInline(tx)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        )}
                        {(tx.status === 'CATEGORIZED' || tx.status === 'MATCHED') && (
                          <div className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-600 shrink-0" />
                            <button
                              onClick={() => undoTransaction(tx)}
                              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                            >
                              <RotateCcw size={11} /> Undo
                            </button>
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

                    {/* ── F. Inline categorization row ── */}
                    {expandedId === tx.id && (
                      <tr key={`${tx.id}-inline`} className="border-b border-slate-100 bg-emerald-50/40">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Categorize: <span className="normal-case font-normal text-slate-700">{tx.description}</span>
                              <span className={`ml-2 font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                {fmtAmt(tx.amount)}
                              </span>
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Account (COA)</label>
                                <CoaDropdown
                                  open={inlineCoaOpen}
                                  onToggle={() => { setInlineCoaOpen(o => !o); setInlineEntOpen(false) }}
                                  searchVal={inlineCoaSearch}
                                  onSearch={setInlineCoaSearch}
                                  value={inlineCoa}
                                  onChange={setInlineCoa}
                                  accounts={coa}
                                  topClose={() => setInlineEntOpen(false)}
                                  dropRef={inlineCoaRef}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                                <EntityDropdown
                                  open={inlineEntOpen}
                                  onToggle={() => { setInlineEntOpen(o => !o); setInlineCoaOpen(false) }}
                                  searchVal={inlineEntSearch}
                                  onSearch={setInlineEntSearch}
                                  value={inlineEnt}
                                  onChange={setInlineEnt}
                                  options={entities}
                                  topClose={() => setInlineCoaOpen(false)}
                                  dropRef={inlineEntRef}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Memo</label>
                              <input
                                value={inlineMemo}
                                onChange={e => setInlineMemo(e.target.value)}
                                placeholder="Optional memo…"
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => setExpandedId(null)}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveInline}
                                disabled={inlineSaving}
                                className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-1.5"
                              >
                                {inlineSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                Categorize
                              </button>
                            </div>
                          </div>
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

      {/* ── G. Detail panel (slide-over, 400px) ───────────────────────────── */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setDetailOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-[400px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-200 ease-out ${detailOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {detailTx && (
          <>
            {/* Detail header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
              <button onClick={() => setDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Detail content (scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Transaction info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Description</span>
                  <span className="text-slate-800 font-medium text-right max-w-[200px]">{detailTx.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-700">{fmtDate(detailTx.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className={`font-semibold ${detailTx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {fmtAmt(detailTx.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    detailTx.status === 'PENDING'     ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    detailTx.status === 'CATEGORIZED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    detailTx.status === 'MATCHED'     ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                      detailTx.status === 'PENDING' ? 'bg-amber-400 animate-pulse' :
                      detailTx.status === 'CATEGORIZED' ? 'bg-emerald-500' :
                      detailTx.status === 'MATCHED' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    {detailTx.status === 'PENDING' ? 'For Review' : detailTx.status.charAt(0) + detailTx.status.slice(1).toLowerCase()}
                  </span>
                </div>
                {detailTx.bankRef && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Ref</span>
                    <span className="text-slate-600 font-mono text-xs">{detailTx.bankRef}</span>
                  </div>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Categorization fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Account (COA)</label>
                  <CoaDropdown
                    open={detailCoaOpen}
                    onToggle={() => { setDetailCoaOpen(o => !o); setDetailEntOpen(false) }}
                    searchVal={detailCoaSearch}
                    onSearch={setDetailCoaSearch}
                    value={detailCoa}
                    onChange={setDetailCoa}
                    accounts={coa}
                    topClose={() => setDetailEntOpen(false)}
                    dropRef={detailCoaRef}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                  <EntityDropdown
                    open={detailEntOpen}
                    onToggle={() => { setDetailEntOpen(o => !o); setDetailCoaOpen(false) }}
                    searchVal={detailEntSearch}
                    onSearch={setDetailEntSearch}
                    value={detailEnt}
                    onChange={setDetailEnt}
                    options={entities}
                    topClose={() => setDetailCoaOpen(false)}
                    dropRef={detailEntRef}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Memo</label>
                  <input
                    value={detailMemo}
                    onChange={e => setDetailMemo(e.target.value)}
                    placeholder="Optional memo…"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Journal entry / meta */}
              {(detailTx.journalEntryId || detailTx.transactionType || detailTx.createdAt) && (
                <>
                  <hr className="border-slate-100" />
                  <div className="space-y-1.5 text-xs text-slate-500">
                    {detailTx.transactionType && (
                      <div className="flex justify-between">
                        <span>Transaction Type</span>
                        <span className="text-slate-700">{detailTx.transactionType}</span>
                      </div>
                    )}
                    {detailTx.journalEntryId && (
                      <div className="flex justify-between items-center">
                        <span>Journal Entry</span>
                        <span className="text-emerald-700 font-medium">
                          {detailTx.journalEntryRef ?? detailTx.journalEntryId.slice(0, 8)}
                        </span>
                      </div>
                    )}
                    {detailTx.createdAt && (
                      <div className="flex justify-between">
                        <span>Imported</span>
                        <span>{fmtDate(detailTx.createdAt.substring(0, 10))}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Categorize button */}
              {(detailTx.status === 'PENDING' || detailCoa !== detailTx.accountId) && (
                <button
                  onClick={saveDetail}
                  disabled={detailSaving || !detailCoa}
                  className="w-full py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {detailSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Categorize
                </button>
              )}

              {/* Undo */}
              {(detailTx.status === 'CATEGORIZED' || detailTx.status === 'MATCHED') && (
                <button
                  onClick={async () => { await undoTransaction(detailTx); setDetailOpen(false) }}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw size={13} /> Undo Categorize
                </button>
              )}
            </div>
          </>
        )}
      </div>

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
