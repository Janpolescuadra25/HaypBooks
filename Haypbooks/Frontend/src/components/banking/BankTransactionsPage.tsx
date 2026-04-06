'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { Loader2, X, ArrowRightLeft } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type TxType = 'Credit' | 'Debit'
type TxStatus = 'Cleared' | 'Pending' | 'Reconciled' | 'Voided'

interface Transaction {
  id: string
  date: string
  reference: string
  description: string
  type: TxType
  category: string
  account: string
  amount: number
  balance: number
  status: TxStatus
  bankRef?: string
}

const ACCOUNTS = ['PNB Business Checking - 4421', 'BDO Savings - 8832', 'BPI Corporate - 2910', 'MetroBank Payroll - 7755']

const DATA: Transaction[] = [
  { id: '1', date: 'Mar 25, 2025', reference: 'TXN-20250325-001', description: 'Customer Payment — INV-2025-0089 Acme Corporation', type: 'Credit', category: 'Accounts Receivable', account: ACCOUNTS[0], amount: 85000, balance: 392400.50, status: 'Cleared', bankRef: 'PNBFT-884321' },
  { id: '2', date: 'Mar 24, 2025', reference: 'TXN-20250324-001', description: 'Vendor Payment — BIL-0034 Metro Office Supplies', type: 'Debit', category: 'Office Expenses', account: ACCOUNTS[0], amount: 12500, balance: 307400.50, status: 'Cleared', bankRef: 'PNBFT-884298' },
  { id: '3', date: 'Mar 24, 2025', reference: 'TXN-20250324-002', description: 'Payroll Disbursement — March 15–31 Salary Run', type: 'Debit', category: 'Salaries & Wages', account: ACCOUNTS[2], amount: 245000, balance: 480100.00, status: 'Cleared', bankRef: 'BPIFT-554112' },
  { id: '4', date: 'Mar 23, 2025', reference: 'TXN-20250323-001', description: 'Fund Transfer — PNB to BDO for Payroll Top-up', type: 'Credit', category: 'Inter-Bank Transfer', account: ACCOUNTS[1], amount: 300000, balance: 725100.00, status: 'Cleared' },
  { id: '5', date: 'Mar 22, 2025', reference: 'TXN-20250322-001', description: 'SSS / PhilHealth / Pag-IBIG Remittance March 2025', type: 'Debit', category: 'Government Contributions', account: ACCOUNTS[0], amount: 38420, balance: 307900.50, status: 'Reconciled', bankRef: 'PNBFT-883900' },
  { id: '6', date: 'Mar 21, 2025', reference: 'TXN-20250321-001', description: 'Credit Card Bill Payment — Corporate Visa Mar', type: 'Debit', category: 'Credit Card Payment', account: ACCOUNTS[0], amount: 24800, balance: 346320.50, status: 'Cleared' },
  { id: '7', date: 'Mar 20, 2025', reference: 'TXN-20250320-001', description: 'Customer Advance — GlobalEdge Solutions Project', type: 'Credit', category: 'Accounts Receivable', account: ACCOUNTS[0], amount: 157500, balance: 371120.50, status: 'Cleared', bankRef: 'PNBFT-883750' },
  { id: '8', date: 'Mar 19, 2025', reference: 'TXN-20250319-001', description: 'Withholding Tax Payment — BIR Form 1601C Feb', type: 'Debit', category: 'Taxes Payable', account: ACCOUNTS[0], amount: 16240, balance: 213620.50, status: 'Reconciled', bankRef: 'PNBFT-883611' },
  { id: '9', date: 'Mar 18, 2025', reference: 'TXN-20250318-001', description: 'Lone Pine Realty — March Office Rent', type: 'Debit', category: 'Rent Expense', account: ACCOUNTS[0], amount: 65000, balance: 229860.50, status: 'Cleared' },
  { id: '10', date: 'Mar 15, 2025', reference: 'TXN-20250315-001', description: 'Interest Income — PNB Savings February 2025', type: 'Credit', category: 'Interest Income', account: ACCOUNTS[0], amount: 2480.50, balance: 294860.50, status: 'Reconciled', bankRef: 'PNBFT-883200' },
  { id: '11', date: 'Mar 14, 2025', reference: 'TXN-20250314-001', description: 'Software Subscription — Haypbooks Pro Annual', type: 'Debit', category: 'Software & Subscriptions', account: ACCOUNTS[0], amount: 45600, balance: 292380.00, status: 'Cleared' },
  { id: '12', date: 'Mar 12, 2025', reference: 'TXN-20250312-001', description: 'Customer Payment — INV-2025-0092 Metro Supplies', type: 'Credit', category: 'Accounts Receivable', account: ACCOUNTS[0], amount: 23400, balance: 337980.00, status: 'Pending' },
]

