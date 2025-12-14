"use client"
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LegacyMatchRedirect() {
  const router = useRouter()
  const sp = useSearchParams()
  useEffect(() => {
    const qs = new URLSearchParams()
    qs.set('bankStatus', 'for_review')
    if (sp.get('txnId')) qs.set('notice', 'Match is now inline. Use Options → Match on the row.')
    else qs.set('notice', 'Match is now inline under Options.')
    router.replace(`/bank-transactions?${qs.toString()}` as any)
  }, [router, sp])
  return null
}
