import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Item Receipts', value: 'item-receipts' },
  { label: 'Stock Movements', value: 'stock-movements' },
  { label: 'Adjustments', value: 'adjustments' },
  { label: 'Transfers', value: 'transfers' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/inventory/stock-operations" />
      <div>{children}</div>
    </>
  )
}
