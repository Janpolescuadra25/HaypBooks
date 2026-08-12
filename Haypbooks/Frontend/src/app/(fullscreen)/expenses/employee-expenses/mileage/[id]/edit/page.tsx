'use client'

import { useParams } from 'next/navigation'
import MileageForm from '@/components/expenses/MileageForm'

export default function EditMileagePage() {
  const params = useParams<{ id: string }>()
  const logId = params?.id ?? ''
  return <MileageForm mode="edit" logId={logId} />
}
