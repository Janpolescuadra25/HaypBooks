'use client'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { BackButton } from '@/components/BackButton'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d ()-]{6,}$/

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long (max 100)'),
  terms: z.enum(['Net 15','Net 30','Due on receipt'], { required_error: 'Terms is required', invalid_type_error: 'Invalid terms' }).default('Net 30'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || emailRegex.test(v), 'Email is invalid'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || phoneRegex.test(v), 'Phone looks invalid'),
})

type FormValues = z.infer<typeof schema>

export default function NewCustomerPage() {
  const router = useRouter()
  const [customerFull, setCustomerFull] = useState(false)

  // RBAC: client-side guard to avoid showing form when lacking permission
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('customers:write')
  if (alive && !can) router.replace(toHref('/customers'))
      } catch {
        // ignore
      }
    }
    check()
    return () => { alive = false }
  }, [router])

  // Lock background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Load and persist fullscreen preference
  useEffect(() => {
    try {
      const pref = localStorage.getItem('hb.customer.fullscreen')
      if (pref === 'true') setCustomerFull(true)
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('hb.customer.fullscreen', customerFull ? 'true':'false') } catch {}
  }, [customerFull])

  const sp = useSearchParams()
  const prefillName = sp?.get('name') ?? ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: prefillName, terms: 'Net 30', email: '', phone: '' },
    mode: 'onSubmit',
  })

  const onSubmit = useMemo(() => async (values: FormValues) => {
    await api('/api/customers', { method: 'POST', body: JSON.stringify(values) })
    router.push(toHref('/customers'))
  }, [router])

  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      router.back()
      return
    }
    if (e.key === 'Tab') {
      const root = e.currentTarget
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ))
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={()=> router.back()} />
      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={onDialogKeyDown}
        className={
          `relative flex flex-col !bg-white rounded-2xl border border-slate-200/60 p-4 md:p-6 transition-all duration-300 ` +
          `shadow-[0_12px_24px_rgba(15,23,42,0.22),_0_36px_72px_rgba(15,23,42,0.28),_0_72px_144px_rgba(15,23,42,0.24)] ` +
          `animate-[hb-border-sheen_7.5s_ease-in-out_infinite] ` +
          (customerFull
            ? 'inset-0 m-2 md:m-4 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] h-[calc(100%-1rem)] md:h-[calc(100%-2rem)]'
            : 'w-[clamp(500px,50vw,700px)] h-auto max-h-[clamp(500px,80vh,800px)]')
        }
      >
        <div className="flex items-center justify-between mb-3 shrink-0 bg-white border-b border-slate-200 pb-2">
          <h1 className="text-lg font-semibold text-slate-900">New Customer</h1>
          <button
            onClick={()=> setCustomerFull(f=> !f)}
            aria-label={customerFull ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >{customerFull ? '🡼' : '⛶'}</button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <form id="customer-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="c-name" className="block text-sm font-medium text-slate-700">Name</label>
              {errors.name ? (
                <input
                  id="c-name"
                  placeholder="Name"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  aria-invalid="true"
                  aria-describedby="c-name-error"
                  {...register('name')}
                />
              ) : (
                <input
                  id="c-name"
                  placeholder="Name"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  {...register('name')}
                />
              )}
              {errors.name && <p id="c-name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="c-terms" className="block text-sm font-medium text-slate-700">Terms</label>
              {errors as any && (errors as any).terms ? (
                <select
                  id="c-terms"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  aria-invalid="true"
                  aria-describedby="c-terms-error"
                  {...register('terms' as any)}
                >
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Due on receipt</option>
                </select>
              ) : (
                <select
                  id="c-terms"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  {...register('terms' as any)}
                >
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Due on receipt</option>
                </select>
              )}
              {(errors as any)?.terms && <p id="c-terms-error" className="text-red-600 text-sm mt-1">{(errors as any).terms?.message as any}</p>}
            </div>
            <div>
              <label htmlFor="c-email" className="block text-sm font-medium text-slate-700">Email</label>
              {errors.email ? (
                <input
                  id="c-email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  aria-invalid="true"
                  aria-describedby="c-email-error"
                  {...register('email')}
                />
              ) : (
                <input
                  id="c-email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  {...register('email')}
                />
              )}
              {errors.email && <p id="c-email-error" className="text-red-600 text-sm mt-1">{errors.email.message as any}</p>}
            </div>
            <div>
              <label htmlFor="c-phone" className="block text-sm font-medium text-slate-700">Phone</label>
              {errors.phone ? (
                <input
                  id="c-phone"
                  placeholder="Phone"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  aria-invalid="true"
                  aria-describedby="c-phone-error"
                  {...register('phone')}
                />
              ) : (
                <input
                  id="c-phone"
                  placeholder="Phone"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                  {...register('phone')}
                />
              )}
              {errors.phone && <p id="c-phone-error" className="text-red-600 text-sm mt-1">{errors.phone.message as any}</p>}
            </div>
          </form>
        </div>
        <div className="pt-3 mt-2 border-t bg-white flex items-center justify-between gap-2 shrink-0">
          <BackButton ariaLabel="Back to Customers" fallback="/customers" disabled={isSubmitting}>Cancel</BackButton>
          <button form="customer-form" type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
