'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-emerald-600">404</h1>
        <p className="text-xl text-slate-600 mt-4">Page not found</p>
        <p className="text-sm text-slate-400 mt-2">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 mt-8 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
