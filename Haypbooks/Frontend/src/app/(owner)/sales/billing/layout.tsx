import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Invoices', value: 'invoices' },
  { label: 'Recurring Invoices', value: 'recurring-invoices' },
  { label: 'Subscriptions', value: 'subscriptions' },
  { label: 'Payment Links', value: 'payment-links' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/billing" />
      <div>{children}</div>
    </>
  )
}
