import RfqForm from '@/components/expenses/RfqForm'
import { use } from 'react'

export default function EditRfqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <RfqForm mode="edit" rfqId={id} />
}
