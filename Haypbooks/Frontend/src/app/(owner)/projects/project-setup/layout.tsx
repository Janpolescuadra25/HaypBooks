import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Projects', value: 'projects' },
  { label: 'Templates', value: 'templates' },
  { label: 'Milestones', value: 'milestones' },
  { label: 'Contracts', value: 'contracts' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/projects/project-setup" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
