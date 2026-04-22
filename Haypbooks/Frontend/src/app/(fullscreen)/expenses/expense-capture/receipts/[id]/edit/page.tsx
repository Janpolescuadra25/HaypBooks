import ReceiptForm from '@/components/expenses/ReceiptForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <ReceiptForm mode="edit" receiptId={params.id} />
}
