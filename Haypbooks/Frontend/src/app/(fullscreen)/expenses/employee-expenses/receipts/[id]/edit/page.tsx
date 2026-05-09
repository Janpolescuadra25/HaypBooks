'use client'

import { useParams } from 'next/navigation'
import ReceiptForm from '@/components/expenses/ReceiptForm'

export default function EditReceiptPage() {
  const params = useParams()
  return <ReceiptForm mode="edit" receiptId={params.id as string} />
}
