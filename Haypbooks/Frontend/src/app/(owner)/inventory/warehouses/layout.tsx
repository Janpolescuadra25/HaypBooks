import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Warehouses', value: 'warehouse-list' },
  { label: 'Bin Locations', value: 'bin-locations' },
  { label: 'Zones', value: 'zones' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/inventory/warehouses" />
      <div>{children}</div>
    </>
  )
}
