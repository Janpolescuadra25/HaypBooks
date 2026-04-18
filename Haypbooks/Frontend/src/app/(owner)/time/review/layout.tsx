import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Billable Review', value: 'billable-time-review' },
  { label: 'Time Approvals', value: 'time-approvals' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/time/review" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
