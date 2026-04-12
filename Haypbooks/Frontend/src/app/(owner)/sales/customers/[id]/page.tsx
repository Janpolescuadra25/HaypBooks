import CustomerDetailPage from '@/components/sales/CustomerDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerDetailPage customerId={params.id} />
}
