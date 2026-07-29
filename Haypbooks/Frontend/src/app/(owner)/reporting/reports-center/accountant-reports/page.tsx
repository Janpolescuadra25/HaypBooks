import Link from 'next/link'
import { Scale, BookOpen, ArrowRight } from 'lucide-react'

const reports = [
  {
    title: 'Trial Balance',
    description: 'All accounts with their debit and credit balances',
    href: '/reporting/reports-center/accountant-reports/trial-balance',
    icon: Scale,
  },
  {
    title: 'General Ledger',
    description: 'Detailed journal entry history for all accounts',
    href: '/reporting/reports-center/accountant-reports/general-ledger',
    icon: BookOpen,
  },
]

export default function Page() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Accountant Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed accounting reports and ledgers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Link key={r.title} href={r.href} className="block">
            <div className="p-6 bg-white rounded-[20px] border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4">
                <r.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{r.description}</p>
              <div className="flex items-center text-xs font-medium text-emerald-600">
                View report <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
