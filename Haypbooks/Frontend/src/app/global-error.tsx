'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <h1 className="text-8xl font-bold text-rose-500">500</h1>
            <p className="text-xl text-slate-600 mt-4">Something went wrong</p>
            <p className="text-sm text-slate-400 mt-2">
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 mt-8 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
