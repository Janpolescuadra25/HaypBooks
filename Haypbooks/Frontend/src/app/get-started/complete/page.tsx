"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanyCompletePage() {
  const router = useRouter()
  useEffect(() => { router.replace('/onboarding') }, [router])
  return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
}
