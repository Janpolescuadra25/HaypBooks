"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountantOnboardingRedirect() {
  const router = useRouter()
  useEffect(() => {
    try { router.replace('/onboarding/practice') } catch (e) {}
  }, [router])
  return null
}

