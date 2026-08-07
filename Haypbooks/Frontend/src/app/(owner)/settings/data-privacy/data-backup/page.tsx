import { useState, useEffect } from 'react'
import { HardDrive, RefreshCw, Loader2, Download } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'

export default function DataBackupPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await settingsService.getBackupHistory(companyId)
      setBackups(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load backup history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handleCreateBackup = async () => {
    if (!companyId) return
    setCreating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await settingsService.createBackup(companyId)
      setSuccessMessage('Backup created successfully.')
      window.setTimeout(() => setSuccessMessage(null), 3000)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create backup')
    } finally {
      setCreating(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <HardDrive className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Data Backup</h2>
            <p className="mt-1 text-sm text-slate-500">Manage manual backups and view backup history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={handleCreateBackup}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <HardDrive size={16} />
                Create Backup
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DATE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SIZE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                  No backups available. Create your first backup to get started.
                </td>
              </tr>
            ) : (
              backups.map((item) => {
                const status = item.status || 'Completed'
                const statusClasses =
                  status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : status === 'In Progress'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                return (
                  <tr key={item.id || item.date} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.date ? new Date(item.date).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.type === 'Manual' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.type || 'Manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.size || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <button type="button" className="text-slate-400 hover:text-emerald-600 inline-flex items-center gap-2">
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
