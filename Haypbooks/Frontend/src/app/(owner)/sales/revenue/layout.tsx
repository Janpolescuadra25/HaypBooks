import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Credit Notes', value: 'credit-notes' },
  { label: 'Revenue Recognition', value: 'recognition' },
  { label: 'Deferred Revenue', value: 'deferred' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionModuleTabs tabs={TABS} basePath="/sales/revenue" />
      <div>{children}</div>
    </>
  )
}
