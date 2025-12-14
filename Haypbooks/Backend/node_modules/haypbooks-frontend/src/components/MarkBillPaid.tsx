"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MarkBillPaid({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark as paid')
      // refresh the route data and show the updated status
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={onClick} className="btn-primary" disabled={loading}>
        {loading ? 'Processing…' : 'Mark as paid'}
      </button>
      {error && <span className="text-sm text-rose-700">{error}</span>}
    </div>
  )
}
