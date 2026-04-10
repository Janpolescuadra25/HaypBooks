import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Valuation', value: 'inventory-valuation' },
  { label: 'Landed Costs', value: 'landed-costs' },
  { label: 'Cost Adjustments', value: 'cost-adjustments' },
  { label: 'Write-Downs', value: 'write-downs' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/inventory/valuation" />
      <div>{children}</div>
    </>
  )
}
