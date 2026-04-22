import MileageForm from '@/components/expenses/MileageForm'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <MileageForm mode="edit" logId={params.id} />
}
