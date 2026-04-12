import CustomerGroupDetailPage from '@/components/sales/CustomerGroupDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerGroupDetailPage groupId={params.id} />
}
