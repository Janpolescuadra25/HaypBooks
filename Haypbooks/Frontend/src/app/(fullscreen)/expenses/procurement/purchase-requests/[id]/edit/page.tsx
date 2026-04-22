import PurchaseRequestForm from '@/components/expenses/PurchaseRequestForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <PurchaseRequestForm mode="edit" prId={params.id} />
}
