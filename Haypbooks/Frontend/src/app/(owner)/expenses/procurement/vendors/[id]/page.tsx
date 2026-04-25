import VendorDetailPage from '@/components/expenses/VendorDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <VendorDetailPage vendorId={params.id} />
}
