'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { onboardingService } from '@/services/onboarding.service'
import OwnerDashboard from '@/components/owner/OwnerDashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: userLoading, serverError } = useUser()
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      if (serverError) {
        // Server is down — do NOT redirect to login; surface error below
        return
      }
      // Unknown user state: fallback to sign in.
      router.replace('/login')
      return
    }

    async function checkSetup() {
      if (!user || user.role !== 'owner') {
        setIsCheckingSetup(false)
        return
      }

      try {
        const progress = await onboardingService.getProgress()
        if (!progress.completed) {
          router.replace('/home/setup-center')
          return
        }
      } catch (err) {
        console.error('Failed to load onboarding progress', err)
      } finally {
        setIsCheckingSetup(false)
      }
    }

    checkSetup()
  }, [user, userLoading, router])

  if (userLoading || isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (serverError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Could not load your account. The server may be temporarily unavailable.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <OwnerDashboard />
}
