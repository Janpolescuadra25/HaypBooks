'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { BackButton } from '@/components/BackButton'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import { TERMS_OPTIONS } from '@/lib/terms'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d ()-]{6,}$/

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long (max 100)'),
  terms: z.enum(['Net 15','Net 30','Due on receipt'] as [string, string, string], { required_error: 'Terms is required', invalid_type_error: 'Invalid terms' }).optional(),
  email: z.string().optional().or(z.literal('')).refine((v) => !v || emailRegex.test(v), 'Email is invalid'),
  phone: z.string().optional().or(z.literal('')).refine((v) => !v || phoneRegex.test(v), 'Phone looks invalid'),
})

type FormValues = z.infer<typeof schema>

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', terms: 'Net 30' as any, email: '', phone: '' },
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await api<{ customer: any }>(`/api/customers/${id}`)
        if (!active) return
        const c = data.customer
        setValue('name', c?.name || '')
        setValue('email', c?.email || '')
        setValue('phone', c?.phone || '')
        if (c?.terms) setValue('terms' as any, c.terms)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id, setValue])

  const onSubmit = useMemo(() => async (values: FormValues) => {
    await api(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(values) })
    router.push(toHref(`/customers/${id}`))
  }, [id, router])

  if (loading) return <div className="glass-card max-w-md">Loading…</div>

  return (
    <div className="glass-card max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Customer</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="c-name" className="block text-sm font-medium text-slate-700">Name</label>
          {errors.name ? (
            <input
              id="c-name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="c-name-error"
              {...register('name')}
            />
          ) : (
            <input
              id="c-name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('name')}
            />
          )}
          {errors.name && <p id="c-name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="c-terms" className="block text-sm font-medium text-slate-700">Terms</label>
          {(errors as any)?.terms ? (
            <select
              id="c-terms"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="c-terms-error"
              {...register('terms' as any)}
            >
              {TERMS_OPTIONS.filter(t => ['Net 15','Net 30','Due on receipt'].includes(t)).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <select
              id="c-terms"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('terms' as any)}
            >
              {TERMS_OPTIONS.filter(t => ['Net 15','Net 30','Due on receipt'].includes(t)).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
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
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="c-email-error"
              {...register('email')}
            />
          ) : (
            <input
              id="c-email"
              type="email"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
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
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="c-phone-error"
              {...register('phone')}
            />
          ) : (
            <input
              id="c-phone"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('phone')}
            />
          )}
          {errors.phone && <p id="c-phone-error" className="text-red-600 text-sm mt-1">{errors.phone.message as any}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
          <BackButton ariaLabel="Back to Customer" fallback={`/customers/${id}`} disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
