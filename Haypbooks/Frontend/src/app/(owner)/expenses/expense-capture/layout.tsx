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
    <>
      <ModuleTabs tabs={TABS} basePath="/expenses/expense-capture" />
      <div>{children}</div>
    </>
  )
}
