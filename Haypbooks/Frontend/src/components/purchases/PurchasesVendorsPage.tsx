'use client'

import Link from 'next/link'
import { Building2, ArrowRight, ClipboardList } from 'lucide-react'

export default function PurchasesVendorsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Manage vendors, update contact details, and review purchase history for your AP workflows.
          </p>
        </div>
        <Link href="/purchases/bills" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
          <ClipboardList size={16} /> View Bills
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold">Vendors</p>
            <p className="text-xs text-slate-500">CRUD operations for vendor contacts and payment terms.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-sm mb-3">This page is a scaffold for the Purchases module.</p>
          <p className="text-slate-900 font-semibold">Vendor creation, editing, and deletion flows will be added next.</p>
        </div>
      </div>
    </div>
  )
}
