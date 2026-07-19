'use client'

import { Fragment, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X, ArrowRightLeft, Clock } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useToast } from '@/components/ToastProvider'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'

type TxType = 'Credit' | 'Debit'
type TxStatus = 'Cleared' | 'Pending' | 'Reconciled' | 'Voided'

const STATUS_META: Record<TxStatus, { cls: string; dot: string }> = {
  Cleared:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Reconciled: { cls: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-500' },
  Pending:    { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400 animate-pulse' },
  Voided:     { cls: 'bg-slate-100 text-slate-400 border-slate-200',      dot: 'bg-slate-300' },
}

const TX_COL_WIDTHS_KEY = 'bank-transactions-cols-v1'
const defaultTxColWidths = {
  date: 112,
  description: 320,
  account: 176,
  category: 160,
  debit: 128,
  credit: 128,
  balance: 140,
  status: 132,
}

export default function BankTransactionsPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Transfer Funds state ──────────────────────────────────────────────────
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<{ id: string; name: string; accountNumber?: string; balance?: number }[]>([])
  const [transferForm, setTransferForm] = useState({
    fromBankAccountId: '',
    toBankAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
  })
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')
  const toast = useToast()

  // ── Activity Drawer ─────────────────────────────────────────────────────
  const [showActivityDrawer, setShowActivityDrawer] = useState(false)
  const [activityAccountId, setActivityAccountId] = useState('')
  const [bankActivity, setBankActivity] = useState<any[]>([])
  const [bankActivityLoading, setBankActivityLoading] = useState(false)

  const openActivityDrawer = async (accountId: string) => {
    setActivityAccountId(accountId)
    setShowActivityDrawer(true)
    setBankActivity([])
    if (!companyId || !accountId) return
    setBankActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/accounts/${accountId}/activity`)
      setBankActivity(data.data ?? [])
    } catch { /* non-critical */ }
    finally { setBankActivityLoading(false) }
}
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchBankAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/accounts`)
      setBankAccounts(Array.isArray(data) ? data : data.accounts ?? [])
    } catch { }
  }, [companyId])

  const handleOpenTransfer = () => {
    fetchBankAccounts()
    setTransferForm({ fromBankAccountId: '', toBankAccountId: '', amount: '', date: new Date().toISOString().split('T')[0], memo: '' })
    setTransferError('')
    setShowTransferModal(true)
  }

  const handleTransfer = async () => {
    const amt = parseFloat(transferForm.amount)
    if (!transferForm.fromBankAccountId || !transferForm.toBankAccountId || isNaN(amt) || amt <= 0) {
      setTransferError('Please fill in all required fields with a valid amount.')
      return
    }
    if (transferForm.fromBankAccountId === transferForm.toBankAccountId) {
      setTransferError('Source and destination accounts must be different.')
      return
    }
    setTransferLoading(true)
    setTransferError('')
    try {
      await apiClient.post(`/companies/${companyId}/banking/transfers`, {
        fromBankAccountId: transferForm.fromBankAccountId,
        toBankAccountId: transferForm.toBankAccountId,
        amount: amt,
        date: transferForm.date,
        memo: transferForm.memo || undefined,
      })
      toast.push({ type: 'success', message: 'Funds transferred successfully' })
      setShowTransferModal(false)
    } catch (e: any) {
      setTransferError(e?.response?.data?.message ?? 'Transfer failed. Please try again.')
    } finally {
      setTransferLoading(false)
    }
  }

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
    fetchBankAccounts()
  }, [fetchData, fetchBankAccounts])
  const [search, setSearch] = useState('')
  const [account, setAccount] = useState('All')
  const [type, setType] = useState<TxType | 'All'>('All')
  const [status, setStatus] = useState<TxStatus | 'All'>('All')
  const [view, setView] = useState<'transactions' | 'register'>('transactions')
  const [txColWidths, setTxColWidths] = useState<typeof defaultTxColWidths>(() => {
    if (typeof window === 'undefined') return defaultTxColWidths
    try {
      return {
        ...defaultTxColWidths,
        ...JSON.parse(localStorage.getItem(TX_COL_WIDTHS_KEY) ?? '{}'),
      }
    } catch {
      return defaultTxColWidths
    }
  })
  const txColWidthsRef = useRef(txColWidths)
  useEffect(() => { txColWidthsRef.current = txColWidths }, [txColWidths])
  const saveTxColWidths = useCallback((next: typeof defaultTxColWidths) => {
    setTxColWidths(next)
    try { localStorage.setItem(TX_COL_WIDTHS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])
  const { containerRef: txTableRef, startResize: startTxResize, isOverflowing: txTableOverflowing } = useFixedWidthResizableMap({
    widths: txColWidths,
    widthsRef: txColWidthsRef,
    order: ['date', 'description', 'account', 'category', 'debit', 'credit', 'balance', 'status'],
    saveWidths: saveTxColWidths,
    fixedWidth: 136,
    minWidth: {
      date: 96,
      description: 220,
      account: 130,
      category: 120,
      debit: 100,
      credit: 100,
      balance: 110,
      status: 110,
    },
  })

  const filtered = useMemo(() => {
    let list = items
    if (account !== 'All') list = list.filter(t => t.account === account)
    if (type !== 'All') list = list.filter(t => t.type === type)
    if (status !== 'All') list = list.filter(t => t.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.reference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, account, type, status])

  const sortedFiltered = useMemo(() => {
    if (view === 'register') {
      return [...filtered].sort((a, b) => a.account.localeCompare(b.account) || b.date.localeCompare(a.date))
    }
    return filtered
  }, [filtered, view])

  const totalCredits = filtered.filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits = filtered.filter(t => t.type === 'Debit').reduce((s, t) => s + t.amount, 0)
  const netFlow = totalCredits - totalDebits
  const unreconciled = items.filter(t => t.status === 'Pending').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking / Transactions</p>
            <h1 className="text-2xl font-bold text-slate-900">{view === 'register' ? 'Bank Register' : 'Bank Transactions'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{view === 'register' ? 'Running balance by account' : 'All bank movements across your connected accounts'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Export
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 4h16v16H4zM9 9l6 6M15 9l-6 6" strokeLinecap="round"/></svg>
              Reconcile
            </button>
            <button
              onClick={handleOpenTransfer}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Funds
            </button>
            <button
              onClick={() => router.push('/banking/transactions/activity')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Activity Log
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
              Add Transaction
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Credits', value: fmt(totalCredits), sub: `${filtered.filter(t=>t.type==='Credit').length} transactions`, color: 'text-emerald-700 bg-emerald-50', icon: '↑' },
            { label: 'Total Debits', value: fmt(totalDebits), sub: `${filtered.filter(t=>t.type==='Debit').length} transactions`, color: 'text-rose-600 bg-rose-50', icon: '↓' },
            { label: 'Net Cash Flow', value: fmt(Math.abs(netFlow)), sub: netFlow >= 0 ? 'Net Inflow' : 'Net Outflow', color: netFlow >= 0 ? 'text-sky-700 bg-sky-50' : 'text-amber-700 bg-amber-50', icon: '≈' },
            { label: 'Unreconciled', value: `${unreconciled}`, sub: 'Pending review', color: 'text-amber-700 bg-amber-50', icon: '!' },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${c.color}`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{c.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-colors" />
            </div>
            <select aria-label="Filter by account" value={account} onChange={e => setAccount(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[220px]">
              <option value="All">All Accounts</option>
              {bankAccounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <select aria-label="Filter by type" value={type} onChange={e => setType(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer">
              <option value="All">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
            <select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Cleared">Cleared</option>
              <option value="Reconciled">Reconciled</option>
              <option value="Pending">Pending</option>
              <option value="Voided">Voided</option>
            </select>
            <div className="flex items-center ml-auto gap-3">
              <span className="text-xs text-slate-400">{filtered.length} records</span>
              <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
                <button
                  onClick={() => setView('transactions')}
                  className={`px-3 py-1.5 transition-colors ${
                    view === 'transactions' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  All Transactions
                </button>
                <button
                  onClick={() => setView('register')}
                  className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${
                    view === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Bank Register
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div ref={txTableRef} className={txTableOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}>
            <table className="w-full min-w-[1000px] table-fixed text-left">
              <colgroup>
                <col style={{ width: 40 }} />
                <col style={{ width: txColWidths.date }} />
                <col style={{ width: txColWidths.description }} />
                <col style={{ width: txColWidths.account }} />
                <col style={{ width: txColWidths.category }} />
                <col style={{ width: txColWidths.debit }} />
                <col style={{ width: txColWidths.credit }} />
                <col style={{ width: txColWidths.balance }} />
                <col style={{ width: txColWidths.status }} />
                <col style={{ width: 96 }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-10"><input type="checkbox" aria-label="Select all" className="rounded border-slate-300 accent-emerald-600" /></th>
                  <th className="relative px-4 py-3 truncate whitespace-nowrap" style={{ width: txColWidths.date, minWidth: txColWidths.date, maxWidth: txColWidths.date }} title="Date">
                    Date
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'date')} />
                  </th>
                  <th className="relative px-4 py-3 truncate" style={{ width: txColWidths.description, minWidth: txColWidths.description, maxWidth: txColWidths.description }} title="Reference / Description">
                    Reference / Description
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'description')} />
                  </th>
                  <th className="relative px-4 py-3 truncate whitespace-nowrap" style={{ width: txColWidths.account, minWidth: txColWidths.account, maxWidth: txColWidths.account }} title="Account">
                    Account
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'account')} />
                  </th>
                  <th className="relative px-4 py-3 truncate whitespace-nowrap" style={{ width: txColWidths.category, minWidth: txColWidths.category, maxWidth: txColWidths.category }} title="Category">
                    Category
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'category')} />
                  </th>
                  <th className="relative px-4 py-3 text-right truncate whitespace-nowrap" style={{ width: txColWidths.debit, minWidth: txColWidths.debit, maxWidth: txColWidths.debit }} title="Debit">
                    Debit
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'debit')} />
                  </th>
                  <th className="relative px-4 py-3 text-right truncate whitespace-nowrap" style={{ width: txColWidths.credit, minWidth: txColWidths.credit, maxWidth: txColWidths.credit }} title="Credit">
                    Credit
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'credit')} />
                  </th>
                  <th className="relative px-4 py-3 text-right truncate whitespace-nowrap" style={{ width: txColWidths.balance, minWidth: txColWidths.balance, maxWidth: txColWidths.balance }} title="Balance">
                    Balance
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'balance')} />
                  </th>
                  <th className="relative px-4 py-3 truncate whitespace-nowrap" style={{ width: txColWidths.status, minWidth: txColWidths.status, maxWidth: txColWidths.status }} title="Status">
                    Status
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startTxResize(e, 'status')} />
                  </th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFiltered.map((tx, idx) => (
                  <Fragment key={tx.id}>
                    {view === 'register' && (idx === 0 || sortedFiltered[idx - 1].account !== tx.account) && (
                      <tr className="bg-slate-100 border-t-2 border-slate-200">
                        <td colSpan={10} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wide">{tx.account}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3.5"><input type="checkbox" aria-label="Select transaction" className="rounded border-slate-300 accent-emerald-600" /></td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap" style={{ width: txColWidths.date, minWidth: txColWidths.date, maxWidth: txColWidths.date }}>{tx.date}</td>
                    <td className="px-4 py-3.5 overflow-hidden" style={{ width: txColWidths.description, minWidth: txColWidths.description, maxWidth: txColWidths.description }}>
                      <div className="text-sm font-medium text-slate-800 truncate" title={tx.description}>{tx.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate" title={`${tx.reference}${tx.bankRef ? ` · ${tx.bankRef}` : ''}`}>{tx.reference}{tx.bankRef && ` · ${tx.bankRef}`}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap truncate" style={{ width: txColWidths.account, minWidth: txColWidths.account, maxWidth: txColWidths.account }} title={tx.account.split(' - ')[0]}>{tx.account.split(' - ')[0]}</td>
                    <td className="px-4 py-3.5 overflow-hidden" style={{ width: txColWidths.category, minWidth: txColWidths.category, maxWidth: txColWidths.category }}>
                      <span className="inline-flex max-w-full items-center truncate px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600" title={tx.category}>{tx.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm" style={{ width: txColWidths.debit, minWidth: txColWidths.debit, maxWidth: txColWidths.debit }}>
                      {tx.type === 'Debit' ? <span className="text-rose-600 font-semibold">{fmt(tx.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm" style={{ width: txColWidths.credit, minWidth: txColWidths.credit, maxWidth: txColWidths.credit }}>
                      {tx.type === 'Credit' ? <span className="text-emerald-700 font-semibold">{fmt(tx.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-800 whitespace-nowrap" style={{ width: txColWidths.balance, minWidth: txColWidths.balance, maxWidth: txColWidths.balance }}>{fmt(tx.balance)}</td>
                    <td className="px-4 py-3.5" style={{ width: txColWidths.status, minWidth: txColWidths.status, maxWidth: txColWidths.status }}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_META[tx.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[tx.status].dot}`} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 w-24">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-2 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors">View</button>
                        <button title="More options" className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  </Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 text-sm font-bold">
                  <td colSpan={5} className="px-4 py-3 text-xs text-slate-500 uppercase">Totals ({sortedFiltered.length})</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600">{fmt(totalDebits)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{fmt(totalCredits)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">{fmt(netFlow >= 0 ? netFlow : Math.abs(netFlow))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Showing {sortedFiltered.length} transactions</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(n => <button key={n} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n===1?'bg-emerald-600 text-white':'text-slate-500 hover:bg-slate-100'}`}>{n}</button>)}
              <button className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors text-lg">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transfer Funds Modal ── */}
      {showTransferModal && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Transfer Funds</h2>
              </div>
              <button title="Close" onClick={() => setShowTransferModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* From */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">From Account <span className="text-red-500">*</span></label>
                <select                  aria-label="From Account"                  value={transferForm.fromBankAccountId}
                  onChange={e => setTransferForm(f => ({ ...f, fromBankAccountId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select source account…</option>
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id} disabled={a.id === transferForm.toBankAccountId}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                      {a.balance !== undefined ? ` (${fmt(a.balance)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">To Account <span className="text-red-500">*</span></label>
                <select                  aria-label="To Account"                  value={transferForm.toBankAccountId}
                  onChange={e => setTransferForm(f => ({ ...f, toBankAccountId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select destination account…</option>
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id} disabled={a.id === transferForm.fromBankAccountId}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={transferForm.amount}
                    onChange={e => setTransferForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date" value={transferForm.date}
                    aria-label="Transfer Date"
                    onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Memo</label>
                <input
                  type="text" value={transferForm.memo}
                  onChange={e => setTransferForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Preview */}
              {transferForm.fromBankAccountId && transferForm.toBankAccountId && transferForm.amount && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700 mb-1">Journal Entry Preview</p>
                  <div className="flex justify-between">
                    <span>DR — {bankAccounts.find(a => a.id === transferForm.toBankAccountId)?.name ?? 'To Account'}</span>
                    <span className="font-mono font-semibold text-emerald-700">{fmt(parseFloat(transferForm.amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CR — {bankAccounts.find(a => a.id === transferForm.fromBankAccountId)?.name ?? 'From Account'}</span>
                    <span className="font-mono font-semibold text-blue-700">{fmt(parseFloat(transferForm.amount) || 0)}</span>
                  </div>
                </div>
              )}

              {transferError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{transferError}</p>
              )}
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferLoading || !transferForm.fromBankAccountId || !transferForm.toBankAccountId || !transferForm.amount}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                {transferLoading ? 'Transferring…' : 'Transfer Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Log Drawer ── */}
      {showActivityDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 z-[90] bg-black/80" onClick={() => setShowActivityDrawer(false)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Account Activity Log</h2>
                <p className="text-sm text-slate-500 mt-0.5">{bankAccounts.find(a => a.id === activityAccountId)?.name ?? 'Bank Account'}</p>
              </div>
              <button
                onClick={() => setShowActivityDrawer(false)}
                aria-label="Close activity drawer"
                title="Close"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {bankAccounts.length > 1 && (
              <div className="px-6 py-3 border-b border-slate-100">
                <select
                  aria-label="Select bank account for activity log"
                  value={activityAccountId}
                  onChange={e => openActivityDrawer(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {bankActivityLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : bankActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No activity recorded for this account yet.</p>
              ) : bankActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <Clock className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                    <span className="text-slate-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
