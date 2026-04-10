import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Project Profitability', value: 'profitability' },
  { label: 'Budget vs Actual', value: 'budget-vs-actual' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/projects/financials" />
      <div>{children}</div>
    </>
  )
}
