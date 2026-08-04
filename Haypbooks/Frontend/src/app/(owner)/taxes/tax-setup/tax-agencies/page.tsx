'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { RefreshCw, Building2, MapPin } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService } from '@/services/tax.service'

const JURISDICTION_TYPE_STYLES: Record<string, string> = {
  FEDERAL: 'bg-blue-100 text-blue-700',
  STATE: 'bg-slate-100 text-slate-600',
  LOCAL: 'bg-amber-100 text-amber-700',
  MUNICIPAL: 'bg-emerald-100 text-emerald-700',
  SPECIAL: 'bg-rose-100 text-rose-700',
}

const TAB_OPTIONS = [
  { value: 'agencies', label: 'Agencies' },
  { value: 'jurisdictions', label: 'Jurisdictions' },
] as const

type Tab = (typeof TAB_OPTIONS)[number]['value']

function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export default function TaxAgenciesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()

  const [activeTab, setActiveTab] = useState<Tab>('agencies')
  const [agencies, setAgencies] = useState<any[]>([])
  const [jurisdictions, setJurisdictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: agenciesData }, { data: jurisdictionsData }] = await Promise.all([
        taxService.getAgencies(companyId),
        taxService.getJurisdictions(companyId),
      ])

      const agenciesList = Array.isArray(agenciesData) ? agenciesData : (agenciesData?.data ?? [])
      const jurisdictionsList = Array.isArray(jurisdictionsData) ? jurisdictionsData : (jurisdictionsData?.data ?? [])

      setAgencies(agenciesList)
      setJurisdictions(jurisdictionsList)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax agencies and jurisdictions')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchData()
  }, [companyLoading, companyId, fetchData])

  const agencyEmpty = !loading && !agencies.length
  const jurisdictionEmpty = !loading && !jurisdictions.length

  const nearestObligationDate = (obligations: any[]) => {
    if (!obligations?.length) return null
    const sorted = [...obligations].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    return sorted[0]?.dueDate
  }

  const jurisdictionRatesText = (rates: any[]) => {
    if (!rates?.length) return '0'
    const formatted = rates.slice(0, 2).map((rate) => `${rate.name} (${Number(rate.rate).toFixed(2)}%)`)
    return formatted.join(', ') + (rates.length > 2 ? ` +${rates.length - 2} more` : '')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Tax Agencies & Jurisdictions</h2>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.value ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </div>
      ) : activeTab === 'agencies' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Agencies</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Code</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Filing Methods</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Upcoming Obligations</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="h-8 w-8 mb-2 text-slate-300" />
                        <p className="text-sm">No tax agencies found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  agencies.map((agency) => (
                    <tr key={agency.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{agency.name}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">
                          {agency.code}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${JURISDICTION_TYPE_STYLES[agency.jurisdictionType] ?? 'bg-slate-100 text-slate-600'}`}>
                          {agency.jurisdictionType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {agency.filingMethods?.length ? agency.filingMethods.join(', ') : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {agency.obligations?.length ? (
                          <div className="space-y-1">
                            <span>{agency.obligations.length} obligation{agency.obligations.length === 1 ? '' : 's'}</span>
                            {nearestObligationDate(agency.obligations) && (
                              <span className="text-xs text-slate-500">{formatDate(nearestObligationDate(agency.obligations)!)}</span>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{agency.contactInfo?.email ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Jurisdictions</h2>
          </div>
          {jurisdictionEmpty ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <MapPin className="h-8 w-8 mb-2 text-slate-300" />
              <p className="text-sm">No jurisdictions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Region</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Code</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tax Rates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jurisdictions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <MapPin className="h-8 w-8 mb-2 text-slate-300" />
                          <p className="text-sm">No jurisdictions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    jurisdictions.map((jurisdiction) => (
                      <tr key={jurisdiction.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">{jurisdiction.name}</td>
                        <td className="px-5 py-3 text-slate-700">{jurisdiction.region ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">
                            {jurisdiction.code ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${jurisdiction.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {jurisdiction.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          <div className="space-y-1">
                            <span>{jurisdiction.taxRates?.length ?? 0}</span>
                            {jurisdiction.taxRates?.length ? (
                              <span className="text-xs text-slate-500">{jurisdictionRatesText(jurisdiction.taxRates)}</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
