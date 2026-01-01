'use client'
import { useEffect, useMemo, useState } from 'react'
import { formatMMDDYYYY } from '@/lib/date'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

const lineSchema = z.object({
  account: z.string().min(1, 'Account required'),
  name: z.string().optional(),
  memo: z.string().optional(),
  debit: z.coerce.number().optional().transform((v) => (Number.isFinite(v!) ? v : 0)),
  credit: z.coerce.number().optional().transform((v) => (Number.isFinite(v!) ? v : 0)),
}).refine((l) => !(l.debit && l.credit) || (l.debit === 0 || l.credit === 0), {
  message: 'Only one of debit or credit may be non-zero',
  path: ['debit']
})

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  memo: z.string().optional(),
  lines: z.array(lineSchema).min(2, 'At least two lines'),
  reversing: z.object({ enabled: z.boolean(), date: z.string().optional() }).default({ enabled: false, date: '' }),
  recurring: z.object({ enabled: z.boolean(), frequency: z.enum(['daily','weekly','monthly']).optional(), count: z.coerce.number().optional() }).default({ enabled: false }),
  attachments: z.array(z.object({ name: z.string(), size: z.number() })).optional()
}).superRefine((val, ctx) => {
  const totals = val.lines.reduce((acc, l) => ({ debit: acc.debit + (l.debit || 0), credit: acc.credit + (l.credit || 0) }), { debit: 0, credit: 0 })
  if (Math.round((totals.debit - totals.credit) * 100) !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debits must equal credits' })
  }
  if (val.reversing.enabled && !val.reversing.date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Reversing date required when reversing is enabled' })
  }
  if (val.recurring.enabled && !val.recurring.frequency) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Frequency required for recurring entries' })
  }
})

type FormValues = z.infer<typeof schema>

type Account = { id: string; number: string; name: string; type: string }

