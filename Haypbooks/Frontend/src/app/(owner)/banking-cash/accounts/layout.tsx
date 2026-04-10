import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Bank Accounts', value: 'bank-accounts' },
  { label: 'Credit Cards', value: 'credit-cards' },
  { label: 'Petty Cash', value: 'petty-cash' },
  { label: 'Clearing Accounts', value: 'clearing-accounts' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/accounts" />
      <div>{children}</div>
    </>
  )
}
