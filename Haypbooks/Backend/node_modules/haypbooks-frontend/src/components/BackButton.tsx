"use client"

import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { MouseEvent } from 'react'

type Props = {
  fallback?: string
  className?: string
  children?: React.ReactNode
  ariaLabel?: string
  disabled?: boolean
}

export function BackButton({ fallback = '/reports', className = 'btn-secondary', children = 'Back', ariaLabel = 'Back', disabled }: Props) {
  const router = useRouter()
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const from = url.searchParams.get('from')
      // Accept only safe app-relative paths for `from` (avoid external redirects)
      if (from && from.startsWith('/') && !from.includes('://')) {
        router.push(toHref(from))
        return
      }
    }
  // Always prefer explicit fallback for deterministic "form-sequence" back behavior
  router.push(toHref(fallback))
  }
  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
