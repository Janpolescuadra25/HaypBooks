import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Customer Payments Activity Log"
      subtitle="Track received payment updates and applied allocation changes."
      backHref="/sales/collections/payments"
      entityType="CustomerPayment"
      emptyMessage="No customer payment activity recorded yet."
      searchPlaceholder="Search payment activity..."
    />
  )
}
