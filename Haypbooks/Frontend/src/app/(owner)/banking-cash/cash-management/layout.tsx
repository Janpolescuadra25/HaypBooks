import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Transaction Rules', value: 'transaction-rules' },
  { label: 'Recurring Transactions', value: 'recurring-transactions' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/cash-management" />
      <div>{children}</div>
    </>
  )
}
