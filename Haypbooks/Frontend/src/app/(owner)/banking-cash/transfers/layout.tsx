import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Fund Transfers',   value: 'fund-transfers' },
  { label: 'Transfer History', value: 'transfer-history' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/transfers" />
      <div>{children}</div>
    </>
  )
}
