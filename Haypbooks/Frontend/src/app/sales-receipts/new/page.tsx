'use client'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import BackBar from '@/components/BackBar'

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  customer: z.string().min(1, 'Customer is required'),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
})

type FormValues = z.infer<typeof schema>

export default function NewSalesReceiptPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), customer: '', description: '', amount: 0 },
  })

  // RBAC: use invoices:write for sales receipt create
  useEffect(() => {
    let alive = true
    async function guard() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('invoices:write')
        if (alive && !can) router.replace('/sales-receipts')
      } catch {}
    }
    guard()
    return () => { alive = false }
  }, [router])

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await api('/api/sales-receipts', { method: 'POST', body: JSON.stringify(values) })
      router.push('/sales-receipts')
    } catch (e: any) { setError(e.message || 'Failed to create sales receipt') }
  }

  return (
    <div className="glass-card">
      <BackBar href="/sales-receipts" />
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Sales Receipt</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="sr-date">Date</label>
            {errors.date ? (
              <input id="sr-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="sr-date-error" {...register('date')} />
            ) : (
              <input id="sr-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('date')} />
            )}
            {errors.date && <p id="sr-date-error" className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="sr-customer">Customer</label>
            {errors.customer ? (
              <input id="sr-customer" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="sr-customer-error" {...register('customer')} />
            ) : (
              <input id="sr-customer" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('customer')} />
            )}
            {errors.customer && <p id="sr-customer-error" className="text-red-600 text-sm mt-1">{errors.customer.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="sr-desc">Description</label>
          <input id="sr-desc" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('description')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="sr-amount">Amount</label>
          {errors.amount ? (
            <input id="sr-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="sr-amount-error" {...register('amount')} />
          ) : (
            <input id="sr-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('amount')} />
          )}
          {errors.amount && <p id="sr-amount-error" className="text-red-600 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Record Sales Receipt'}</button>
          <BackButton ariaLabel="Back to Sales Receipts" fallback="/sales-receipts" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
