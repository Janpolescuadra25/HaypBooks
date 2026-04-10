import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Tasks', value: 'task-list' },
  { label: 'Schedule', value: 'schedule' },
  { label: 'Resource Planning', value: 'resource-planning' },
  { label: 'Time & Expenses', value: 'time-expenses' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/projects/tasks" />
      <div>{children}</div>
    </>
  )
}
