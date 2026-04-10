import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Bills', value: 'bills' },
  { label: 'Recurring Bills', value: 'recurring-bills' },
  { label: 'Bill Payments', value: 'bill-payments' },
  { label: 'Payment Runs', value: 'payment-runs' },
  { label: 'Vendor Credits', value: 'vendor-credits' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/expenses/payables" />
      <div>{children}</div>
    </>
  )
}
