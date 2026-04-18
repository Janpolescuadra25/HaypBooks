import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Credit Notes', value: 'credit-notes' },
  { label: 'Revenue Recognition', value: 'recognition' },
  { label: 'Deferred Revenue', value: 'deferred' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <SectionModuleTabs tabs={TABS} basePath="/sales/revenue" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
