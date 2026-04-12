import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Products & Services', value: 'products-services' },
  { label: 'Quotes', value: 'quotes' },
  { label: 'Sales Orders', value: 'orders' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/sales" />
      <div>{children}</div>
    </>
  )
}
