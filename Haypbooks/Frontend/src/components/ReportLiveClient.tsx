"use client";
import type { ReactNode } from 'react'

export default function ReportLiveClient({ children }: { children: ReactNode }) {
  return (
    <div className="sr-only" aria-live="polite">{children}</div>
  )
}
