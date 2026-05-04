'use client'

import React, { useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { ModalPortal } from '@/components/shared/ModalPortal'

interface ModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  onSubmit?: () => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  size?: 'default' | 'lg' | 'xl'
  showFooter?: boolean
  disabled?: boolean
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<ModalFormProps['size']>, string> = {
  default: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ModalForm({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  size = 'default',
  showFooter = true,
  disabled = false,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className = '',
}: ModalFormProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    lastFocusedElement.current = document.activeElement as HTMLElement | null
    const root = contentRef.current
    const firstFocusable = root?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
    firstFocusable?.focus?.()

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault()
        onClose()
      }

      if (event.key !== 'Tab' || !root) {
        return
      }

      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      if (lastFocusedElement.current?.focus) {
        lastFocusedElement.current.focus()
      }
    }
  }, [isOpen, closeOnEscape, disabled, onClose])

  if (!isOpen) {
    return null
  }

  const isActionDisabled = disabled || isSubmitting

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div
          data-testid="modal-overlay"
          className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm"
          onClick={closeOnOverlayClick && !isActionDisabled ? onClose : undefined}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          ref={contentRef}
          className={`relative z-[2000] w-full ${SIZE_CLASSES[size]} max-h-[90vh] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 ease-out ${className}`.trim()}
          onClick={(event) => event.stopPropagation()}
        >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={!isActionDisabled ? onClose : undefined}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            disabled={isActionDisabled}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">{children}</div>

        {showFooter && (
          <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 p-8">
            <button
              type="button"
              onClick={!isActionDisabled ? onClose : undefined}
              disabled={isActionDisabled}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            {onSubmit && (
              <button
                type="button"
                onClick={!isActionDisabled ? onSubmit : undefined}
                disabled={isActionDisabled}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  )
}
