import BillDetailPage from '@/components/expenses/BillDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <BillDetailPage billId={params.id} />
}
