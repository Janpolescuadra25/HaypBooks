import { useState, useEffect, FormEvent } from 'react'
import { Eye, RefreshCw, Loader2, Trash2, Plus } from 'lucide-react'
import { integrationService } from '@/services/integration.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const STATUS_BADGE: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Processing: 'bg-amber-50 text-amber-700',
  Failed: 'bg-rose-50 text-rose-700',
  Pending: 'bg-slate-100 text-slate-600',
  Validating: 'bg-blue-50 text-blue-700',
}

const DATA_TYPES = ['Invoices', 'Transactions', 'Contacts', 'Products', 'Journal Entries', 'Chart of Accounts']

export default function ImportDataPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [dataType, setDataType] = useState('Invoices')
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState('Auto-detect')
  const [errors, setErrors] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await integrationService.getImportJobs(companyId)
      setJobs(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load import jobs' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 3000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const handleCreate = () => {
    setName('')
    setDataType('Invoices')
    setFileName('')
    setMapping('Auto-detect')
    setFeedback(null)
    setViewingItem(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim() || !fileName.trim()) {
      setFeedback({ type: 'error', message: 'Import Name and Source File are required.' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      await integrationService.createImportJob(companyId, {
        name,
        dataType,
        sourceFile: fileName,
        mappingPreset: mapping,
      })
      setFeedback({ type: 'success', message: 'Import job created' })
      setModalOpen(false)
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to create import job' })
    } finally {
      setSaving(false)
    }
  }

  const handleView = async (item: any) => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await integrationService.getImportJobStatus(companyId, item.id)
      setViewingItem(Array.isArray(response.data) ? response.data[0] : response.data)
      setErrors(response.data?.errors?.join('\n') || '')
      setModalOpen(true)
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load import status' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this import job?')) return
    setLoading(true)
    try {
      await integrationService.deleteImportJob(companyId, item.id)
      setFeedback({ type: 'success', message: 'Import job deleted' })
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete import job' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const openCreateModal = () => {
    setViewingItem(null)
    setModalOpen(true)
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
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Eye className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Import Data</h2>
            <p className="mt-1 text-sm text-slate-500">Import data from external files and sources</p>
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
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            New Import
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`rounded-2xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {feedback.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">IMPORT NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SOURCE FILE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">RECORDS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PROGRESS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  No import jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((item) => {
                const progress = item.progress ?? 0
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.sourceFile || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.type || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.processed != null ? `Processed: ${item.processed} / ${item.total}` : item.records ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-slate-500">{progress}%</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <HaypModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={viewingItem ? 'Import Status' : 'New Import'}
        subtitle={viewingItem ? 'View import job details' : 'Create a new import job'}
        size="md"
        closeOnOverlayClick={true}
      >
        {viewingItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Import Name</label>
                <input
                  type="text"
                  value={viewingItem.name || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Source File</label>
                <input
                  type="text"
                  value={viewingItem.sourceFile || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Type</label>
                <input
                  type="text"
                  value={viewingItem.type || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <input
                  type="text"
                  value={viewingItem.status || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Records Processed</label>
              <input
                type="text"
                value={viewingItem.processed != null ? `${viewingItem.processed} / ${viewingItem.total}` : ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Errors</label>
              <textarea
                value={errors}
                disabled
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Import Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Type</label>
                  <select
                    value={dataType}
                    onChange={(event) => setDataType(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DATA_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Source File</label>
                  <label className="block rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 cursor-pointer hover:border-slate-400">
                    <span>Click or drag file to upload</span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {fileName && <p className="mt-2 text-sm text-slate-600">Selected file: {fileName}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mapping Preset</label>
                  <select
                    value={mapping}
                    onChange={(event) => setMapping(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Auto-detect">Auto-detect</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="inline-flex items-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    'Create Import'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </HaypModal>
    </div>
  )
}
