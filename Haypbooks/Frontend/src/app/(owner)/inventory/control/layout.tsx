import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Cycle Counts', value: 'cycle-counts' },
  { label: 'Physical Counts', value: 'physical-counts' },
  { label: 'Lot/Serial Tracking', value: 'lot-serial-tracking' },
  { label: 'Reorder Points', value: 'reorder-points' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/inventory/control" />
      <div>{children}</div>
    </>
  )
}
