import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Reimbursements Activity Log"
      subtitle="Review reimbursement processing activity."
      backHref="/expenses/employee-expenses/reimbursements"
      entityType="Reimbursement"
      emptyMessage="No reimbursement activity recorded yet."
      searchPlaceholder="Search reimbursement activity..."
    />
  )
}