const STATUS_META: Record<TxStatus, { cls: string; dot: string }> = {
  Cleared:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Reconciled: { cls: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-500' },
  Pending:    { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400 animate-pulse' },
  Voided:     { cls: 'bg-slate-100 text-slate-400 border-slate-200',      dot: 'bg-slate-300' },
}

function fmt(n: number) { return '₱ ' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }

export default function BankTransactionsPage() {
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
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }
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
      showToast('Funds transferred successfully')
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

  useEffect(() => { fetchData() }, [fetchData])
  const [search, setSearch] = useState('')
  const [account, setAccount] = useState('All')
  const [type, setType] = useState<TxType | 'All'>('All')
  const [status, setStatus] = useState<TxStatus | 'All'>('All')

  const filtered = useMemo(() => {
    let list = DATA
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

  const totalCredits = filtered.filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits = filtered.filter(t => t.type === 'Debit').reduce((s, t) => s + t.amount, 0)
  const netFlow = totalCredits - totalDebits
  const unreconciled = DATA.filter(t => t.status === 'Pending').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking & Cash / Transactions</p>
            <h1 className="text-2xl font-bold text-slate-900">Bank Transactions</h1>
            <p className="text-sm text-slate-500 mt-0.5">All bank movements across your connected accounts</p>
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
            <select value={account} onChange={e => setAccount(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[220px]">
              <option value="All">All Accounts</option>
              {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer">
              <option value="All">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Cleared">Cleared</option>
              <option value="Reconciled">Reconciled</option>
              <option value="Pending">Pending</option>
              <option value="Voided">Voided</option>
            </select>
            <span className="text-xs text-slate-400 ml-auto">{filtered.length} records</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-slate-300 accent-emerald-600" /></th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3">Reference / Description</th>
                  <th className="px-4 py-3 whitespace-nowrap">Account</th>
                  <th className="px-4 py-3 whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Debit</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Credit</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Balance</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3.5"><input type="checkbox" className="rounded border-slate-300 accent-emerald-600" /></td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="text-sm font-medium text-slate-800 truncate">{tx.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.reference}{tx.bankRef && ` · ${tx.bankRef}`}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap max-w-[160px] truncate">{tx.account.split(' - ')[0]}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{tx.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm">
                      {tx.type === 'Debit' ? <span className="text-rose-600 font-semibold">{fmt(tx.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm">
                      {tx.type === 'Credit' ? <span className="text-emerald-700 font-semibold">{fmt(tx.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-800 whitespace-nowrap">{fmt(tx.balance)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_META[tx.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[tx.status].dot}`} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-2 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors">View</button>
                        <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 text-sm font-bold">
                  <td colSpan={5} className="px-4 py-3 text-xs text-slate-500 uppercase">Totals ({filtered.length})</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600">{fmt(totalDebits)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{fmt(totalCredits)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">{fmt(netFlow >= 0 ? netFlow : Math.abs(netFlow))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Showing {filtered.length} transactions</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(n => <button key={n} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n===1?'bg-emerald-600 text-white':'text-slate-500 hover:bg-slate-100'}`}>{n}</button>)}
              <button className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors text-lg">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Transfer Funds Modal ── */}
      {showTransferModal && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Transfer Funds</h2>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* From */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">From Account <span className="text-red-500">*</span></label>
                <select
                  value={transferForm.fromBankAccountId}
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
                <select
                  value={transferForm.toBankAccountId}
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
  )
}
