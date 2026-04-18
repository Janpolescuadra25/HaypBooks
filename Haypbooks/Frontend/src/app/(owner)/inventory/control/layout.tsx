import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Cycle Counts', value: 'cycle-counts' },
  { label: 'Physical Counts', value: 'physical-counts' },
  { label: 'Lot/Serial Tracking', value: 'lot-serial-tracking' },
  { label: 'Reorder Points', value: 'reorder-points' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/inventory/control" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
