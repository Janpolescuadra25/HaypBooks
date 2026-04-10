import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Undeposited Funds', value: 'undeposited-funds' },
  { label: 'Bank Deposits',     value: 'bank-deposits' },
  { label: 'Deposit History',   value: 'deposit-history' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/deposits" />
      <div>{children}</div>
    </>
  )
}
