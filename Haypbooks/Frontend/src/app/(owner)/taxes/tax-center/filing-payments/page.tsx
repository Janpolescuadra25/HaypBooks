'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, FileText, Landmark } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { taxService } from '@/services/tax.service'
import { formatCurrency } from '@/lib/format'

function formatPeriod(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()
  const startLabel = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endLabel = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: sameMonth ? undefined : 'numeric' })
  return `${startLabel} – ${endLabel}, ${endDate.getFullYear()}`
}

function remittanceBadge(type: string) {
  switch (type) {
    case 'SSS':
      return 'bg-blue-100 text-blue-700'
    case 'PHILHEALTH':
      return 'bg-emerald-100 text-emerald-700'
    case 'PAGIBIG':
      return 'bg-purple-100 text-purple-700'
    case 'BIR':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

export default function FilingPaymentsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [batch, setBatch] = useState<any | null>(null)
  const [remittances, setRemittances] = useState<any[]>([])
  const [remittanceStatus, setRemittanceStatus] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: batchData }, { data: remittanceData }] = await Promise.all([
        taxService.getFilingBatch(companyId),
        taxService.getRemittances(companyId, remittanceStatus === 'All' ? undefined : remittanceStatus),
      ])
      setBatch(batchData)
      const remittanceList = Array.isArray(remittanceData) ? remittanceData : (remittanceData?.data ?? [])
      setRemittances(remittanceList.sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()))
    } catch (err: any) {
      setError(err?.message || 'Failed to load filing and payments data')
    } finally {
      setLoading(false)
    }
  }, [companyId, remittanceStatus])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchData()
  }, [companyLoading, companyId, fetchData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Filing & Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage tax filing batches and government remittances</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Current Filing Batch</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{batch?.totalItems ?? 0} items</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6 p-5">
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">DRAFT VAT Returns</h3>
              </div>
              {!batch?.vatReturns?.length ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <FileText className="h-8 w-8 mb-2 text-slate-300" />
                  <p className="text-sm">No DRAFT VAT returns</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Tax</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Lines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.vatReturns.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 text-slate-700">{formatPeriod(item.periodStart, item.periodEnd)}</td>
                          <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.totalTax), currency)}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{item.status}</span>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-700">{item.lines?.length ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Form 2307 Certificates</h3>
              </div>
              {!batch?.form2307s?.length ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <FileText className="h-8 w-8 mb-2 text-slate-300" />
                  <p className="text-sm">No Form 2307 certificates</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Certificate No.</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Gross Amount</th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tax Withheld</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Issued</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.form2307s.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">{item.certificateNumber}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{item.period}</td>
                          <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.amount), currency)}</td>
                          <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.withheldAmount), currency)}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{item.issuedAt ? new Date(item.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Government Remittances</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !remittances.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Landmark className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No remittances found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Employee Share</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Employer Share</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Penalty</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Paid</th>
                </tr>
              </thead>
              <tbody>
                {remittances.map((item) => {
                  const dueDate = new Date(item.dueDate)
                  const isPastDue = !item.paidAt && dueDate.getTime() < new Date().getTime()
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${remittanceBadge(item.remittanceType)}`}>
                          {item.remittanceType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{item.period}</td>
                      <td className={`px-5 py-3 ${isPastDue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>{new Date(item.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.employeeShare), currency)}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.employerShare), currency)}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-semibold">{formatCurrency(Number(item.totalAmount), currency)}</td>
                      <td className="px-5 py-3 text-right text-slate-700">{Number(item.penaltyAmount) > 0 ? <span className="text-rose-600">{formatCurrency(Number(item.penaltyAmount), currency)}</span> : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{item.referenceNo ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-700">{item.paidAt ? new Date(item.paidAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
