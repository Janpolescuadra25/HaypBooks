import type { ReactNode } from 'react'

export default function ReportLive({ children }: { children: ReactNode }) {
  return (
    <div className="sr-only" aria-live="polite">{children}</div>
  )
}
