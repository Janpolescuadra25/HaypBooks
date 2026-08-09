'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { reportingService } from '@/services/reporting.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const DATA_SOURCE_OPTIONS = [
  { value: 'Banking', label: 'Banking' },
  { value: 'Expenses', label: 'Expenses' },
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Projects', label: 'Projects' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Financial Statements', label: 'Financial Statements' },
]

export default function Page() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [dataSource, setDataSource] = useState(DATA_SOURCE_OPTIONS[0].value)
  const [description, setDescription] = useState('')
  const [columns, setColumns] = useState('')
  const [filters, setFilters] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await reportingService.getCustomReports(companyId)
      setReports(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load custom reports')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!banner) return
    const timer = window.setTimeout(() => setBanner(null), 3000)
    return () => window.clearTimeout(timer)
  }, [banner])

  const filteredReports = reports.filter((report) =>
    report.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setEditingItem(null)
    setName('')
    setDataSource(DATA_SOURCE_OPTIONS[0].value)
    setDescription('')
    setColumns('')
    setFilters('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setDataSource(item.dataSource || DATA_SOURCE_OPTIONS[0].value)
    setDescription(item.description || '')
    setColumns(item.columns || '')
    setFilters(item.filters || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim()) {
      setErrorMessage('Report Name is required.')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        name,
        dataSource,
        description,
        columns,
        filters,
      }

      if (editingItem) {
        await reportingService.updateCustomReport(companyId, editingItem.id, payload)
        setBanner({ type: 'success', message: 'Custom report updated successfully' })
      } else {
        await reportingService.createCustomReport(companyId, payload)
        setBanner({ type: 'success', message: 'Custom report created successfully' })
      }

      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save custom report')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this custom report?')) return
    setLoading(true)
    try {
      await reportingService.deleteCustomReport(companyId, item.id)
      setBanner({ type: 'success', message: 'Custom report deleted successfully' })
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete custom report')
    } finally {
      setLoading(false)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Custom Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Create, edit, and manage reusable custom reports</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reports"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Add Report
          </button>
        </div>
      </div>

      {banner && (
        <div className={`rounded-2xl border p-4 text-sm ${banner.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {banner.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">REPORT NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DATA SOURCE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CREATED BY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CREATED DATE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">LAST MODIFIED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No custom reports yet. Create your first custom report to get started.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.dataSource || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.createdBy || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-slate-700 flex items-center gap-3">
                    <button type="button" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-emerald-600">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <HaypModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Custom Report' : 'Create Custom Report'}
        subtitle={editingItem ? 'Update report settings' : 'Define a new custom report'}
        size="lg"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Source</label>
              <select
                value={dataSource}
                onChange={(event) => setDataSource(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DATA_SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Columns</label>
              <input
                type="text"
                value={columns}
                onChange={(event) => setColumns(event.target.value)}
                placeholder="date,description,amount"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Filters</label>
              <input
                type="text"
                value={filters}
                onChange={(event) => setFilters(event.target.value)}
                placeholder="date >= 2024-01-01"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
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
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  editingItem ? 'Save Changes' : 'Create Report'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
