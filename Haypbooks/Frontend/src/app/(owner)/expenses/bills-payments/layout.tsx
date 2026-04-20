import { ReactNode } from 'react'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Bills', value: 'bills' },
  { label: 'Recurring Bills', value: 'recurring-bills' },
  { label: 'Bill Payments', value: 'bill-payments' },
  { label: 'Payment Runs', value: 'payment-runs' },
  { label: 'Vendor Credits', value: 'vendor-credits' },
  { label: 'A/P Aging', value: 'ap-aging' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        <ModuleTabs tabs={TABS} basePath="/expenses/bills-payments" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
