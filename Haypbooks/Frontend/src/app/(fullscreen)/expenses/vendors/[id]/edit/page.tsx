import VendorForm from '@/components/expenses/VendorForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <VendorForm mode="edit" vendorId={params.id} />
}
