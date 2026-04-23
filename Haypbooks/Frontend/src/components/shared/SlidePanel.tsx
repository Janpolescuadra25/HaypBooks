'use client'

import React, { ReactNode } from 'react'
import { X } from 'lucide-react'

interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  widthClass?: string
}

export default function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'max-w-[42rem]',
}: SlidePanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative flex h-full w-full flex-col ${widthClass} overflow-hidden bg-white shadow-2xl`.trim()}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 truncate">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
