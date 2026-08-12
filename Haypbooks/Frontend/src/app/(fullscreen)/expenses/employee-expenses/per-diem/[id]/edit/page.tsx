'use client'

import { useParams } from 'next/navigation'
import PerDiemForm from '@/components/expenses/PerDiemForm'

export default function EditPerDiemPage() {
  const params = useParams<{ id: string }>()
  const perDiemId = params?.id ?? ''
  return <PerDiemForm mode="edit" perDiemId={perDiemId} />
}
