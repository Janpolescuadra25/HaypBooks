'use client'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { useEffect, useState } from 'react'
import { formatMMDDYYYY } from '@/lib/date'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  payee: z.string().min(1, 'Payee is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  memo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewExpensePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), payee: '', category: '', amount: 0, memo: '' },
  })

  // RBAC: use journal:write for expense create
  useEffect(() => {
    let alive = true
    async function guard() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('journal:write')
        if (alive && !can) router.replace('/expenses')
      } catch {}
    }
    guard()
    return () => { alive = false }
  }, [router])

  useEffect(() => {
    let alive = true
    async function loadClosed() {
      try {
        const res = await fetch('/api/periods', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (alive) setClosedThrough(data?.closedThrough || null)
      } catch {}
    }
    loadClosed()
    return () => { alive = false }
  }, [])

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await api('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(values)
      })
      router.push('/expenses')
    } catch (e: any) {
      setError(e.message || 'Failed to create expense')
    }
  }

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Expense</h1>
    {closedThrough && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
      Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Expenses dated on or before this date will be blocked.
        </div>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="exp-date">Date</label>
            {errors.date ? (
              <input id="exp-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="exp-date-error" {...register('date')} />
            ) : (
              <input id="exp-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('date')} />
            )}
            {errors.date && <p id="exp-date-error" className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
            {closedThrough && (
              <p className="text-amber-700 text-sm mt-1" role="status">Dates on or before the closed-through date are blocked.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="exp-category">Category</label>
            {errors.category ? (
              <select id="exp-category" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="exp-category-error" {...register('category')}>
                <option value="">Select…</option>
                <option>Meals</option>
                <option>Travel</option>
                <option>Supplies</option>
                <option>Utilities</option>
                <option>Rent</option>
              </select>
            ) : (
              <select id="exp-category" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('category')}>
                <option value="">Select…</option>
                <option>Meals</option>
                <option>Travel</option>
                <option>Supplies</option>
                <option>Utilities</option>
                <option>Rent</option>
              </select>
            )}
            {errors.category && <p id="exp-category-error" className="text-red-600 text-sm mt-1">{String(errors.category.message)}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="exp-payee">Payee</label>
          {errors.payee ? (
            <input id="exp-payee" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="exp-payee-error" {...register('payee')} />
          ) : (
            <input id="exp-payee" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('payee')} />
          )}
          {errors.payee && <p id="exp-payee-error" className="text-red-600 text-sm mt-1">{errors.payee.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="exp-amount">Amount</label>
          {errors.amount ? (
            <input id="exp-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="exp-amount-error" {...register('amount')} />
          ) : (
            <input id="exp-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('amount')} />
          )}
          {errors.amount && <p id="exp-amount-error" className="text-red-600 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="exp-memo">Memo</label>
          <input id="exp-memo" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('memo')} />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting /* server enforces exact date rule*/}>{isSubmitting ? 'Saving…' : 'Save Expense'}</button>
          <BackButton ariaLabel="Back to Expenses" fallback="/expenses" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
