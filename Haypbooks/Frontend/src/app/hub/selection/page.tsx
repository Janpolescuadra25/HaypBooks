"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HubSelectionModal from '@/components/HubSelectionModal'
import { getProfileCached } from '@/lib/profile-cache'

export default function HubSelectionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    getProfileCached().then((p) => { if (mounted) setUser(p) }).catch(() => { if (mounted) setUser(null) })
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Choose how you want to use HaypBooks today</h1>
          <p className="text-sm text-slate-600 mt-1">You can switch anytime from the top-right menu. Only one hub is active at a time.</p>
        </div>

        {/* Reuse the HubSelection UI in page mode */}
        <HubSelectionModal user={user} asPage={true} onClose={() => router.replace('/hub/companies')} />

      </div>
    </main>
  )
}