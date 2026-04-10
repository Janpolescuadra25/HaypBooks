import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Time Entries', value: 'time-entries' },
  { label: 'Timesheets', value: 'timesheets' },
  { label: 'Timer', value: 'timer' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/time/entry" />
      <div>{children}</div>
    </>
  )
}
