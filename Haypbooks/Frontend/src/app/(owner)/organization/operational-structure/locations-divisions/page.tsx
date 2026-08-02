'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { organizationService } from '@/services/organization.service'
import { MapPin, RefreshCw } from 'lucide-react'

export default function Page() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLocations = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const res = await organizationService.listLocations(companyId)
      setLocations(Array.isArray(res.data) ? res.data : (res.data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Organization</p>
          <h1 className="text-3xl font-semibold text-slate-900">Locations & Divisions</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage the locations and divisions tied to the selected company.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLocations}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {(companyError || error) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {companyError || error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Name</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Address</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">
                    Loading locations...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">
                    No locations found.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{location.name}</td>
                    <td className="px-5 py-4 text-slate-700">{location.address ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${location.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{location.createdAt ? format(new Date(location.createdAt), 'MMM d, yyyy') : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
