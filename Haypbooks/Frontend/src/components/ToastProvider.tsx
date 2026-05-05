"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  ttl: number
  createdAt: number
  expiresAt: number
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id' | 'createdAt' | 'expiresAt' | 'ttl'> & { ttl?: number }) => void
  success: (message: string, ttl?: number) => void
  error: (message: string, ttl?: number) => void
  info: (message: string, ttl?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const DEFAULT_TTL = 4000
const MAX_VISIBLE = 4

function getAccentClasses(type: ToastType) {
  switch (type) {
    case 'success':
      return { border: 'border-emerald-300', accent: 'bg-emerald-500' }
    case 'error':
      return { border: 'border-rose-300', accent: 'bg-rose-500' }
    default:
      return { border: 'border-sky-300', accent: 'bg-sky-500' }
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [now, setNow] = useState(() => Date.now())

  const push = useCallback((toast: Omit<Toast, 'id' | 'createdAt' | 'expiresAt'> & { ttl?: number }) => {
    setToasts((prev) => {
      const ttl = toast.ttl ?? DEFAULT_TTL
      const existingIndex = prev.findIndex((item) => item.type === toast.type && item.message === toast.message)
      const createdAt = Date.now()
      const expiresAt = createdAt + ttl

      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = { ...next[existingIndex], ttl, createdAt, expiresAt }
        return next
      }

      const id = Math.random().toString(36).slice(2, 10)
      return [...prev, { id, ...toast, ttl, createdAt, expiresAt }]
    })
  }, [])

  const success = useCallback((message: string, ttl = DEFAULT_TTL) => push({ type: 'success', message, ttl }), [push])
  const error = useCallback((message: string, ttl = DEFAULT_TTL) => push({ type: 'error', message, ttl }), [push])
  const info = useCallback((message: string, ttl = DEFAULT_TTL) => push({ type: 'info', message, ttl }), [push])
  const contextValue = useMemo(
    () => ({ push, success, error, info }),
    [push, success, error, info],
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      const timestamp = Date.now()
      setNow(timestamp)
      setToasts((prev) => prev.filter((toast) => toast.expiresAt > timestamp))
    }, 100)

    return () => window.clearInterval(interval)
  }, [])

  const visibleToasts = useMemo(() => toasts.slice(0, MAX_VISIBLE), [toasts])
  const overflowCount = Math.max(0, toasts.length - MAX_VISIBLE)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const renderProgress = (toast: Toast) => {
    const remaining = Math.max(0, toast.expiresAt - now)
    const percent = Math.min(100, Math.max(0, (remaining / toast.ttl) * 100))
    return percent
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" className="fixed inset-0 z-[100] pointer-events-none flex justify-end p-4 sm:p-6">
        <div className="w-full max-w-xs overflow-hidden">
          {overflowCount > 0 && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
              <span>+{overflowCount} more</span>
            </div>
          )}

          <div className="max-h-[calc(4*5.25rem+1rem)] overflow-y-auto pr-1 space-y-3">
            {visibleToasts.map((toast) => {
              const { border, accent } = getAccentClasses(toast.type)
              const progress = renderProgress(toast)

              return (
                <div key={toast.id} role="status" className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${border} bg-white/95 shadow-xl animate-toastIn`}>
                  <div className={`${accent} absolute inset-y-0 left-0 w-1`} />
                  <div className="relative flex items-start gap-3 px-4 py-4 pl-5 pr-3">
                    <div className="min-w-0 flex-1 text-sm font-medium text-slate-900">{toast.message}</div>
                    <button
                      type="button"
                      onClick={() => dismiss(toast.id)}
                      className="shrink-0 rounded-full text-slate-400 transition hover:text-slate-700"
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 rounded-b-2xl bg-slate-200">
                    <div className={`${accent} h-1 rounded-b-2xl`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  const noop = () => {}

  if (typeof window === 'undefined' || !ctx) {
    return { push: noop, success: noop, error: noop, info: noop } as unknown as ToastContextValue
  }

  return ctx
}
