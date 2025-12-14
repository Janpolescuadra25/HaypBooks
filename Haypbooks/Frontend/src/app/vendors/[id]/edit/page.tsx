"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { BackButton } from '@/components/BackButton'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long (max 100)'),
  terms: z.enum(['Net 15','Net 30','Due on receipt'], { required_error: 'Terms is required', invalid_type_error: 'Terms selection is invalid' })
})

type FormValues = z.infer<typeof schema>

export default function EditVendorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', terms: 'Net 30' },
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await api<{ vendor: any }>(`/api/vendors/${id}`)
        if (!active) return
        const v = data.vendor
        setValue('name', v?.name || '')
        setValue('terms', v?.terms || 'Net 30')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id, setValue])

  const onSubmit = useMemo(() => async (values: FormValues) => {
    await api(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(values) })
    router.push(toHref(`/vendors/${id}`))
  }, [id, router])

  if (loading) return <div className="glass-card max-w-md">Loading…</div>

  return (
    <div className="glass-card max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Vendor</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="v-name" className="block text-sm font-medium text-slate-700">Name</label>
          {errors.name ? (
            <input
              id="v-name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              aria-invalid="true"
              aria-describedby="v-name-error"
              {...register('name')}
            />
          ) : (
            <input
              id="v-name"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              {...register('name')}
            />
          )}
          {errors.name && <p id="v-name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="v-terms" className="block text-sm font-medium text-slate-700">Terms</label>
          {errors.terms ? (
            <select id="v-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" aria-invalid="true" aria-describedby="v-terms-error" {...register('terms')}>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Due on receipt">Due on receipt</option>
            </select>
          ) : (
            <select id="v-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('terms')}>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Due on receipt">Due on receipt</option>
            </select>
          )}
          {errors.terms && <p id="v-terms-error" className="text-red-600 text-sm mt-1">{errors.terms.message as any}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
          <BackButton ariaLabel="Back to Vendor" fallback={`/vendors/${id}`} disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
