"use client"
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

export default function CreateProductModal({ open, onClose, defaultName, onCreated } : { open: boolean; onClose: () => void; defaultName?: string; onCreated?: (created: any) => void }) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<{ name: string; sku?: string }>( { defaultValues: { name: defaultName || '', sku: '' } } )

  useEffect(() => {
    if (open && defaultName) setValue('name', defaultName)
  }, [open, defaultName, setValue])

  const [isMounted, setIsMounted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const DISCARD_ANIM_MS = 240

  React.useEffect(() => {
    if (open) {
      setIsMounted(true)
      const t = window.setTimeout(() => setIsVisible(true), 10)
      return () => window.clearTimeout(t)
    }

    if (isMounted && !open) {
      setIsVisible(false)
      const t = window.setTimeout(() => setIsMounted(false), DISCARD_ANIM_MS)
      return () => window.clearTimeout(t)
    }
    return
  }, [open, isMounted])

  async function onSubmit(values: any) {
    try {
      const res = await fetch('/api/products-services', { method: 'POST', body: JSON.stringify(values) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      onCreated?.(data)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  if (!isMounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div data-testid="create-product-overlay" className={`absolute inset-0 z-[70] bg-black/40 transition-opacity duration-200 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden="true" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="create-product-title" aria-describedby="create-product-desc" className={`bg-white rounded-xl shadow-[0_30px_80px_rgba(2,6,23,0.55),_0_16px_40px_rgba(2,6,23,0.36)] z-[90] w-[min(520px,94%)] p-5 border border-slate-200 transition-all duration-240 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95'}`}>
        <h2 id="create-product-title" className="text-lg font-semibold mb-2">New Product / Service</h2>
        <p id="create-product-desc" className="text-sm text-slate-600 mb-3">Create a new product or service so it appears in product lists and invoices.</p>
        <form id="create-product" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label htmlFor="p-name" className="text-sm block mb-1">Name</label>
            <input id="p-name" {...register('name', { required: true })} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.name && <div className="text-red-600 text-sm mt-1">Name is required</div>}
          </div>
          <div>
            <label htmlFor="p-sku" className="text-sm block mb-1">SKU (optional)</label>
            <input id="p-sku" {...register('sku')} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-1 text-sm">Cancel</button>
            <button form="create-product" type="submit" disabled={isSubmitting} className="btn-primary text-sm">{isSubmitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body!
  )
}
