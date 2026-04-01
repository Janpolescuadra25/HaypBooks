"use client"
import React from 'react'

export default function HubSelectionLayout({ children }: { children: React.ReactNode }) {
  // Use a full-page scaffold similar to the signup flow so the hub selection feels like a
  // full-page experience with the page-level scrollbar on the right side.
  // We intentionally do NOT mutate document.documentElement.style.overflowY here so the
  // browser's native scrollbar is used when content overflows.
  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  )
}
