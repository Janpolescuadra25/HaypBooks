'use client'
import { useState, useEffect, useCallback } from 'react'
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
import { formatCurrency } from '@/lib/format'

interface KpiData {
  revenue: number
  expenses: number
  netIncome: number
  overdueReceivables: { amount: number; count: number }
  overdueBills: { amount: number; count: number }
  generatedAt: string
}

interface CashData {
  accounts: Array<{ id: string; name: string; balance: number }>
  totalBalance: number
}


export default function OwnerDashboard() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = (n: number) => formatCurrency(n, currency)

  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [cash, setCash] = useState<CashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const [kpiRes, cashRes] = await Promise.all([
        apiClient.get(`/companies/${companyId}/reports/kpis`),
        apiClient.get(`/companies/${companyId}/banking/cash-position`),
      ])
      setKpis(kpiRes.data)
      setCash(cashRes.data)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { load() }, [load])

  const margin = kpis && kpis.revenue > 0 ? ((kpis.netIncome / kpis.revenue) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
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
      </header>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
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
          />
          <StatCard
            title="Net Income"
            value={fmt(kpis?.netIncome ?? 0)}
            isPositive={(kpis?.netIncome ?? 0) >= 0}
            icon={(kpis?.netIncome ?? 0) >= 0 ? TrendingUp : TrendingDown}
            subtitle={`${margin}% margin`}
          />
          <StatCard
            title="Overdue A/R"
            value={fmt(kpis?.overdueReceivables?.amount ?? 0)}
            isPositive={false}
            icon={ReceiptText}
            subtitle={`${kpis?.overdueReceivables?.count ?? 0} invoices`}
          />
          <StatCard
            title="Cash Balance"
            value={fmt(cash?.totalBalance ?? 0)}
            isPositive={(cash?.totalBalance ?? 0) >= 0}
            icon={Wallet}
            subtitle={`${cash?.accounts?.length ?? 0} bank accounts`}
          />
        </div>
      )}

      {/* Summary bar */}
      {!loading && kpis && (
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-emerald-950">YTD Summary</h2>
            <span className="text-xs text-slate-400">Year-to-date</span>
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
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ReceiptText size={16} className="text-amber-600" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Overdue Receivables</p>
                      <p className="text-xs text-amber-600">{kpis?.overdueReceivables?.count} invoice(s) past due</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-700">{fmt(kpis?.overdueReceivables?.amount ?? 0)}</span>
                </div>
              )}
              {(kpis?.overdueBills?.count ?? 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={16} className="text-rose-600" />
                    <div>
                      <p className="text-sm font-bold text-rose-900">Overdue Bills</p>
                      <p className="text-xs text-rose-600">{kpis?.overdueBills?.count} bill(s) past due</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-700">{fmt(kpis?.overdueBills?.amount ?? 0)}</span>
                </div>
              )}
              {(kpis?.overdueReceivables?.count ?? 0) === 0 && (kpis?.overdueBills?.count ?? 0) === 0 && (
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
            <QuickActionButton icon={FileText} label="New Invoice" href="/sales/billing/invoices" />
            <QuickActionButton icon={DollarSign} label="Record Payment" href="/sales/collections/customer-payments" />
            <QuickActionButton icon={Wallet} label="Add Bill" href="/expenses/payables/bills" />
            <QuickActionButton icon={ChevronRight} label="Run Report" href="/reporting/financial-statements" />
          </div>
        </div>
      </div>

      {/* Bank accounts */}
      {!loading && cash && cash.accounts.length > 0 && (
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-emerald-950">Bank Accounts</h2>
            <a href="/banking-cash/cash-accounts/bank-accounts" className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </a>
          </div>
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
        </div>
      )}
    </div>
  )
}

function StatCard({
  title, value, isPositive, icon: Icon, subtitle,
}: {
  title: string; value: string; isPositive: boolean; icon: any; subtitle: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-4 rounded-[20px] border border-emerald-50 shadow-sm hover:shadow-md transition-all"
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
}

function QuickActionButton({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
      <Icon size={16} className="text-emerald-600" />
      <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950">{label}</span>
    </a>
  )
}
