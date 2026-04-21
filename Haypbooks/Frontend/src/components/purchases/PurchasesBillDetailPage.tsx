'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatCurrency } from '@/lib/format'

type Props = { billId: string }

type BillData = {
  id: string
  status: string
  total: number
  balance: number
  vendorName: string
  description?: string
  dueDate?: string
  issuedAt?: string
  approvedAt?: string
  postingStatus?: string
  lines?: Array<{ id: string; description?: string; quantity?: number; rate?: number; amount?: number }>
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
}

export default function PurchasesBillDetailPage({ billId }: Props) {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [bill, setBill] = useState<BillData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }, [])

  const fetchBill = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/bills/${billId}`)
      setBill({
        ...data,
        total: Number(data.total ?? 0),
        balance: Number(data.balance ?? 0),
        vendorName: data.vendorName ?? data.vendor?.contact?.displayName ?? '',
        dueDate: data.dueDate ?? data.dueAt ?? data.date,
        issuedAt: data.date ?? data.issuedAt,
        approvedAt: data.approvedAt,
      })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load bill')
      setBill(null)
    } finally {
      setLoading(false)
    }
  }, [billId, companyId])

  useEffect(() => {
    fetchBill()
  }, [fetchBill])

  const handleApprove = async () => {
    if (!companyId) return
    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ap/bills/${billId}/approve`)
      showToast('Bill approved successfully')
      await fetchBill()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to approve bill')
    } finally {
      setSaving(false)
    }
  }

  const statusLabel = bill?.status === 'APPROVED' ? 'Approved' : bill?.status === 'DRAFT' ? 'Draft' : bill?.status ?? 'Unknown'
  const isDraft = bill?.status === 'DRAFT'

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bill Detail</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Viewing bill <span className="font-semibold text-slate-900">{billId}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/purchases/bills" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to Bills
          </Link>
          <button
            onClick={fetchBill}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold">Bill overview</p>
                <p className="text-xs text-slate-500">Approve and view the general ledger posting status for this bill.</p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Loading bill...</div>
            ) : bill ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{statusLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Posting Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{bill.postingStatus ?? '-'}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vendor</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{bill.vendorName || '-'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(bill.total, currency)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Issued</p>
                    <p className="mt-2 text-slate-900">{formatDate(bill.issuedAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Due</p>
                    <p className="mt-2 text-slate-900">{formatDate(bill.dueDate)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approved</p>
                    <p className="mt-2 text-slate-900">{bill.approvedAt ? formatDate(bill.approvedAt) : 'Not yet'}</p>
                  </div>
                </div>

                {bill.description ? (
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Memo</p>
                    <p className="mt-2 text-slate-900 whitespace-pre-wrap">{bill.description}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-rose-50 p-6 text-rose-700">{error || 'Bill not found.'}</div>
            )}
          </div>

          {bill && isDraft && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Approval</p>
                  <p className="text-xs text-slate-500">Approve this draft bill to post it to the general ledger.</p>
                </div>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Approving…' : 'Approve Bill'}
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
            </div>
          )}

          {!bill?.status && !loading && !error && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
              <Clock size={16} className="inline-block mr-2" /> Waiting for bill details.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
              <CheckCircle size={16} /> GL posting status
            </div>
            <p>This page shows the selected bill and allows approval when the bill is still a draft.</p>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-xl">{toast}</div>
      )}
    </div>
  )
}
