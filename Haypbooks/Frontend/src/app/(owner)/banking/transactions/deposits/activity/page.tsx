import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Bank Deposits Activity Log"
      subtitle="Track deposit batches, posting actions, and deposit voids."
      backHref="/banking/transactions/deposits"
      entityType="BankDeposit"
      emptyMessage="No bank deposit activity recorded yet."
      searchPlaceholder="Search bank deposit activity..."
    />
  )
}
