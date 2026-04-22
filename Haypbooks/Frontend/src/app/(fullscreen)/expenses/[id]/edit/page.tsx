import ExpenseReportForm from '@/components/expenses/ExpenseReportForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <ExpenseReportForm mode="edit" expenseId={params.id} />
}
