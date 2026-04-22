import BillForm from '@/components/expenses/BillForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <BillForm mode="edit" billId={params.id} />
}
