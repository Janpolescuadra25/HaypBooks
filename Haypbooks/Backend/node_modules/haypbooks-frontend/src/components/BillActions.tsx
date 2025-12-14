"use client"
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { useTransition } from 'react'

export default function BillActions({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const onEdit = () => router.push(toHref(`/bills/${id}/edit`))
  const onDelete = () => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this bill?')) return
    start(async () => {
      await fetch(`/api/bills/${id}`, { method: 'DELETE' })
      router.push(toHref('/bills'))
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 items-center">
      <button type="button" className="btn-secondary" aria-label="Edit bill" onClick={onEdit} disabled={pending}>Edit</button>
      <button type="button" className="btn-secondary" aria-label="Delete bill" onClick={onDelete} disabled={pending}>Delete</button>
    </div>
  )
}
