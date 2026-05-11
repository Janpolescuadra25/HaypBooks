import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Products & Services', value: 'products-services' },
  { label: 'Quotes', value: 'quotes' },
  { label: 'Sales Orders', value: 'orders' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <SectionModuleTabs tabs={TABS} basePath="/sales/opportunities" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
