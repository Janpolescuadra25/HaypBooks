'use client'

import type { ReactNode } from 'react'

interface EmptyStateEnhancedProps {
  title: string
  description?: string
  illustration?: 'inbox' | 'search' | 'error' | 'documents' | 'users'
  customIllustration?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

const ILLUSTRATIONS: Record<NonNullable<EmptyStateEnhancedProps['illustration']>, JSX.Element> = {
  inbox: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-200" aria-hidden="true" data-testid="illustration-inbox">
      <rect x="18" y="30" width="60" height="36" rx="6" stroke="currentColor" strokeWidth="6" />
      <path d="M18 42L48 60L78 42" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 60V72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-200" aria-hidden="true" data-testid="illustration-search">
      <circle cx="38" cy="38" r="22" stroke="currentColor" strokeWidth="6" />
      <path d="M56 56L72 72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="38" cy="38" r="10" fill="currentColor" fillOpacity="0.08" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-200" aria-hidden="true" data-testid="illustration-error">
      <path d="M48 18L82 78H14L48 18Z" stroke="currentColor" strokeWidth="6" />
      <path d="M48 36V54" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="48" cy="68" r="4" fill="currentColor" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-200" aria-hidden="true" data-testid="illustration-documents">
      <rect x="22" y="20" width="52" height="64" rx="8" stroke="currentColor" strokeWidth="6" />
      <path d="M32 32H64" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M32 46H64" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M32 60H52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <rect x="30" y="14" width="44" height="18" rx="6" fill="currentColor" fillOpacity="0.08" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-200" aria-hidden="true" data-testid="illustration-users">
      <circle cx="34" cy="34" r="14" stroke="currentColor" strokeWidth="6" />
      <path d="M21 72C21 60.9543 29.9543 52 41 52H53C64.0457 52 73 60.9543 73 72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="66" cy="32" r="10" stroke="currentColor" strokeWidth="6" />
      <path d="M60 62C60 57.5817 63.5817 54 68 54H76" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
}

export default function EmptyStateEnhanced({
  title,
  description,
  illustration,
  customIllustration,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateEnhancedProps) {
  const hasActions = Boolean(primaryActionLabel || secondaryActionLabel)

  return (
    <section
      role="status"
      aria-label="Empty state"
      className={`animate-in zoom-in-95 duration-150 flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}
    >
      {(customIllustration || illustration) && (
        <div className="mb-4">
          {customIllustration ?? ILLUSTRATIONS[illustration as keyof typeof ILLUSTRATIONS]}
        </div>
      )}
      <p className="text-lg font-semibold text-slate-900 mt-2">{title}</p>
      {description ? (
        <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">{description}</p>
      ) : null}
      {hasActions && (
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {primaryActionLabel && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              {primaryActionLabel}
            </button>
          )}
          {secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
