import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Bank Transactions Activity Log"
      subtitle="Track categorization, matching, transfer, and reconciliation changes."
      backHref="/banking/transactions"
      entityType="BankTransaction"
      emptyMessage="No bank transaction activity recorded yet."
      searchPlaceholder="Search transaction activity..."
    />
  )
}
