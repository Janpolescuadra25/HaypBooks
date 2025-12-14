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
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Income', 'Expense', 'Transfer']).default('Income'),
  amount: z.coerce.number().refine((n) => !Number.isNaN(n), 'Amount is required'),
})

type FormValues = z.infer<typeof schema>

export default function NewTransactionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), description: '', category: 'Income', amount: 0 },
  })

  // RBAC: use journal:write for transaction creation (per API enforcement)
  useEffect(() => {
    let alive = true
    async function guard() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('journal:write')
        if (alive && !can) router.replace('/transactions')
      } catch {}
    }
    guard()
    return () => { alive = false }
  }, [router])

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await api('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          date: values.date,
          description: values.description,
          category: values.category,
          amount: values.amount,
        })
      })
      router.push('/transactions')
    } catch (e: any) {
      setError(e.message || 'Failed to create transaction')
    }
  }

  return (
    <div className="glass-card">
  <BackBar href="/transactions" />
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Transaction</h1>
  <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
    <label className="block text-sm font-medium text-slate-700" htmlFor="tx-date">Date</label>
    {errors.date ? (
      <input id="tx-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="tx-date-error" {...register('date')} />
    ) : (
      <input id="tx-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('date')} />
    )}
    {errors.date && <p id="tx-date-error" className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
          </div>
          <div>
    <label className="block text-sm font-medium text-slate-700" htmlFor="tx-category">Category</label>
    {errors.category ? (
      <select id="tx-category" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="tx-cat-error" {...register('category')}>
        <option>Income</option>
        <option>Expense</option>
        <option>Transfer</option>
      </select>
    ) : (
      <select id="tx-category" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('category')}>
        <option>Income</option>
        <option>Expense</option>
        <option>Transfer</option>
      </select>
    )}
    {errors.category && <p id="tx-cat-error" className="text-red-600 text-sm mt-1">{String(errors.category.message)}</p>}
          </div>
        </div>

        <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor="tx-desc">Description</label>
      {errors.description ? (
        <input id="tx-desc" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="tx-desc-error" {...register('description')} />
      ) : (
        <input id="tx-desc" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('description')} />
      )}
      {errors.description && <p id="tx-desc-error" className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor="tx-amount">Amount</label>
      {errors.amount ? (
        <input id="tx-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-invalid="true" aria-describedby="tx-amount-error" {...register('amount')} />
      ) : (
        <input id="tx-amount" type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('amount')} />
      )}
      {errors.amount && <p id="tx-amount-error" className="text-red-600 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create Transaction'}</button>
          <BackButton ariaLabel="Back to Transactions" fallback="/transactions" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
