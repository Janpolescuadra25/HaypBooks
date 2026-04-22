import PurchaseOrderForm from '@/components/expenses/PurchaseOrderForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <PurchaseOrderForm mode="edit" poId={params.id} />
}
