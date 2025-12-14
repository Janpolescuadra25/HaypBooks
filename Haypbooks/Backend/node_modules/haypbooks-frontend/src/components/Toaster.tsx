"use client"
import { useEffect, useState } from 'react'

type Toast = { id: number; message: string }

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    function onToast(e: Event) {
      const ce = e as CustomEvent
      const message = ce.detail?.message as string
      if (!message) return
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts((t) => [...t, { id, message }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
    }
    window.addEventListener('hb:toast', onToast as any)
    ;(window as any).toast = (msg: string) => {
      window.dispatchEvent(new CustomEvent('hb:toast', { detail: { message: msg } }))
    }
    return () => {
      window.removeEventListener('hb:toast', onToast as any)
      try { delete (window as any).toast } catch {}
    }
  }, [])

  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-md bg-slate-900/90 text-white px-3 py-2 text-sm shadow-lg">
          {t.message}
        </div>
      ))}
    </div>
  )
}
