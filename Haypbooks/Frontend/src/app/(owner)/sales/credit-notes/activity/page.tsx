import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Credit Notes Activity Log"
      subtitle="Review credit note creations, updates, and status changes."
      backHref="/sales/revenue/credit-notes"
      entityType="CreditNote"
      emptyMessage="No credit note activity recorded yet."
      searchPlaceholder="Search credit note activity..."
    />
  )
}
