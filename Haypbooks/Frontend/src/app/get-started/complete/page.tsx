"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanyCompletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function redirect() {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) {
          router.replace('/hub')
          return
        }
        const json = await res.json()
        const firstCompanyId = json?.companies?.[0]?.id
        if (firstCompanyId) {
          router.replace(`/hub?companyId=${firstCompanyId}`)
        } else {
          router.replace('/hub')
        }
      } catch (e) {
        console.warn('[CompanyCompletePage] redirect failed', e)
        router.replace('/hub')
      } finally {
        setLoading(false)
      }
    }
    redirect()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
  }
  return null
}
