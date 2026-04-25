import BillPaymentDetailPage from '@/components/expenses/BillPaymentDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <BillPaymentDetailPage paymentId={params.id} />
}
