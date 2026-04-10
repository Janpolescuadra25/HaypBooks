import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Products & Services', value: 'products-services' },
  { label: 'Quotes', value: 'quotes' },
  { label: 'Sales Orders', value: 'sales-orders' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/sales-operations" />
      <div>{children}</div>
    </>
  )
}
