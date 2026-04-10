import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'For Review',  value: 'for-review' },
  { label: 'Categorized', value: 'categorized' },
  { label: 'Excluded',    value: 'excluded' },
  { label: 'Register',    value: 'register' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/transactions" />
      <div>{children}</div>
    </>
  )
}
