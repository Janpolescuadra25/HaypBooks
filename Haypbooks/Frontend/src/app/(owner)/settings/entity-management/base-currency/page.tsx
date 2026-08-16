'use client'

import { FormEvent, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { useCompany } from '@/hooks/use-company'
import { useCompanyId } from '@/hooks/useCompanyId'
import { currencyService, type CurrencyDefinition } from '@/services/currency.service'

type CurrencyOption = { code: string; label: string }

const FALLBACK_CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'PHP', label: 'PHP - Philippine Peso' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
]

function SelectGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: CurrencyOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

export default function Page() {
  const { company, loading: companyLoading } = useCompany()
  const { companyId, loading: companyIdLoading, error: companyError } = useCompanyId()
  const [currency, setCurrency] = useState<string>('USD')
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>(FALLBACK_CURRENCY_OPTIONS)
  const [currenciesLoading, setCurrenciesLoading] = useState(true)
  const [currenciesError, setCurrenciesError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (company?.currency) {
      setCurrency(company.currency)
    }
  }, [company?.currency])

  useEffect(() => {
    let cancelled = false
    setCurrenciesLoading(true)
    setCurrenciesError(null)

    currencyService.listCurrencies()
      .then((response) => {
        if (cancelled) return
        const options = (response.data ?? [])
          .map((item: CurrencyDefinition) => ({
            code: item.code,
            label: `${item.code} - ${item.name}`,
          }))
        const currentValue = company?.currency
        if (currentValue && !options.some((option) => option.code === currentValue)) {
          options.unshift({ code: currentValue, label: currentValue })
        }
        setCurrencyOptions(options.length ? options : FALLBACK_CURRENCY_OPTIONS)
      })
      .catch(() => {
        if (cancelled) return
        setCurrenciesError('Unable to load currency options. Using default list.')
        setCurrencyOptions(FALLBACK_CURRENCY_OPTIONS)
      })
      .finally(() => {
        if (!cancelled) setCurrenciesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [company?.currency])

  const isLoading = companyLoading || companyIdLoading || currenciesLoading
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
            <SelectGroup label="Base currency" options={currencyOptions} value={currency} onChange={setCurrency} />
            {currenciesError ? (
              <p className="text-sm text-rose-600">{currenciesError}</p>
            ) : null}
            <p className="text-sm text-slate-500">
              Changing the base currency updates the company default currency for new transactions and reports.
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
