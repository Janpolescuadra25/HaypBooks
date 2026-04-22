import BillPaymentForm from '@/components/expenses/BillPaymentForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <BillPaymentForm mode="edit" paymentId={params.id} />
}
