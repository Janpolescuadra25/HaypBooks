import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Project Profitability', value: 'profitability' },
  { label: 'Budget vs Actual', value: 'budget-vs-actual' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/projects/financials" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
