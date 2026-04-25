import { ReactNode } from 'react'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Expense Reports', value: 'expenses' },
  { label: 'Receipts', value: 'receipts' },
  { label: 'Mileage', value: 'mileage' },
  { label: 'Per Diem', value: 'per-diem' },
  { label: 'Reimbursements', value: 'reimbursements' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        <ModuleTabs tabs={TABS} basePath="/expenses/employee-expenses" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
