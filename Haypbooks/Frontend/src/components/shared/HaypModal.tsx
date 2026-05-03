'use client'

import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { ModalPortal } from './ModalPortal'

interface HaypModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
}

const SIZE_CLASSES: Record<NonNullable<HaypModalProps['size']>, string> = {
  sm: 'max-w-[480px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1024px]',
}

export default function HaypModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
}: HaypModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, closeOnEscape, onClose])

  return (
    <ModalPortal>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="hayp-modal-root"
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
              onClick={closeOnOverlayClick ? onClose : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hayp-modal-title"
              className={`relative z-[2010] w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <h2 id="hayp-modal-title" className="text-lg font-semibold text-slate-900">{title}</h2>
                  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
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
                <div className="shrink-0 border-t border-slate-200 px-6 py-4 bg-white">{footer}</div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ModalPortal>
  )
}

export function HaypModalTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex border-b border-slate-200 bg-slate-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-emerald-500 text-emerald-700' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
