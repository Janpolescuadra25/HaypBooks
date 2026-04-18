import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Expenses', value: 'expenses' },
  { label: 'Receipts', value: 'receipts' },
  { label: 'Mileage', value: 'mileage' },
  { label: 'Per Diem', value: 'per-diem' },
  { label: 'Reimbursements', value: 'reimbursements' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/expenses/expense-capture" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
