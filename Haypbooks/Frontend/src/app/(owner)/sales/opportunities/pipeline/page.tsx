'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type QuoteRow = {
  id: string
  quoteNumber?: string
  customer?: string
  status?: string
  amount?: number
}

type InvoiceRow = {
  id: string
  invoiceNumber?: string
  customerName?: string
  status?: string
  amountDue?: number
  total?: number
}

type ActivityLog = {
  id: string
  action: string
  tableName: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { id?: string; name?: string | null; email?: string | null } | null
}

function normalizeQuoteAmount(value: unknown) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

export default function Page() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return

    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [quotesRes, invoicesRes] = await Promise.all([
          salesService.getQuotes(companyId),
          salesService.listArInvoices(companyId),
        ])
        if (!mounted) return

        const quoteRows = Array.isArray(quotesRes.data)
          ? quotesRes.data
          : (quotesRes.data?.items ?? quotesRes.data?.data ?? [])
        const invoiceRows = Array.isArray(invoicesRes.data)
          ? invoicesRes.data
          : (invoicesRes.data?.items ?? invoicesRes.data?.data ?? [])

        setQuotes(quoteRows)
        setInvoices(invoiceRows)
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load pipeline analytics')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [companyId])

  useEffect(() => {
    if (!companyId) return

    let mounted = true
    const loadActivity = async () => {
      setActivityLoading(true)
      try {
        const [quoteLogs, invoiceLogs] = await Promise.all([
          salesService.getAuditLogs(companyId, { tableName: 'Quote', limit: 8 }),
          salesService.getAuditLogs(companyId, { tableName: 'Invoice', limit: 8 }),
        ])
        if (!mounted) return

        const quoteItems = Array.isArray(quoteLogs.data) ? quoteLogs.data : quoteLogs.data?.data ?? quoteLogs.data?.items ?? []
        const invoiceItems = Array.isArray(invoiceLogs.data) ? invoiceLogs.data : invoiceLogs.data?.data ?? invoiceLogs.data?.items ?? []
        const merged = [...quoteItems, ...invoiceItems]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
        setActivity(merged)
      } catch {
        if (!mounted) return
        setActivity([])
      } finally {
        if (mounted) setActivityLoading(false)
      }
    }

    loadActivity()
    return () => { mounted = false }
  }, [companyId])

  const metrics = useMemo(() => {
    const openQuotes = quotes.filter((q) => !['ACCEPTED', 'CONVERTED', 'REJECTED', 'EXPIRED'].includes(String(q.status ?? '').toUpperCase()))
    const wonQuotes = quotes.filter((q) => ['ACCEPTED', 'CONVERTED'].includes(String(q.status ?? '').toUpperCase()))
    const openPipelineValue = openQuotes.reduce((sum, q) => sum + normalizeQuoteAmount(q.amount), 0)

    const overdueInvoices = invoices.filter((inv) => String(inv.status ?? '').toUpperCase() === 'OVERDUE')
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + normalizeQuoteAmount(inv.amountDue ?? inv.total), 0)

    const conversionRate = quotes.length > 0
      ? Math.round((wonQuotes.length / quotes.length) * 100)
      : 0

    const topOpportunities = [...openQuotes]
      .sort((a, b) => normalizeQuoteAmount(b.amount) - normalizeQuoteAmount(a.amount))
      .slice(0, 6)

    const receivableSignals = invoices
      .filter((inv) => ['OVERDUE', 'PARTIALLY_PAID', 'SENT'].includes(String(inv.status ?? '').toUpperCase()))
      .slice(0, 6)

    return {
      openQuotes,
      wonQuotes,
      openPipelineValue,
      overdueInvoices,
      overdueAmount,
      conversionRate,
      topOpportunities,
      receivableSignals,
    }
  }, [quotes, invoices])

  const describeActivity = (entry: ActivityLog) => {
    const entity = entry.tableName === 'Quote' ? 'Quote' : 'Invoice'
    const label = entry.changes?.invoiceNumber ?? entry.recordId.slice(0, 8)
    if (entry.tableName === 'Quote' && entry.action === 'CONVERT') {
      return `Converted ${entity.toLowerCase()} ${label} to invoice`
    }
    if (entry.action === 'SEND') {
      return `Sent ${entity.toLowerCase()} ${label}`
    }
    if (entry.action === 'VOID') {
      return `Voided ${entity.toLowerCase()} ${label}`
    }
    return `${entry.action.charAt(0) + entry.action.slice(1).toLowerCase()} ${entity.toLowerCase()} ${label}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-600 mt-1">
              Live sales momentum from quotes and invoice conversion activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sales/opportunities/quotes" className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              Manage Quotes
            </Link>
            <Link href="/sales/billing/invoices" className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700">
              Open Invoices
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Open Opportunities</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.openQuotes.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pipeline Value</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(metrics.openPipelineValue, currency)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Quote Conversion</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.conversionRate}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Overdue Exposure</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{formatCurrency(metrics.overdueAmount, currency)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Top Opportunities</h2>
              <Link href="/sales/opportunities/quotes" className="text-xs text-emerald-700 hover:underline">View all quotes</Link>
            </div>
            {loading ? (
              <div className="px-4 py-10 text-sm text-slate-500">Loading opportunities…</div>
            ) : error ? (
              <div className="px-4 py-10 text-sm text-rose-600">{error}</div>
            ) : metrics.topOpportunities.length === 0 ? (
              <div className="px-4 py-10 text-sm text-slate-500">No open opportunities yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.topOpportunities.map((q) => (
                  <div key={q.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{q.quoteNumber ?? q.id}</p>
                      <p className="text-xs text-slate-500">{q.customer || 'Unassigned customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(normalizeQuoteAmount(q.amount), currency)}</p>
                      <p className="text-xs text-slate-500">{q.status ?? 'DRAFT'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Collections Signals</h2>
              <Link href="/sales/collections/aging" className="text-xs text-emerald-700 hover:underline">Open aging</Link>
            </div>
            {loading ? (
              <div className="px-4 py-10 text-sm text-slate-500">Loading receivables…</div>
            ) : error ? (
              <div className="px-4 py-10 text-sm text-rose-600">{error}</div>
            ) : metrics.receivableSignals.length === 0 ? (
              <div className="px-4 py-10 text-sm text-slate-500">No receivable signals to review.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.receivableSignals.map((inv) => (
                  <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{inv.invoiceNumber ?? inv.id}</p>
                      <p className="text-xs text-slate-500">{inv.customerName || 'Unassigned customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(normalizeQuoteAmount(inv.amountDue ?? inv.total), currency)}</p>
                      <p className="text-xs text-slate-500">{inv.status ?? 'SENT'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Pipeline Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest quote and invoice events affecting pipeline momentum</p>
            </div>
          </div>
          {activityLoading ? (
            <div className="px-4 py-10 text-sm text-slate-500">Loading activity…</div>
          ) : activity.length === 0 ? (
            <div className="px-4 py-10 text-sm text-slate-500">No recent quote or invoice activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activity.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${entry.tableName === 'Quote' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
                        {entry.tableName}
                      </span>
                      <p className="text-sm font-medium text-slate-900">{describeActivity(entry)}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