export default function NewJournalEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([])
  const [accountList, setAccountList] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [closedThrough, setClosedThrough] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: today,
      memo: '',
      lines: [ { account: '', debit: 0, credit: 0 }, { account: '', debit: 0, credit: 0 } ],
      reversing: { enabled: false, date: '' },
      recurring: { enabled: false, frequency: undefined, count: undefined },
      attachments: [],
    }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  const totals = (watch('lines') || []).reduce((acc, l) => ({ debit: acc.debit + (Number(l.debit)||0), credit: acc.credit + (Number(l.credit)||0) }), { debit: 0, credit: 0 })
  const variance = useMemo(() => Number(((Number(totals.debit||0) - Number(totals.credit||0))).toFixed(2)), [totals])
  const reversingEnabled = watch('reversing.enabled')
  const recurringEnabled = watch('recurring.enabled')

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const metas = files.map(f => ({ name: f.name, size: f.size }))
    setAttachments(metas)
  }

  useEffect(() => {
    // If navigated with ?recurring=1, pre-enable recurring with a sensible default
    const rec = searchParams.get('recurring')
    if (rec === '1') {
      setValue('recurring.enabled', true, { shouldDirty: true })
      setValue('recurring.frequency', 'monthly', { shouldDirty: true })
    }
  }, [searchParams, setValue])

  useEffect(() => {
    // RBAC: guard access to journal creation for users without journal:write
    let alive = true
    async function guard() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('journal:write')
        if (alive && !can) router.replace('/journal')
      } catch {
        // ignore
      }
    }
    guard()
    return () => { alive = false }
  }, [router])

  useEffect(() => {
    let alive = true
    async function loadAccounts() {
      try {
        setAccountsLoading(true)
        const res = await fetch('/api/accounts', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (alive) setAccountList(data.accounts || [])
        }
      } finally {
        if (alive) setAccountsLoading(false)
      }
    }
    loadAccounts()
    return () => { alive = false }
  }, [])

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
      // First create the journal entry
      const res = await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, attachments }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create journal entry')

      // If user enabled recurring, immediately convert this into a recurring template
      if (values.recurring.enabled && values.recurring.frequency) {
        // Compute the next run date (one interval forward, month-end safe)
        function computeNextRun(dateISO: string, freq: 'daily' | 'weekly' | 'monthly') {
          const d = new Date(dateISO + 'T00:00:00Z')
          if (freq === 'daily') d.setUTCDate(d.getUTCDate() + 1)
          else if (freq === 'weekly') d.setUTCDate(d.getUTCDate() + 7)
          else if (freq === 'monthly') {
            const origDay = d.getUTCDate()
            const monthAfter = d.getUTCMonth() + 1
            const yearAfter = d.getUTCFullYear() + (monthAfter > 11 ? 1 : 0)
            // Last day of target month
            const lastDayTarget = new Date(Date.UTC(yearAfter, (d.getUTCMonth() + 1) + 1, 0)).getUTCDate()
            const clampedDay = Math.min(origDay, lastDayTarget)
            d.setUTCDate(1)
            d.setUTCMonth(d.getUTCMonth() + 1)
            d.setUTCDate(clampedDay)
          }
          return d.toISOString().slice(0, 10)
        }

        const journal = data?.journal
        const startDate = journal?.date?.slice(0,10) || values.date
        const nextRunDate = computeNextRun(startDate, values.recurring.frequency)
        const remaining = typeof values.recurring.count === 'number' && values.recurring.count > 0 ? values.recurring.count - 1 : undefined
        const total = typeof values.recurring.count === 'number' && values.recurring.count > 0 ? values.recurring.count : undefined
        // Build template name - use memo or journal number as a suffix for clarity
        const templateName = (values.memo?.trim() ? values.memo.trim() : 'Recurring Journal') + (journal?.number ? ` (${journal.number})` : '')
        const tmplBody = {
          kind: 'journal',
          name: templateName,
          status: 'active',
          startDate,
          frequency: values.recurring.frequency,
          nextRunDate,
          remainingRuns: remaining,
          totalRuns: total,
          lines: (values.lines || []).map(l => ({
            account: l.account,
            description: (l.memo || l.name || l.account || '').slice(0,60) || 'Line',
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
            amount: Number(l.debit) || Number(l.credit) || 0
          })),
          memo: values.memo || '',
          currency: 'USD',
          mode: 'scheduled'
        }
        try {
          const rtRes = await fetch('/api/recurring-transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tmplBody) })
          // Ignore template creation failure silently but surface error if needed
          if (!rtRes.ok) {
            const errJ = await rtRes.json().catch(()=>null)
            console.warn('Failed to create recurring template', errJ)
          }
        } catch (err) {
          console.warn('Recurring template creation error', err)
        }
        // Redirect user to recurring list for immediate visibility of the new template
        router.push('/transactions/recurring-transactions')
        return
      }

      // Non-recurring: just go back to journal list
      router.push('/journal')
    } catch (e: any) {
      setError(e.message || 'Failed to create journal entry')
    }
  }

  const selectedDate = (typeof window !== 'undefined') ? (document.getElementById('je-date') as HTMLInputElement | null)?.value || '' : ''
  const isBlocked = useMemo(() => {
    if (!closedThrough) return false
    const d = (selectedDate || today)
    // Compare lexicographically since format is YYYY-MM-DD
    return d <= closedThrough
  }, [closedThrough, selectedDate, today])

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Journal Entry</h1>
    {closedThrough && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
      Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Entries dated on or before this date will be blocked.
        </div>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="je-date">Date</label>
            {errors.date ? (
              <input
                id="je-date"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                aria-invalid="true"
                aria-describedby="je-date-error"
                {...register('date')}
              />
            ) : (
              <input
                id="je-date"
                type="date"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                {...register('date')}
              />
            )}
            {errors.date && <p id="je-date-error" className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
            {closedThrough && (
              <p className="text-amber-700 text-sm mt-1" role="status">
                {isBlocked ? 'Selected date is within a closed period. Choose a later date.' : 'Dates on or before the closed-through date are blocked.'}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Memo</label>
            <input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" placeholder="Optional memo" {...register('memo')} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Lines</span>
            <button type="button" className="btn-secondary" onClick={() => append({ account: '', memo: '', name: '', debit: 0, credit: 0 })}>+ Add line</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Account</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Name</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Memo</th>
                  <th className="px-3 py-2 text-right">Debit</th>
                  <th className="px-3 py-2 text-right">Credit</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {fields.map((f, idx) => (
                  <tr key={f.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      {errors.lines?.[idx]?.account ? (
                        <select
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                          aria-invalid="true"
                          aria-describedby={`je-line-${idx}-account-error`}
                          {...register(`lines.${idx}.account` as const)}
                        >
                          <option value="">Select account…</option>
                          {accountList.map((a) => (
                            <option key={a.id} value={`${a.number} · ${a.name}`}>{a.number} · {a.name}</option>
                          ))}
                          {accountsLoading && <option disabled>Loading accounts…</option>}
                        </select>
                      ) : (
                        <select
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50"
                          {...register(`lines.${idx}.account` as const)}
                        >
                          <option value="">Select account…</option>
                          {accountList.map((a) => (
                            <option key={a.id} value={`${a.number} · ${a.name}`}>{a.number} · {a.name}</option>
                          ))}
                          {accountsLoading && <option disabled>Loading accounts…</option>}
                        </select>
                      )}
                      {errors.lines?.[idx]?.account && <p id={`je-line-${idx}-account-error`} className="text-red-600 text-sm mt-1">{errors.lines[idx]?.account?.message as any}</p>}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" placeholder="Name/Payee" {...register(`lines.${idx}.name` as const)} />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" placeholder="Line memo" {...register(`lines.${idx}.memo` as const)} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {errors.lines?.[idx]?.debit ? (
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          inputMode="decimal"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-sky-400/50"
                          aria-invalid="true"
                          aria-describedby={`je-line-${idx}-amount-error`}
                          {...register(`lines.${idx}.debit` as const, {
                            onChange: (e) => {
                              const v = parseFloat((e?.target?.value ?? '').toString())
                              if (!isNaN(v) && v > 0) {
                                setValue(`lines.${idx}.credit` as const, 0, { shouldValidate: true, shouldDirty: true })
                              }
                            },
                          })}
                        />
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          inputMode="decimal"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-sky-400/50"
                          {...register(`lines.${idx}.debit` as const, {
                            onChange: (e) => {
                              const v = parseFloat((e?.target?.value ?? '').toString())
                              if (!isNaN(v) && v > 0) {
                                setValue(`lines.${idx}.credit` as const, 0, { shouldValidate: true, shouldDirty: true })
                              }
                            },
                          })}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {errors.lines?.[idx]?.debit ? (
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          inputMode="decimal"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-sky-400/50"
                          aria-invalid="true"
                          aria-describedby={`je-line-${idx}-amount-error`}
                          {...register(`lines.${idx}.credit` as const, {
                            onChange: (e) => {
                              const v = parseFloat((e?.target?.value ?? '').toString())
                              if (!isNaN(v) && v > 0) {
                                setValue(`lines.${idx}.debit` as const, 0, { shouldValidate: true, shouldDirty: true })
                              }
                            },
                          })}
                        />
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          inputMode="decimal"
                          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-sky-400/50"
                          {...register(`lines.${idx}.credit` as const, {
                            onChange: (e) => {
                              const v = parseFloat((e?.target?.value ?? '').toString())
                              if (!isNaN(v) && v > 0) {
                                setValue(`lines.${idx}.debit` as const, 0, { shouldValidate: true, shouldDirty: true })
                              }
                            },
                          })}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="btn-secondary" onClick={() => remove(idx)} disabled={fields.length <= 2}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Combined row-level amount error when both debit and credit are set */}
              {fields.map((_f, idx) => (
                errors.lines?.[idx]?.debit ? (
                  <caption key={`err-${idx}`} className="text-left px-3 pt-1 text-red-600 text-sm" id={`je-line-${idx}-amount-error`}>
                    {String(errors.lines?.[idx]?.debit?.message || 'Only one of debit or credit may be non-zero')}
                  </caption>
                ) : null
              ))}
              <tfoot className="text-slate-800">
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2" colSpan={3}><span className="text-slate-700">Totals</span></td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums"><Amount value={Number(totals.debit || 0)} /></td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums"><Amount value={Number(totals.credit || 0)} /></td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          {errors.lines && typeof errors.lines?.message === 'string' && <p className="text-red-600 text-sm mt-1">{errors.lines.message as any}</p>}
        </div>

  {/* Difference in totals (Debits - Credits) */}
        <div
          className={
            `mt-2 text-sm ${variance === 0 ? 'text-emerald-700' : 'text-red-700'}`
          }
          role="status"
          aria-live="polite"
          aria-atomic="true"
          id="je-variance"
        >
          <span className="font-medium">Difference:</span>{' '}
          <span className="tabular-nums">
            <Amount value={variance} />
          </span>
          {variance !== 0 && (
            <span className="ml-2">
              Debits must equal credits before saving.
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card bg-white/70">
            <h3 className="font-medium text-slate-900 mb-2">Attachments</h3>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="files">Upload files</label>
            <input id="files" name="files" type="file" multiple onChange={onFilesSelected} className="block w-full text-sm text-slate-700" />
            {attachments.length > 0 && (
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5">
                {attachments.map((f) => <li key={f.name}>{f.name} ({Math.round(f.size/1024)} KB)</li>)}
              </ul>
            )}
          </div>
          <div className="glass-card bg-white/70">
            <h3 className="font-medium text-slate-900 mb-2">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('reversing.enabled')} />
                <span className="text-slate-800">Reversing entry</span>
              </label>
              {reversingEnabled && (
                <div className="pl-6">
                  <label className="block text-sm font-medium text-slate-700">Reverse on date</label>
                  <input type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('reversing.date')} />
                </div>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('recurring.enabled')} />
                <span className="text-slate-800">Recurring</span>
              </label>
              {recurringEnabled && (
                <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Frequency</label>
                    <select className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('recurring.frequency')}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Occurrences</label>
                    <input type="number" min={1} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" placeholder="e.g. 12" {...register('recurring.count')} />
                  </div>
                  <div className="sm:col-span-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-200" role="note">
                    Checking Recurring creates a centralized template after saving. Future schedules & runs are managed under <a href="/transactions/recurring-transactions" className="text-sky-700 underline">Recurring Transactions</a>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" aria-describedby="je-variance" disabled={isSubmitting || Math.round((totals.debit - totals.credit)*100) !== 0 || isBlocked}>
            {isSubmitting ? 'Saving…' : 'Save Journal Entry'}
          </button>
          <BackButton ariaLabel="Back to Journal" fallback="/journal" disabled={isSubmitting}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
