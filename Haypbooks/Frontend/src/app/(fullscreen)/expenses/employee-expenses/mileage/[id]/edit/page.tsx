'use client'

import { useParams } from 'next/navigation'
import MileageForm from '@/components/expenses/MileageForm'

export default function EditMileagePage() {
  const params = useParams()
  return <MileageForm mode="edit" logId={params.id as string} />
}
