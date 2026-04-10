import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Rules',          value: 'rules' },
  { label: 'Rule Templates', value: 'rule-templates' },
  { label: 'CSV Upload',     value: 'csv-upload' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/bank-rules" />
      <div>{children}</div>
    </>
  )
}
