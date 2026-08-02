'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { organizationService } from '@/services/organization.service'
import { Building2, RefreshCw } from 'lucide-react'

export default function Page() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEntities = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const res = await organizationService.listLegalEntities(companyId)
      setEntities(Array.isArray(res.data) ? res.data : (res.data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load legal entities')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchEntities()
  }, [fetchEntities])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Organization</p>
          <h1 className="text-3xl font-semibold text-slate-900">Legal Entities</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            View the legal entities registered under the selected company.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchEntities}
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
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Type</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Tax ID</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Registration</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Jurisdiction</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Currency</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left font-semibold uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    Loading legal entities...
                  </td>
                </tr>
              ) : entities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No legal entities found.
                  </td>
                </tr>
              ) : (
                entities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{entity.name}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.entityType ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.taxId ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.registrationNo ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.jurisdiction ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.currency ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${entity.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {entity.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{entity.createdAt ? format(new Date(entity.createdAt), 'MMM d, yyyy') : '—'}</td>
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
