import SectionModuleTabs from '@/components/shared/SectionModuleTabs'

const TABS = [
  { label: 'Invoices', value: 'invoices' },
  { label: 'Recurring Invoices', value: 'recurring' },
  { label: 'Payment Links', value: 'payment-links' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionModuleTabs tabs={TABS} basePath="/sales/billing" />
      <div>{children}</div>
    </>
  )
}
