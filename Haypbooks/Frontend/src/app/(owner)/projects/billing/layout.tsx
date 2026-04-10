import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Project Billing', value: 'project-billing' },
  { label: 'Progress Billing', value: 'progress-billing' },
  { label: 'Change Orders', value: 'change-orders' },
  { label: 'WIP', value: 'wip' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/projects/billing" />
      <div>{children}</div>
    </>
  )
}
