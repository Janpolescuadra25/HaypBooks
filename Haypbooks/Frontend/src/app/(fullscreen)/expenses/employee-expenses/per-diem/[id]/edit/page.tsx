'use client'

import { useParams } from 'next/navigation'
import PerDiemForm from '@/components/expenses/PerDiemForm'

export default function EditPerDiemPage() {
  const params = useParams()
  return <PerDiemForm mode="edit" perDiemId={params.id as string} />
}
