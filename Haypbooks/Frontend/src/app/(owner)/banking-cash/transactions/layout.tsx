import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Bank Transactions', value: 'bank-transactions' },
  { label: 'Connected Transactions', value: 'connected-transactions' },
  { label: 'Transfers', value: 'transfers' },
  { label: 'Deposits', value: 'deposits' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/transactions" />
      <div>{children}</div>
    </>
  )
}
