'use client'

import { FormEvent, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { useCompany } from '@/hooks/use-company'
import { useCompanyId } from '@/hooks/useCompanyId'

const CURRENCIES = ['USD', 'EUR', 'PHP', 'GBP', 'AUD', 'CAD'] as const

type CurrencyCode = (typeof CURRENCIES)[number]

function SelectGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly CurrencyCode[]
  value: string
  onChange: (value: CurrencyCode) => void
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CurrencyCode)}
        className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export default function Page() {
  const { company, loading: companyLoading } = useCompany()
  const { companyId, loading: companyIdLoading, error: companyError } = useCompanyId()
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (company?.currency) {
      setCurrency(company.currency as CurrencyCode)
    }
  }, [company?.currency])

  const isLoading = companyLoading || companyIdLoading
  const canSave = !isLoading && !!companyId

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!companyId) return
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      await apiClient.put(`/companies/${companyId}`, { currency })
      setMessage('Base currency saved successfully.')
    } catch (err) {
      setError('Unable to save base currency. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Base Currency</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set the company base currency used by invoices, bills, reports, and accounting totals.
        </p>
      </div>

      {companyError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {companyError}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            The active company is <strong>{company?.name ?? 'loading...'}</strong>.
            The selected currency becomes the default for new transactions and reports.
          </div>

          <div className="space-y-2">
            <SelectGroup label="Base currency" options={CURRENCIES} value={currency} onChange={setCurrency} />
            <p className="text-sm text-slate-500">
              Changing the base currency updates company settings. Existing transaction amounts remain unchanged.
            </p>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canSave || saving}
        >
          {saving ? 'Saving...' : 'Save base currency'}
        </button>
      </form>
    </div>
  )
}
