import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Approvals Activity Log"
      subtitle="Review procurement approval activity."
      backHref="/expenses/procurement/approvals"
      entityType="ProcurementApproval"
      emptyMessage="No procurement approval activity recorded yet."
      searchPlaceholder="Search procurement approval activity..."
    />
  )
}
