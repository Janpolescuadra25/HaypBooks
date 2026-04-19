'use client'

import type { ReactNode } from 'react'

export interface BulkAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
  icon?: ReactNode
  disabled?: boolean
}

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection?: () => void
  actions: BulkAction[]
  className?: string
  visible?: boolean
}

const ACTION_BASE =
  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const ACTION_VARIANTS: Record<NonNullable<BulkAction['variant']>, string> = {
  default: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  destructive: 'bg-white border border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-400',
}

const CLEAR_BUTTON_CLASSES =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2'

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
  className = '',
  visible = true,
}: BulkActionBarProps) {
  if (!visible || selectedCount <= 0) {
    return null
  }

  const selectionLabel = `${selectedCount} item${selectedCount === 1 ? '' : 's'} selected`

  return (
    <div
      className={`sticky top-0 z-10 animate-in slide-in-from-top-2 duration-300 ease-out ${className}`.trim()}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700" aria-live="polite">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-slate-500">
              ✓
            </span>
            <span>{selectionLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action, index) => {
              const variantClass = ACTION_VARIANTS[action.variant ?? 'default']
              const disabledClass = action.disabled ? 'opacity-50 cursor-not-allowed' : ''
              return (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`${ACTION_BASE} ${variantClass} ${disabledClass}`.trim()}
                >
                  {action.icon && (
                    <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  <span>{action.label}</span>
                </button>
              )
            })}
            {onClearSelection ? (
              <button
                type="button"
                onClick={onClearSelection}
                aria-label="Clear selection"
                className={CLEAR_BUTTON_CLASSES}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
