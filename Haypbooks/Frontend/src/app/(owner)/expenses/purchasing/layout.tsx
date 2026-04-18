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
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={TABS} basePath="/expenses/purchasing" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
