'use client'

import Link from 'next/link'
import { FileText, Plus, Clock, Truck } from 'lucide-react'

export default function PurchasesBillsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Track bills from vendor invoices through approval and payment in Accounts Payable.
          </p>
        </div>
        <Link href="/purchases/bills/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
          <Plus size={16} /> Create Bill
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">Draft / Approved / Paid</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Next Step</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">Create a new bill and route it for approval.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">A/P Aging</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">Reporting page will expose overdue buckets.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold">Bill list placeholder</p>
            <p className="text-xs text-slate-500">This stub page will be replaced with a fully interactive bill table and action panel.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-lg font-semibold">
            <Clock size={18} /> Draft, Approve, Pay
          </div>
          <p className="mt-3">Detailed bill and payment workflows will be scaffolded here.</p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-slate-600">
            <Truck size={16} /> Uses existing AP APIs and GL posting flows.
          </div>
        </div>
      </div>
    </div>
  )
}
