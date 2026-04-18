import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Time Entries', value: 'time-entries' },
  { label: 'Timesheets', value: 'timesheets' },
  { label: 'Timer', value: 'timer' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/time/entry" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
