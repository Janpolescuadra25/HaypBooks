'use client'

import Link from 'next/link'
import { PlusCircle, Calendar, FilePlus } from 'lucide-react'

export default function PurchasesBillNewPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Bill</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Enter vendor, line items, due date, and bill number to begin the AP workflow.
          </p>
        </div>
        <Link href="/purchases/bills" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
          <PlusCircle size={16} /> Back to Bills
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <FilePlus size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold">Bill details</p>
            <p className="text-xs text-slate-500">Vendor selection, multiple line items, tax, and due date will be supported here.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Vendor</p>
            <p className="mt-2 text-sm text-slate-500">Search and select vendors from the AP vendor directory.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Due date</p>
            <p className="mt-2 text-sm text-slate-500">Select the bill's due date and payment terms.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Lines</p>
            <p className="mt-2 text-sm text-slate-500">Add description, quantity, unit cost, tax, and account allocation.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Bill number</p>
            <p className="mt-2 text-sm text-slate-500">Enter the vendor bill number or auto-generate one on approval.</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          <Calendar className="mx-auto mb-3" size={24} />
          <p className="text-sm">This page is a UI scaffold. Business logic and API wiring will follow the existing AP module patterns.</p>
        </div>
      </div>
    </div>
  )
}
