import { useState, useEffect, FormEvent } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export default function FiscalYearSetupPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [startMonth, setStartMonth] = useState(1)
  const [endMonth, setEndMonth] = useState(12)
  const [currentFiscalYear, setCurrentFiscalYear] = useState('')
  const [periodNamingConvention, setPeriodNamingConvention] = useState('month')
  const [autoClosePeriods, setAutoClosePeriods] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return
      setLoading(true)
      setErrorMessage(null)

      try {
        const response = await settingsService.getFiscalYearSetup(companyId)
        const data = response.data ?? {}
        setStartMonth(data.startMonth || 1)
        setEndMonth(data.endMonth || 12)
        setCurrentFiscalYear(data.currentFiscalYear?.toString() || '')
        setPeriodNamingConvention(data.periodNamingConvention || 'month')
        setAutoClosePeriods(data.autoClosePeriods ?? false)
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load fiscal year setup')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [companyId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!currentFiscalYear.trim()) {
      setErrorMessage('Current Fiscal Year is required.')
      return
    }

    const parsedYear = Number(currentFiscalYear)
    if (Number.isNaN(parsedYear) || parsedYear <= 0) {
      setErrorMessage('Current Fiscal Year must be a valid number.')
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await settingsService.updateFiscalYearSetup(companyId, {
        startMonth,
        endMonth,
        currentFiscalYear: parsedYear,
        periodNamingConvention,
        autoClosePeriods,
      })
      setSuccessMessage('Fiscal year setup updated successfully.')
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save fiscal year setup')
    } finally {
      setSaving(false)
    }
  }

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {companyIdError}
        </div>
      </div>
    )
  }

  if (companyIdLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Fiscal Year Setup</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">Configure your fiscal year periods and naming conventions</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit}>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Fiscal Year Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fiscal Year Start</label>
              <select
                value={startMonth}
                onChange={(event) => setStartMonth(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fiscal Year End</label>
              <select
                value={endMonth}
                onChange={(event) => setEndMonth(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Fiscal Year</label>
              <input
                type="number"
                placeholder="e.g. 2026"
                value={currentFiscalYear}
                onChange={(event) => setCurrentFiscalYear(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Period Naming Convention</label>
              <select
                value={periodNamingConvention}
                onChange={(event) => setPeriodNamingConvention(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="month">Month Name</option>
                <option value="period">Period Number</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Auto-Close Periods</label>
                  <p className="text-xs text-slate-500">Automatically close accounting periods after month-end</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoClosePeriods(!autoClosePeriods)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoClosePeriods ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoClosePeriods ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 mb-4"></div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="inline-flex items-center">
                <Loader2 size={16} className="animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          {successMessage && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
