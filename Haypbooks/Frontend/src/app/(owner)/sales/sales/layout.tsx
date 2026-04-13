import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Products & Services', value: 'products-services' },
  { label: 'Quotes', value: 'quotes' },
  { label: 'Sales Orders', value: 'orders' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionModuleTabs tabs={TABS} basePath="/sales/sales" />
      <div>{children}</div>
    </>
  )
}
