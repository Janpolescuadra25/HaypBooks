'use client'

import { useParams } from 'next/navigation'
import ReceiptForm from '@/components/expenses/ReceiptForm'

export default function EditReceiptPage() {
  const params = useParams<{ id: string }>()
  const receiptId = params?.id ?? ''
  return <ReceiptForm mode="edit" receiptId={receiptId} />
}
