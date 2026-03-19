"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// legacy placeholder route for wildcard segments under practice-hub
// redirect anywhere unknown back to dashboard which is now fully implemented
export default function PracticeHubPlaceholder() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/practice-hub')
  }, [router])
  return null
}
