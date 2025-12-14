"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reloadPage } from '@/utils/navigation'

export function ReceivePOButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const router = useRouter()
  const onClick = () => router.push(`/purchase-orders/${id}/receive`)
  return <button className="btn-secondary mr-2" onClick={onClick} disabled={disabled}>Receive</button>
}

export function ClosePOButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false)
  const onClick = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/purchase-orders/${id}/close`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      reloadPage()
    } catch (e: any) { alert(e.message || 'Close failed') } finally { setBusy(false) }
  }
  return <button className="btn-secondary" onClick={onClick} disabled={disabled || busy}>{busy ? 'Closing…' : 'Close'}</button>
}
