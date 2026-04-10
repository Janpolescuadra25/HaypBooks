import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Credit Notes', value: 'credit-notes' },
  { label: 'Revenue Recognition', value: 'revenue-recognition' },
  { label: 'Deferred Revenue', value: 'deferred-revenue' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/revenue" />
      <div>{children}</div>
    </>
  )
}
