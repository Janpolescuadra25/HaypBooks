"use client"
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d ()-]{6,}$/

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long (max 100)'),
  terms: z.enum(['Net 15','Net 30','Due on receipt']).default('Net 30'),
  email: z.string().optional().or(z.literal('')).refine((v) => !v || emailRegex.test(v), 'Email is invalid'),
  phone: z.string().optional().or(z.literal('')).refine((v) => !v || phoneRegex.test(v), 'Phone looks invalid'),
})

type FormValues = z.infer<typeof schema>

export default function CreateCustomerModal({ open, onClose, defaultName, onCreated } : { open: boolean; onClose: () => void; defaultName?: string; onCreated?: (created: any) => void }) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: defaultName || '', terms: 'Net 30', email: '', phone: '' } })

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

    // start hide animation then unmount
    if (isMounted && !open) {
      setIsVisible(false)
      const t = window.setTimeout(() => setIsMounted(false), DISCARD_ANIM_MS)
      return () => window.clearTimeout(t)
    }
    return
  }, [open, isMounted])

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/customers', { method: 'POST', body: JSON.stringify(values) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      onCreated?.(data)
      onClose()
    } catch (err) {
      // In-modal error handling could be improved, but keep minimal for now
      console.error(err)
    }
  }

  if (!isMounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div data-testid="create-customer-overlay" className={`absolute inset-0 z-[70] bg-black/40 transition-opacity duration-200 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden="true" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="create-customer-title" aria-describedby="create-customer-desc" className={`bg-white rounded-xl shadow-[0_30px_80px_rgba(2,6,23,0.55),_0_16px_40px_rgba(2,6,23,0.36)] z-[90] w-[min(520px,94%)] p-5 border border-slate-200 transition-all duration-240 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95'}`}>
        <h2 id="create-customer-title" className="text-lg font-semibold mb-2">New Customer</h2>
        <p id="create-customer-desc" className="text-sm text-slate-600 mb-3">Create a new customer record to be used on invoices and transactions.</p>
        <form id="create-customer" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label htmlFor="name" className="text-sm block mb-1">Name</label>
            <input id="name" {...register('name')} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name.message}</div>}
          </div>
          <div>
            <label htmlFor="email" className="text-sm block mb-1">Email</label>
            <input id="email" {...register('email')} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email.message}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-1 text-sm">Cancel</button>
            <button form="create-customer" type="submit" disabled={isSubmitting} className="btn-primary text-sm">{isSubmitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body!
  )
}
