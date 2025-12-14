import TaxesNav from '@/components/TaxesNav'
import Link from 'next/link'
import type { Route } from 'next'

export default function TaxesSalesTaxPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><TaxesNav activeHref="/taxes/sales-tax" /></div>
      <div className="glass-card">
        <h2 className="text-slate-900 font-semibold mb-2">Sales tax / VAT/GST</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Link href={"/reports/tax-summary" as Route} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Tax Summary
          </Link>
          <Link href={"/reports/tax-detail" as Route} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Tax Detail
          </Link>
          <Link href={"/reports/tax-liability" as Route} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Tax Liability
          </Link>
        </div>
      </div>
    </div>
  )
}
