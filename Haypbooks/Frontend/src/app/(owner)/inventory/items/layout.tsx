import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Inventory Items', value: 'item-list' },
  { label: 'Categories', value: 'categories' },
  { label: 'Bundles', value: 'bundles' },
  { label: 'Units', value: 'units' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/inventory/items" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
