"use client";
import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  ttl?: number; // ms
}

interface ToastContextValue {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (message: string, ttl?: number) => void;
  error: (message: string, ttl?: number) => void;
  info: (message: string, ttl?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((prev) => [...prev, { id, ttl: 4000, ...t }]);
  }, []);

  const success = useCallback((message: string, ttl?: number) => push({ type: 'success', message, ttl }), [push]);
  const error   = useCallback((message: string, ttl?: number) => push({ type: 'error', message, ttl: ttl ?? 6000 }), [push]);
  const info    = useCallback((message: string, ttl?: number) => push({ type: 'info', message, ttl }), [push]);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) => {
      if (!toast.ttl) return null;
      return setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.ttl);
    }).filter(Boolean) as NodeJS.Timeout[];
    return () => { timers.forEach(clearTimeout); };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ push, success, error, info }}>
      {children}
      {/* Portal container */}
      <div aria-live="polite" className="fixed z-[100] inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 sm:p-6">
        {toasts.map(t => (
          <div key={t.id} role="status" className={
            `pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-sm shadow bg-white/90 backdrop-blur flex items-start gap-3` +
            ` ${t.type==='success' ? 'border-emerald-300 text-emerald-900' : t.type==='error' ? 'border-rose-300 text-rose-900' : 'border-slate-300 text-slate-900'}`
          }>
            <div className="mt-0.5 flex-1">
              {t.message}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="shrink-0 text-slate-500 hover:text-slate-700"
              aria-label="Dismiss notification"
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  // Early return during SSR to avoid invoking React hooks in a non-react render context
  if (typeof window === 'undefined') {
    const noop = () => {};
    return { push: noop, success: noop, error: noop, info: noop } as unknown as ToastContextValue
  }

  try {
    const ctx = useContext(ToastContext);
    // Return a no-op when a provider is not present (helps tests and non-critical render paths)
    if (!ctx) {
      const noop = () => {};
      return { push: noop, success: noop, error: noop, info: noop } as unknown as ToastContextValue;
    }
    return ctx;
  } catch (e) {
    const noop = () => {};
    return { push: noop, success: noop, error: noop, info: noop } as unknown as ToastContextValue;
  }
}
