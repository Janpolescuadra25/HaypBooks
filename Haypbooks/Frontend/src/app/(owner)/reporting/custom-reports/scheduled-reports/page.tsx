'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Clock, Download, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { reportingService } from '@/services/reporting.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const REPORT_TYPE_OPTIONS = [
  { value: 'Banking', label: 'Banking' },
  { value: 'Expense', label: 'Expense' },
  { value: 'Inventory', label: 'Inventory' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Project', label: 'Project' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Custom', label: 'Custom' },
]

const FREQUENCY_OPTIONS = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
]

const FORMAT_OPTIONS = [
  { value: 'CSV', label: 'CSV' },
  { value: 'PDF', label: 'PDF' },
]

export default function Page() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [reportType, setReportType] = useState(REPORT_TYPE_OPTIONS[0].value)
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[1].value)
  const [recipients, setRecipients] = useState('')
  const [format, setFormat] = useState(FORMAT_OPTIONS[0].value)
  const [active, setActive] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await reportingService.getScheduledReports(companyId)
      setReports(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load scheduled reports')
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
    setReportType(REPORT_TYPE_OPTIONS[0].value)
    setFrequency(FREQUENCY_OPTIONS[1].value)
    setRecipients('')
    setFormat(FORMAT_OPTIONS[0].value)
    setActive(true)
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setReportType(item.reportType || REPORT_TYPE_OPTIONS[0].value)
    setFrequency(item.frequency || FREQUENCY_OPTIONS[1].value)
    setRecipients(item.recipients || '')
    setFormat(item.format || FORMAT_OPTIONS[0].value)
    setActive(item.active ?? true)
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
        reportType,
        frequency,
        recipients,
        format,
        active,
      }

      if (editingItem) {
        await reportingService.updateScheduledReport(companyId, editingItem.id, payload)
        setBanner({ type: 'success', message: 'Scheduled report updated successfully' })
      } else {
        await reportingService.createScheduledReport(companyId, payload)
        setBanner({ type: 'success', message: 'Scheduled report created successfully' })
      }

      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save scheduled report')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this scheduled report?')) return
    setLoading(true)
    try {
      await reportingService.deleteScheduledReport(companyId, item.id)
      setBanner({ type: 'success', message: 'Scheduled report deleted successfully' })
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete scheduled report')
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
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Scheduled Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Automate report delivery with schedules and recipients</p>
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
            Schedule Report
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">FREQUENCY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">RECIPIENTS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">FORMAT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">NEXT RUN</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  No scheduled reports yet. Schedule a report to receive it automatically.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.frequency || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.recipients || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.format || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.nextRun ? new Date(item.nextRun).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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
        title={editingItem ? 'Edit Scheduled Report' : 'Schedule Report'}
        subtitle={editingItem ? 'Update your scheduled report' : 'Create a new scheduled report' }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Type</label>
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {REPORT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
                <select
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipients</label>
              <input
                type="text"
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
                placeholder="alice@example.com, bob@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Active</p>
                  <p className="text-xs text-slate-500">Enable or disable this schedule</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
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
                  editingItem ? 'Save Changes' : 'Create Schedule'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
