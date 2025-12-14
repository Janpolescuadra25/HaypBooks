"use client"
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import React, { useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const baseLine = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().optional(),
  account: z.string().optional(),
  debit: z.coerce.number().optional(),
  credit: z.coerce.number().optional(),
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  kind: z.enum(['journal','invoice','bill']).default('journal'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  frequency: z.enum(['daily','weekly','monthly','yearly']).default('monthly'),
  mode: z.enum(['scheduled','reminder','unscheduled']).default('scheduled'),
  count: z.coerce.number().optional(),
  lines: z.array(baseLine).min(1, 'At least one line is required'),
}).superRefine((val, ctx)=>{
  // Validate endDate >= startDate if provided
  if (val.endDate) {
    const s = new Date(String(val.startDate))
    const e = new Date(String(val.endDate))
    if (isFinite(s.getTime()) && isFinite(e.getTime())) {
      const sIso = s.toISOString().slice(0,10)
      const eIso = e.toISOString().slice(0,10)
      if (eIso < sIso) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date must be on or after start date' })
      }
    }
  }
  if (val.kind === 'journal') {
    if ((val.lines||[]).length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least two journal lines required' })
    }
    const totals = (val.lines||[]).reduce<{ debit: number; credit: number }>((acc, l) => ({
      debit: acc.debit + (Number(l.debit)||0),
      credit: acc.credit + (Number(l.credit)||0)
    }), { debit: 0, credit: 0 })
    if (Math.round((totals.debit - totals.credit)*100) !== 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debits must equal credits' })
    }
  } else {
    const bad = (val.lines||[]).some(l => !l.description || !Number(l.amount))
    if (bad) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Each line needs a description and amount > 0' })
  }
})

type FormValues = z.infer<typeof schema>

export default function NewRecurringTemplatePage() {
  const router = useRouter()
  const today = useMemo(()=> new Date().toISOString().slice(0,10), [])
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      kind: 'journal',
      startDate: today,
      endDate: undefined,
      frequency: 'monthly',
      mode: 'scheduled',
      count: undefined,
      lines: [{ description: '', amount: 0, account: '', debit: 0, credit: 0 }]
    }
  })
  const kind = watch('kind')
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const [error, setError] = useState<string|undefined>()

  async function onSubmit(values: FormValues) {
    setError(undefined)
    try {
      const remaining = typeof values.count === 'number' && values.count>0 ? values.count : undefined
      const body = {
        kind: values.kind,
        name: values.name,
        status: 'active' as const,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        frequency: values.frequency,
        mode: values.mode,
        remainingRuns: remaining,
        totalRuns: remaining,
        lines: values.lines.map(l => ({
          description: l.description || 'Line',
          amount: Number(l.amount)||Number(l.debit)||Number(l.credit)||0,
          account: l.account,
          debit: Number(l.debit)||0,
          credit: Number(l.credit)||0,
        })),
        memo: '',
        currency: 'USD'
      }
      const r = await fetch('/api/recurring-transactions', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
      const j = await r.json().catch(()=>null)
      if (!r.ok) throw new Error(j?.error || 'Failed to create template')
      router.push(toHref('/transactions/recurring-transactions'))
    } catch(e:any) {
      setError(e.message || 'Failed to create template')
    }
  }

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Recurring Template</h1>
      <p className="text-slate-600 text-sm mb-4">Define a template to automate journals, invoices, or bills on a set schedule. You can change or pause it later.</p>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Template name</label>
            <input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="e.g. Monthly Rent Accrual" {...register('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('kind')}>
              <option value="journal">Journal</option>
              <option value="invoice">Invoice</option>
              <option value="bill">Bill</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Start date</label>
            <input type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('startDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">End date (optional)</label>
            <input type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('endDate')} />
            <p className="text-xs text-slate-500 mt-1">Runs stop after this date. The last run is allowed on the end date.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Frequency</label>
            <select className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('frequency')}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mode</label>
            <select className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('mode')}>
              <option value="scheduled">Scheduled</option>
              <option value="reminder">Reminder</option>
              <option value="unscheduled">Unscheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Occurrences (optional)</label>
            <input type="number" min={1} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="e.g. 12" {...register('count')} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Lines</span>
            <button type="button" className="btn-secondary" onClick={()=> append(kind==='journal'? { account: '', description: '', debit: 0, credit: 0 } : { description: '', amount: 0 })}>+ Add line</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {kind === 'journal' ? (
              <table className="min-w-full text-sm">
                <thead className="text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Debit</th>
                    <th className="px-3 py-2 text-right">Credit</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {fields.map((f, idx) => (
                    <tr key={f.id} className="border-t border-slate-200">
                      <td className="px-3 py-2"><input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Account" {...register(`lines.${idx}.account` as const)} /></td>
                      <td className="px-3 py-2"><input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Memo" {...register(`lines.${idx}.description` as const)} /></td>
                      <td className="px-3 py-2 text-right"><input type="number" step="0.01" min={0} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" {...register(`lines.${idx}.debit` as const)} /></td>
                      <td className="px-3 py-2 text-right"><input type="number" step="0.01" min={0} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" {...register(`lines.${idx}.credit` as const)} /></td>
                      <td className="px-3 py-2 text-right"><button type="button" className="btn-secondary" onClick={()=> remove(idx)} disabled={fields.length<=2}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {fields.map((f, idx) => (
                    <tr key={f.id} className="border-t border-slate-200">
                      <td className="px-3 py-2"><input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Item description" {...register(`lines.${idx}.description` as const)} /></td>
                      <td className="px-3 py-2 text-right"><input type="number" step="0.01" min={0.01} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" {...register(`lines.${idx}.amount` as const)} /></td>
                      <td className="px-3 py-2 text-right"><button type="button" className="btn-secondary" onClick={()=> remove(idx)} disabled={fields.length<=1}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {errors.root && <div className="text-red-600 text-sm">{(errors.root as any).message}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting? 'Creating…' : 'Create Template'}</button>
          <button type="button" className="btn-secondary" onClick={()=> router.push(toHref('/transactions/recurring-transactions'))}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
