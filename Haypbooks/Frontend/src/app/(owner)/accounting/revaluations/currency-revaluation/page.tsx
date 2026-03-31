'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/accounting/revaluations/fx-revaluation')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
      <p className="text-sm">Redirecting to Currency Revaluation…</p>
    </div>
  )
}
