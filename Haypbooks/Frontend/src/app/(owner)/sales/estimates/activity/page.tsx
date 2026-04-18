import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Quotes Activity Log"
      subtitle="Track quote creation, updates, and conversion events."
      backHref="/sales/sales/quotes"
      entityType="Quote"
      emptyMessage="No quote activity recorded yet."
      searchPlaceholder="Search quote activity..."
    />
  )
}
