'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type CustomerGroup = {
  id: string
  name: string
  description: string
  customerCount: number
  status: 'Active' | 'Inactive'
}

export default function CustomerGroupsPage() {
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

  const GROUPS: CustomerGroup[] = [
    { id: 'g1', name: 'Wholesale', description: 'High-volume business customers with tiered pricing', customerCount: 68, status: 'Active' },
    { id: 'g2', name: 'Retail', description: 'Standard retail customer group for smaller orders', customerCount: 124, status: 'Active' },
    { id: 'g3', name: 'VIP Clients', description: 'Priority customers with dedicated account managers', customerCount: 22, status: 'Active' },
  ]

  const filtered = useMemo(() => {
    if (!search) return GROUPS
    const q = search.toLowerCase()
    return GROUPS.filter((group) =>
      group.name.toLowerCase().includes(q) ||
      group.description.toLowerCase().includes(q) ||
      group.status.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Groups</h1>
            <p className="text-sm text-slate-500 mt-1">Organize customers into segments for reporting and pricing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Group</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for Customer Groups"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search customer groups"
            placeholder="Search customer groups"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by group name, description, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Group Name</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Customer Count</th>
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
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No customer groups found.
                  </td>
                </tr>
              ) : (
                filtered.map((group) => (
                  <tr key={group.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{group.name}</td>
                    <td className="px-4 py-3 text-slate-600">{group.description}</td>
                    <td className="px-4 py-3 text-right text-slate-800">{group.customerCount}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${group.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {group.status}
                    </td>
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
              <h2 className="text-lg font-bold">Customer Groups Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Use customer groups to segment and manage customer pricing, reporting, and workflows.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create groups for wholesale, retail, and VIP clients.</li>
                <li>Track group size and status for targeted campaigns.</li>
                <li>Use groups for pricing rules and report filters.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
