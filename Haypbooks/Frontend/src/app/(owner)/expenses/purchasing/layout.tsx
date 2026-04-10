import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Vendors', value: 'vendors' },
  { label: 'Purchase Requests', value: 'purchase-requests' },
  { label: 'Orders', value: 'orders' },
  { label: 'RFQ', value: 'rfq' },
  { label: 'Approvals', value: 'approvals' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/expenses/purchasing" />
      <div>{children}</div>
    </>
  )
}
