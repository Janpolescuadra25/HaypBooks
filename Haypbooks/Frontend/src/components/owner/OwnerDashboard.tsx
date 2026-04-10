'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import {
  TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight,
  DollarSign, FileText, Wallet,
  RefreshCw, AlertCircle, ChevronRight,
  ReceiptText, ShoppingCart,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useUser } from '@/hooks/use-user'
import { formatCurrency } from '@/lib/format'

interface KpiData {
  period: { start: string; end: string }
  revenue: number
  expenses: number
  netIncome: number
  overdueReceivables: { amount: number; count: number }
  overduePayables: { amount: number; count: number }
  bankBalance: number
}

interface CashData {
  accounts: Array<{ id: string; name: string; balance: number }>
  totalBalance: number
}


export default function OwnerDashboard() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const { user } = useUser()
  const fmt = (n: number) => formatCurrency(n, currency)

  const greeting = (() => {
    const h = new Date().getHours()
    const timeGreet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    const name = user?.firstName ?? user?.name?.split(' ')[0] ?? null
    return name ? `${timeGreet}, ${name}` : 'Welcome back'
  })()

  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [cash, setCash] = useState<CashData | null>(null)
  const [loading, setLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [error, setError] = useState('')
  const [docOpen, setDocOpen] = useState(false)

  const load = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const [kpiRes, cashRes] = await Promise.all([
        apiClient.get('/api/owner/financial-summary'),
        apiClient.get('/api/owner/cash-position'),
      ])
      setKpis(kpiRes.data)
      setCash(cashRes.data)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setFirstLoad(false)
    }
  }, [companyId])

  useEffect(() => { load() }, [load])

  const margin = kpis && kpis.revenue > 0 ? ((kpis.netIncome / kpis.revenue) * 100).toFixed(1) : '0.0'
  const isInitialLoad = firstLoad && loading

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-emerald-700/60 font-medium mb-0.5">{greeting}</p>
          <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Dashboard</h1>
          <p className="text-xs text-emerald-600/70 mt-0.5 font-medium">Your business at a glance.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-lg text-emerald-900 font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-500' : 'text-emerald-500'} />
          Refresh
        </button>
        <button
          onClick={() => setDocOpen(true)}
          className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
          aria-label="Open dashboard documentation"
        >
          ?
        </button>
      </header>

      {docOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold">Dashboard Documentation</h2>
              <button onClick={() => setDocOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>This modal describes key dashboard sections and interactions.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Refresh: reload all current KPI and cash data.</li>
                <li>Overdue alerts show customers/payables requiring attention.</li>
                <li>Quick actions are shortcuts to key operations (invoices, payments, bills).</li>
              </ul>
              <p>Close the modal to return to the functional dashboard.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {!companyId && !companyLoading && companyError && (
        <div className="flex flex-col items-center gap-3 px-6 py-8 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <AlertCircle size={24} className="text-amber-500" />
          <p className="text-sm font-medium text-amber-800">No company linked to your account yet.</p>
          <p className="text-xs text-amber-600">Complete onboarding or create a company to start using the dashboard.</p>
          <a href="/onboarding" className="text-xs font-bold text-amber-700 underline">Go to setup</a>
        </div>
      )}

      {/* KPI Cards */}
      {isInitialLoad ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-[20px] border border-emerald-50 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={fmt(kpis?.revenue ?? 0)}
            isPositive={(kpis?.revenue ?? 0) >= 0}
            icon={DollarSign}
            subtitle="YTD revenue"
            href="/reporting/reports-center/financial-statements/profit-and-loss"
          />
          <StatCard
            title="Net Income"
            value={fmt(kpis?.netIncome ?? 0)}
            isPositive={(kpis?.netIncome ?? 0) >= 0}
            icon={(kpis?.netIncome ?? 0) >= 0 ? TrendingUp : TrendingDown}
            subtitle={`${margin}% margin`}
            href="/reporting/reports-center/financial-statements/profit-and-loss"
          />
          <StatCard
            title="Overdue A/R"
            value={fmt(kpis?.overdueReceivables?.amount ?? 0)}
            isPositive={false}
            icon={ReceiptText}
            subtitle={`${kpis?.overdueReceivables?.count ?? 0} invoices`}
            href="/sales/collections/ar-aging"
          />
          <StatCard
            title="Overdue A/P"
            value={fmt(kpis?.overduePayables?.amount ?? 0)}
            isPositive={false}
            icon={ShoppingCart}
            subtitle={`${kpis?.overduePayables?.count ?? 0} bills`}
            href="/expenses/payables/bills"
          />
          <StatCard
            title="Cash Balance"
            value={fmt(cash?.totalBalance ?? kpis?.bankBalance ?? 0)}
            isPositive={(cash?.totalBalance ?? kpis?.bankBalance ?? 0) >= 0}
            icon={Wallet}
            subtitle={`${cash?.accounts?.length ?? 0} bank accounts`}
            href="/banking-cash/cash-accounts/bank-accounts"
          />
        </div>
      )}

      {/* Summary bar */}
      {!loading && kpis && (
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-emerald-950">YTD Summary</h2>
            <span className="text-xs text-slate-400">
              {kpis.period?.start && kpis.period?.end
                ? `${format(new Date(kpis.period.start), 'MMM d')} – ${format(new Date(kpis.period.end), 'MMM d, yyyy')}`
                : 'Year-to-date'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-2xl font-extrabold text-emerald-700">{fmt(kpis.revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Expenses</p>
              <p className="text-2xl font-extrabold text-rose-600">{fmt(kpis.expenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: (kpis.netIncome ?? 0) >= 0 ? '#059669' : '#dc2626' }}>
                Net Income
              </p>
              <p className="text-2xl font-extrabold" style={{ color: (kpis.netIncome ?? 0) >= 0 ? '#059669' : '#dc2626' }}>
                {fmt(kpis.netIncome)}
              </p>
            </div>
          </div>

          {/* Simple visual bar */}
          {kpis.revenue > 0 && (
            <div className="mt-4 flex gap-1 h-3 rounded-full overflow-hidden">
              {kpis.expenses >= kpis.revenue ? (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.7 }}
                  className="bg-rose-500 rounded-full"
                />
              ) : (
                <>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (kpis.expenses / kpis.revenue) * 100)}%` }}
                    transition={{ duration: 0.7 }}
                    className="bg-rose-400 rounded-l-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, ((kpis.revenue - kpis.expenses) / kpis.revenue) * 100)}%` }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="bg-emerald-500 rounded-r-full"
                  />
                </>
              )}
            </div>
          )}
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="text-[10px] text-slate-500">Expenses</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-500">Net Income</span></div>
          </div>
        </div>
      )}

      {/* Overdue alerts + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <h2 className="text-lg font-bold text-emerald-950 mb-4">Attention Required</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {(kpis?.overdueReceivables?.count ?? 0) > 0 && (
                <Link href="/sales/collections/ar-aging" className="block hover:opacity-90 transition-opacity">
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-300">
                    <div className="flex items-center gap-3">
                      <ReceiptText size={16} className="text-amber-600" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Overdue Receivables</p>
                        <p className="text-xs text-amber-600">{kpis?.overdueReceivables?.count} invoice(s) past due</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-amber-700">{fmt(kpis?.overdueReceivables?.amount ?? 0)}</span>
                      <ChevronRight size={14} className="text-amber-500" />
                    </div>
                  </div>
                </Link>
              )}
              {(kpis?.overduePayables?.count ?? 0) > 0 && (
                <Link href="/expenses/payables/ap-aging" className="block hover:opacity-90 transition-opacity">
                  <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl hover:border-rose-300">
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={16} className="text-rose-600" />
                      <div>
                        <p className="text-sm font-bold text-rose-900">Overdue Bills</p>
                        <p className="text-xs text-rose-600">{kpis?.overduePayables?.count} bill(s) past due</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-rose-700">{fmt(kpis?.overduePayables?.amount ?? 0)}</span>
                      <ChevronRight size={14} className="text-rose-500" />
                    </div>
                  </div>
                </Link>
              )}
              {(kpis?.overdueReceivables?.count ?? 0) === 0 && (kpis?.overduePayables?.count ?? 0) === 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-900">No overdue items — you&rsquo;re on track!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <h2 className="text-lg font-bold text-emerald-950 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton icon={FileText} label="New Invoice" href="/sales/billing/invoices/new" />
            <QuickActionButton icon={DollarSign} label="Record Payment" href="/sales/collections/customer-payments" />
            <QuickActionButton icon={Wallet} label="Add Bill" href="/expenses/payables/bills" />
            <QuickActionButton icon={ChevronRight} label="Run Report" href="/reporting/financial-statements" />
          </div>
        </div>
      </div>

      {/* Bank accounts */}
      {!loading && cash && (
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-emerald-950">Bank Accounts</h2>
            <Link href="/banking-cash/cash-accounts/bank-accounts" className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {cash.accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Wallet size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500 mb-1">No bank accounts yet</p>
              <p className="text-xs text-slate-400 mb-3">Add your first account to start tracking your cash flow.</p>
              <Link href="/banking-cash/cash-accounts/bank-accounts" className="text-xs font-bold text-emerald-600 hover:underline">
                Add bank account →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cash.accounts.slice(0, 5).map(acc => (
                <div key={acc.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <p className="text-sm font-semibold text-slate-700">{acc.name}</p>
                  <span className={`text-sm font-black ${Number(acc.balance) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {fmt(Number(acc.balance))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  title, value, isPositive, icon: Icon, subtitle, href,
}: {
  title: string; value: string; isPositive: boolean; icon: any; subtitle: string; href?: string
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-4 rounded-[20px] border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Icon size={16} />
        </div>
        <div className={`text-[10px] font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{subtitle}</p>
        <p className="text-xl font-black text-emerald-950">{value}</p>
        <h3 className="text-[11px] font-bold text-emerald-600/70">{title}</h3>
      </div>
    </motion.div>
  )
  if (href) return <Link href={href} className="block">{inner}</Link>
  return inner
}

function QuickActionButton({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
      <Icon size={16} className="text-emerald-600" />
      <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950">{label}</span>
    </Link>
  )
}
