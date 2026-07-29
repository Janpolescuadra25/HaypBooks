import Link from 'next/link'
import { FileText, BookOpen, ClipboardList, BarChart3, Settings } from 'lucide-react'

const categories = [
  {
    title: 'Financial Statements',
    description: 'Balance Sheet, Profit & Loss, and Cash Flow',
    href: '/reporting/reports-center/financial-statements',
    icon: FileText,
    available: true,
  },
  {
    title: 'Accountant Reports',
    description: 'Trial Balance and General Ledger',
    href: '/reporting/reports-center/accountant-reports',
    icon: BookOpen,
    available: true,
  },
  {
    title: 'Operational Reports',
    description: 'Banking, Sales, Expense, Inventory, Project, Payroll',
    icon: ClipboardList,
    available: false,
  },
  {
    title: 'Analytics',
    description: 'KPI Dashboard',
    icon: BarChart3,
    available: false,
  },
  {
    title: 'Custom Reports',
    description: 'Report Builder and Scheduled Reports',
    icon: Settings,
    available: false,
  },
]

export default function Page() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports Center</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your financial and operational reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const inner = (
            <div
              className={`p-6 rounded-[20px] border transition-all ${
                cat.available
                  ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    cat.available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <cat.icon size={20} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.available ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  {cat.available ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              <h3 className={`text-sm font-bold mb-1 ${cat.available ? 'text-slate-900' : 'text-slate-500'}`}>
                {cat.title}
              </h3>
              <p className="text-xs text-slate-500">{cat.description}</p>
            </div>
          )
          if (cat.available) {
            return (
              <Link key={cat.title} href={cat.href!} className="block">
                {inner}
              </Link>
            )
          }
          return <div key={cat.title}>{inner}</div>
        })}
      </div>
    </div>
  )
}
