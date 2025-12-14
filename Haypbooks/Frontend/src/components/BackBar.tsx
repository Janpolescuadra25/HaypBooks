'use client'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'

export default function BackBar({ href, label = 'Back' }: { href: string; label?: string }) {
  const router = useRouter()
  return (
    <div className="mb-3 print:hidden">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 hover:underline"
        onClick={() => {
          // Deterministic back: prefer `from` query param; otherwise push explicit fallback href
          if (typeof window !== 'undefined') {
            const from = new URL(window.location.href).searchParams.get('from')
            if (from && from.startsWith('/') && !from.includes('://')) {
              router.push(toHref(from))
              return
            }
          }
          router.push(toHref(href))
        }}
        aria-label={label}
      >
        <span aria-hidden>←</span>
        {label}
      </button>
    </div>
  )
}
