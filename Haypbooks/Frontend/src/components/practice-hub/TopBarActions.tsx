"use client"

/**
 * TopBarActions – user-facing action buttons rendered in the Practice Hub top bar
 * (profile avatar, hub-switcher shortcut, and sign-out shortcut).
 */

import { useRouter } from 'next/navigation'

export default function TopBarActions() {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2 ml-1">
      {/* User avatar / profile */}
      <button
        aria-label="Account menu"
        onClick={() => router.push('/practice-hub/settings')}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        A
      </button>
    </div>
  )
}
