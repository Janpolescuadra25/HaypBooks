import PurchaseOrderDetailPage from '@/components/expenses/PurchaseOrderDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <PurchaseOrderDetailPage purchaseOrderId={params.id} />
}
