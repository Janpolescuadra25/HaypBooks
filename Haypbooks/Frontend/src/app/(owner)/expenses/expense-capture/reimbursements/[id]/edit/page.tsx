import ReimbursementForm from '@/components/expenses/ReimbursementForm'

interface EditReimbursementPageProps {
  params: { id: string }
}

export default function EditReimbursementPage({ params }: EditReimbursementPageProps) {
  return <ReimbursementForm mode="edit" reimbursementId={params.id} />
}
