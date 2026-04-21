'use client'

import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle } from 'lucide-react'

type Props = { billId: string }

export default function PurchasesBillDetailPage({ billId }: Props) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bill Detail</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Viewing details for bill <span className="font-semibold text-slate-900">{billId}</span>.
          </p>
        </div>
        <Link href="/purchases/bills" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
          <ArrowLeft size={16} /> Back to Bills
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold">Bill overview</p>
            <p className="text-xs text-slate-500">Approve, pay, or void vendor bills from this screen.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Draft / Approved</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Amount due</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">$0.00</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vendor</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Placeholder vendor</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          <CheckCircle className="mx-auto mb-3" size={24} />
          <p className="text-sm">Bill detail UI is stubbed. Billing workflows and GL posting will connect to the backend AP module next.</p>
        </div>
      </div>
    </div>
  )
}
