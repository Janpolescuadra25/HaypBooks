import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Payments Activity Log"
      subtitle="Review payment recording and processing activity."
      backHref="/expenses/bills-payments/bill-payments"
      entityType="BillPayment"
      emptyMessage="No bill payment activity recorded yet."
      searchPlaceholder="Search bill payment activity..."
    />
  )
}
