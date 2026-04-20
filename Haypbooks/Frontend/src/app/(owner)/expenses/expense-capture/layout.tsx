import { ReactNode } from 'react'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Expenses', value: 'expenses' },
  { label: 'Receipts', value: 'receipts' },
  { label: 'Mileage', value: 'mileage' },
  { label: 'Per Diem', value: 'per-diem' },
  { label: 'Reimbursements', value: 'reimbursements' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-3">
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Track receipts, mileage, per diem, and reimbursements in one place.</p>
        </div>
        <ModuleTabs tabs={TABS} basePath="/expenses/expense-capture" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
