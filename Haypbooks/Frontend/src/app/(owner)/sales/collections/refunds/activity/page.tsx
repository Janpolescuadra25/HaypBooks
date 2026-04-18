import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Refunds Activity Log"
      subtitle="Track refund approvals, processing steps, and status changes."
      backHref="/sales/collections/refunds"
      entityType="CustomerRefund"
      emptyMessage="No refund activity recorded yet."
      searchPlaceholder="Search refund activity..."
    />
  )
}
