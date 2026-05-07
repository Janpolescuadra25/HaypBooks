import ExpenseReportDetailPage from '@/components/expenses/ExpenseReportDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <ExpenseReportDetailPage expenseId={params.id} />
}
