import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Payment Runs Activity Log"
      subtitle="Review payment batch creation and execution activity."
      backHref="/expenses/bills-payments/payment-runs"
      entityType="PaymentRun"
      emptyMessage="No payment run activity recorded yet."
      searchPlaceholder="Search payment run activity..."
    />
  )
}
