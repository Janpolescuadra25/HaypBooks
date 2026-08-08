import { useState, useEffect, FormEvent } from 'react'
import { ScrollText, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { complianceService } from '@/services/compliance.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const POLICY_CATEGORIES = [
  'Financial',
  'Operational',
  'Regulatory',
  'Information Security',
  'HR',
  'Environmental',
]

const POLICY_STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Draft: 'bg-slate-100 text-slate-600',
  'Under Review': 'bg-amber-50 text-amber-700',
  Archived: 'bg-rose-50 text-rose-700',
}

export default function PolicyManagementPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(POLICY_CATEGORIES[0])
  const [version, setVersion] = useState('1.0')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [status, setStatus] = useState('Active')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await complianceService.getPolicies(companyId)
      setItems(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handleCreate = () => {
    setEditingItem(null)
    setName('')
    setCategory(POLICY_CATEGORIES[0])
    setVersion('1.0')
    setEffectiveDate('')
    setStatus('Active')
    setDescription('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setCategory(item.category || POLICY_CATEGORIES[0])
    setVersion(item.version || '1.0')
    setEffectiveDate(item.effectiveDate ? item.effectiveDate.slice(0, 10) : '')
    setStatus(item.status || 'Active')
    setDescription(item.description || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim() || !version.trim() || !effectiveDate) {
      setErrorMessage('Policy Name, Version, and Effective Date are required.')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        name,
        category,
        version,
        effectiveDate,
        status,
        description,
      }
      if (editingItem) {
        await complianceService.updatePolicy(companyId, editingItem.id, payload)
        setFeedback('Policy updated successfully.')
      } else {
        await complianceService.createPolicy(companyId, payload)
        setFeedback('Policy created successfully.')
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this policy?')) return
    setLoading(true)
    try {
      await complianceService.deletePolicy(companyId, item.id)
      setFeedback('Policy deleted successfully.')
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete policy')
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
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <ScrollText className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Policy Management</h2>
            <p className="mt-1 text-sm text-slate-500">Manage policy versions, categories, and effectiveness dates</p>
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
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Add Policy
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Policy Name</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Version</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Effective Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No policies found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.version}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${POLICY_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status}
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
        title={editingItem ? 'Edit Policy' : 'Add Policy'}
        subtitle={editingItem ? 'Update policy details' : 'Create a new policy'}
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Policy Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {POLICY_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Effective Date</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  <span className="inline-flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </span>
                ) : (
                  editingItem ? 'Save Changes' : 'Add Policy'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
