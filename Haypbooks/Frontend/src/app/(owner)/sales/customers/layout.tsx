import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Customers', value: 'customers', path: '/sales/customers' },
  { label: 'Groups', value: 'groups' },
  { label: 'Portal', value: 'portal' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionModuleTabs tabs={TABS} basePath="/sales/customers" />
      <div>{children}</div>
    </>
  )
}
