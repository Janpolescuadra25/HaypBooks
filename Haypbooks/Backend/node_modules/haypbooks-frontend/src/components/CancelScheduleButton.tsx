"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CancelScheduleButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function onClick() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/bills/${id}/schedule`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel')
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={onClick} className="btn-secondary text-xs" disabled={loading}>{loading ? 'Cancelling…' : 'Cancel'}</button>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  )
}
