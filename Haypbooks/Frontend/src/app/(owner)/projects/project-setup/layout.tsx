import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Projects', value: 'projects' },
  { label: 'Templates', value: 'templates' },
  { label: 'Milestones', value: 'milestones' },
  { label: 'Contracts', value: 'contracts' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/projects/project-setup" />
      <div>{children}</div>
    </>
  )
}
