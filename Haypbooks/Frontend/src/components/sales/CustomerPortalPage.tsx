'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type PortalFeature = {
  id: string
  feature: string
  description: string
  visibility: 'Public' | 'Registered' | 'VIP'
  status: 'Enabled' | 'Disabled'
}

export default function CustomerPortalPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/customers`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const data: PortalFeature[] = [
    { id: 'f1', feature: 'View Invoices', description: 'Allow customers to see invoice history', visibility: 'Registered', status: 'Enabled' },
    { id: 'f2', feature: 'Pay Online', description: 'Enable online payment options in portal', visibility: 'Registered', status: 'Enabled' },
    { id: 'f3', feature: 'Download Statements', description: 'Download PDF statements for accounting', visibility: 'VIP', status: 'Disabled' },
  ]

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      row.feature.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q) ||
      row.visibility.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Configure the client-facing portal experience</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">Configure Portal</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Customer Portal" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search portal features"
            placeholder="Search portal features"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by feature, description, visibility, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Feature</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Visibility</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">No features found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.feature}</td>
                    <td className="px-4 py-3 text-slate-600">{row.description}</td>
                    <td className="px-4 py-3 text-slate-600">{row.visibility}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Enabled' ? 'text-emerald-700' : 'text-rose-700'}`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Portal Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Configure which features are available to portal users and segment by access level.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enable public or restricted features for different tiers.</li>
                <li>Manage portal access and monitor availability.</li>
                <li>Use this to improve customer self-service experience.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
