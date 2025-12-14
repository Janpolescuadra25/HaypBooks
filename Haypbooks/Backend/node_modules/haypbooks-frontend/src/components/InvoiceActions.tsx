'use client'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'

export default function InvoiceActions({ id, canWrite }: { id: string; canWrite: boolean }) {
  const router = useRouter()
  if (!canWrite) return null
  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => router.push(toHref(`/invoices/${id}/edit`))}
        aria-label="Edit invoice"
      >Edit</button>
      <button
        type="button"
        className="btn-secondary"
        onClick={async () => {
          const ok = typeof window !== 'undefined' ? window.confirm('Delete this invoice? This cannot be undone in the mock.') : true
          if (!ok) return
          const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
          if (res.ok) router.push(toHref('/invoices'))
        }}
        aria-label="Delete invoice"
      >Delete</button>
    </div>
  )
}
