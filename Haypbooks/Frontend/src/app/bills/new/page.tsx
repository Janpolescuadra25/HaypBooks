'use client'
import { useEffect, useMemo, useState } from 'react'
import { formatMMDDYYYY } from '@/lib/date'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import { calculateDueDate, TERMS_OPTIONS } from '@/lib/terms'
import Amount from '@/components/Amount'

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be > 0')
})

const schema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  number: z.string().optional(),
  billDate: z.string().min(1, 'Bill date is required'),
  terms: z.string().default('Due on receipt'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required')
})

type FormValues = z.infer<typeof schema>

type Vendor = { id: string; name: string; terms?: string }

export default function NewBillPage() {
  const router = useRouter()
  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vendorId: '', number: '', billDate: today, terms: 'Due on receipt', dueDate: today, items: [{ description: '', amount: 0 }] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closedThrough, setClosedThrough] = useState<string | null>(null)

  // RBAC: client-side access guard for creating bills
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('bills:write')
        if (alive && !can) router.replace('/bills')
      } catch {
        // ignore
      }
    }
    check()
    return () => { alive = false }
  }, [router])

  useEffect(() => {
    let alive = true
    async function loadVendors() {
      try {
        setLoadingVendors(true)
        const res = await fetch('/api/vendors', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (alive) setVendors(data.vendors || [])
        }
      } finally {
        if (alive) setLoadingVendors(false)
      }
    }
    loadVendors()
    return () => { alive = false }
  }, [])

  // Auto-select terms from vendor default and compute due date based on billDate + terms
  const vendorId = watch('vendorId')
  const billDate = watch('billDate')
  const terms = watch('terms')
  const isBlocked = useMemo(() => {
    if (!closedThrough) return false
    const d = (billDate || '').slice(0,10)
    return d !== '' && d <= closedThrough
  }, [closedThrough, billDate])
  useEffect(() => {
    const v = vendors.find(v => v.id === vendorId)
    if (v?.terms) {
      setValue('terms', v.terms as any, { shouldValidate: true, shouldDirty: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])
  useEffect(() => {
    if (billDate && terms) {
      const due = calculateDueDate(billDate, terms)
      setValue('dueDate', due, { shouldValidate: true, shouldDirty: true })
    }
  }, [billDate, terms, setValue])

  // Load closed-through date for client-side guard
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
      await api('/api/bills', { method: 'POST', body: JSON.stringify(values) })
      router.push('/bills')
    } catch (e: any) {
      setError(e.message || 'Failed to create bill')
    }
  }

  const total = fields.reduce((s, f, idx) => s + (Number((control._formValues as any)?.items?.[idx]?.amount) || 0), 0)

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Bill</h1>
      {closedThrough && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
          Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Bills dated on or before this date will be blocked.
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="bill-vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
            {errors.vendorId ? (
              <select
                id="bill-vendor"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                aria-invalid="true"
                aria-describedby="bill-vendor-error"
                {...register('vendorId')}
              >
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                {loadingVendors && <option disabled>Loading…</option>}
              </select>
            ) : (
              <select
                id="bill-vendor"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                {...register('vendorId')}
              >
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                {loadingVendors && <option disabled>Loading…</option>}
              </select>
            )}
            {errors.vendorId && <p id="bill-vendor-error" className="text-red-600 text-sm mt-1">{errors.vendorId.message}</p>}
          </div>
          <div>
            <label htmlFor="bill-number" className="block text-sm font-medium text-slate-700">Bill #</label>
            <input
              id="bill-number"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
              placeholder="Optional"
              {...register('number')}
            />
          </div>
          <div>
            <label htmlFor="bill-date" className="block text-sm font-medium text-slate-700">Bill date</label>
            {errors.billDate ? (
              <input
                id="bill-date"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                aria-invalid="true"
                aria-describedby="bill-date-error"
                {...register('billDate')}
              />
            ) : (
              <input
                id="bill-date"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                {...register('billDate')}
              />
            )}
            {errors.billDate && <p id="bill-date-error" className="text-red-600 text-sm mt-1">{errors.billDate.message}</p>}
            {closedThrough && (
              <p className="text-amber-700 text-sm mt-1" role="status">
                {isBlocked ? 'Selected date is within a closed period. Choose a later date.' : 'Dates on or before the closed-through date are blocked.'}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="bill-due" className="block text-sm font-medium text-slate-700">Due date</label>
            {errors.dueDate ? (
              <input
                id="bill-due"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                aria-invalid="true"
                aria-describedby="bill-due-error"
                {...register('dueDate')}
              />
            ) : (
              <input
                id="bill-due"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                {...register('dueDate')}
              />
            )}
            {errors.dueDate && <p id="bill-due-error" className="text-red-600 text-sm mt-1">{errors.dueDate.message}</p>}
            {/* Intentionally no duplicate closed-through helper here; single message appears under Bill date */}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bill-terms" className="block text-sm font-medium text-slate-700">Terms</label>
            <select id="bill-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('terms')}>
              {TERMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-slate-500 text-xs mt-1">Due date updates when Bill date or Terms change.</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Items</span>
            <button type="button" className="btn-secondary" onClick={() => append({ description: '', amount: 0 })}>+ Add item</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {fields.map((f, idx) => (
                  <tr key={f.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      {errors.items?.[idx]?.description ? (
                        <input
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                          aria-invalid="true"
                          aria-describedby={`bill-item-desc-${idx}-error`}
                          {...register(`items.${idx}.description` as const)}
                        />
                      ) : (
                        <input
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2"
                          {...register(`items.${idx}.description` as const)}
                        />
                      )}
                      {errors.items?.[idx]?.description && <p id={`bill-item-desc-${idx}-error`} className="text-red-600 text-sm mt-1">{errors.items[idx]?.description?.message}</p>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {errors.items?.[idx]?.amount ? (
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right"
                          aria-invalid="true"
                          aria-describedby={`bill-item-amt-${idx}-error`}
                          {...register(`items.${idx}.amount` as const)}
                        />
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right"
                          {...register(`items.${idx}.amount` as const)}
                        />
                      )}
                      {errors.items?.[idx]?.amount && <p id={`bill-item-amt-${idx}-error`} className="text-red-600 text-sm mt-1">{(errors.items as any)[idx]?.amount?.message}</p>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="btn-secondary" onClick={() => remove(idx)} disabled={fields.length <= 1}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.items && typeof errors.items?.message === 'string' && <p className="text-red-600 text-sm mt-1">{errors.items.message as any}</p>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-700">Total</span>
          <span className={`tabular-nums font-mono ${total < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            <Amount value={total} />
          </span>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting || isBlocked /* server enforces exact date rule*/}>{isSubmitting ? 'Saving…' : 'Save Bill'}</button>
          <BackButton ariaLabel="Back to Bills" fallback="/bills" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
