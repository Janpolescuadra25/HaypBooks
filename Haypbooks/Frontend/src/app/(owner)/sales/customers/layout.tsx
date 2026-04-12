import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Customers', value: 'customers', path: '/sales/customers' },
  { label: 'Groups', value: 'groups' },
  { label: 'Portal', value: 'portal' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/customers" />
      <div>{children}</div>
    </>
  )
}
