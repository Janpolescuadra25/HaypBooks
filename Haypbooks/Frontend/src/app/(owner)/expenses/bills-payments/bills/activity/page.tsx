import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Bills Activity Log"
      subtitle="Review bill creation, approval, and payment activity."
      backHref="/expenses/bills-payments/bills"
      entityType="Bill"
      emptyMessage="No bill activity recorded yet."
      searchPlaceholder="Search bill activity..."
    />
  )
}
