import { ReactNode } from 'react'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Vendors', value: 'vendors' },
  { label: 'Purchase Requests', value: 'purchase-requests' },
  { label: 'Orders', value: 'orders' },
  { label: 'RFQ', value: 'rfq' },
  { label: 'Approvals', value: 'approvals' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        <ModuleTabs tabs={TABS} basePath="/expenses/purchasing" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
