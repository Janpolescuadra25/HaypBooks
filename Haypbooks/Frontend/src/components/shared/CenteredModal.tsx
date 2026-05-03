'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { ModalPortal } from '@/components/shared/ModalPortal'

interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<SlidePanelProps['size']>, string> = {
  sm: 'max-w-[480px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[800px]',
}

export default function CenteredModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className = '',
}: SlidePanelProps) {
  useEffect(() => {
    if (!open) return

    const original = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault()
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, closeOnEscape, onClose])

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            key="centered-modal-backdrop"
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
          >
            <motion.div
              className="fixed inset-0 bg-black/60"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            />

            <motion.div
              key="centered-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(event) => event.stopPropagation()}
              className={`relative z-[2010] w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl ${className}`.trim()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                    {title}
                  </h2>
                  {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>

              {footer ? (
                <div className="shrink-0 border-t border-slate-200 px-6 py-4">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  )
}
