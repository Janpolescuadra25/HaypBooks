import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="RFQs Activity Log"
      subtitle="Review RFQ creation and vendor response activity."
      backHref="/expenses/procurement/rfq"
      entityType="Rfq"
      emptyMessage="No rfq activity recorded yet."
      searchPlaceholder="Search rfq activity..."
    />
  )
}
