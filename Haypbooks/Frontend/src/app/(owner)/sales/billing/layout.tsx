import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Invoices', value: 'invoices' },
  { label: 'Recurring Invoices', value: 'recurring' },
  { label: 'Payment Links', value: 'payment-links' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <SectionModuleTabs tabs={TABS} basePath="/sales/billing" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
