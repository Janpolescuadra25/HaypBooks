'use client'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { BackButton } from '@/components/BackButton'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long (max 100)'),
  terms: z.enum(['Net 15','Net 30','Due on receipt'], { required_error: 'Terms is required', invalid_type_error: 'Terms selection is invalid' })
})

type FormValues = z.infer<typeof schema>

export default function NewVendorPage() {
  const router = useRouter()
  // RBAC: client-side access guard
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('vendors:write')
        if (alive && !can) router.replace(toHref('/vendors'))
      } catch {}
    }
    check()
    return () => { alive = false }
  }, [router])
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', terms: 'Net 30' }
  })

  const onSubmit = useMemo(() => async (values: FormValues) => {
    await api('/api/vendors', { method: 'POST', body: JSON.stringify(values) })
    router.push(toHref('/vendors'))
  }, [router])

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">New Vendor</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="v-name" className="block text-sm font-medium text-slate-700">Name</label>
          {errors.name ? (
            <input
              id="v-name"
              placeholder="Name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="v-name-error"
              {...register('name')}
            />
          ) : (
            <input
              id="v-name"
              placeholder="Name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('name')}
            />
          )}
          {errors.name && <p id="v-name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="v-terms" className="block text-sm font-medium text-slate-700">Terms</label>
          {errors.terms ? (
            <select
              id="v-terms"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="v-terms-error"
              {...register('terms')}
            >
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Due on receipt</option>
            </select>
          ) : (
            <select
              id="v-terms"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('terms')}
            >
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Due on receipt</option>
            </select>
          )}
          {errors.terms && <p id="v-terms-error" className="text-red-600 text-sm mt-1">{errors.terms.message as any}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
          <BackButton ariaLabel="Back to Vendors" fallback="/vendors" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
