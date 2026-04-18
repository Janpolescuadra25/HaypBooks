import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Warehouses', value: 'warehouse-list' },
  { label: 'Bin Locations', value: 'bin-locations' },
  { label: 'Zones', value: 'zones' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/inventory/warehouses" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
