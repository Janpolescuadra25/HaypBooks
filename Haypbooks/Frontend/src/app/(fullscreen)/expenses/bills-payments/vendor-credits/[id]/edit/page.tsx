import VendorCreditForm from '@/components/expenses/VendorCreditForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <VendorCreditForm mode="edit" creditId={params.id} />
}
