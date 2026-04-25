import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Receipts Activity Log"
      subtitle="Review receipt upload and processing activity."
      backHref="/expenses/employee-expenses/receipts"
      entityType="Receipt"
      emptyMessage="No receipt activity recorded yet."
      searchPlaceholder="Search receipt activity..."
    />
  )
}
