import { useState, useEffect, FormEvent } from 'react'
import { Sparkles, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { automationService } from '@/services/automation.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const RULE_CATEGORIES = [
  'Transaction Categorization',
  'Duplicate Detection',
  'Amount Threshold',
  'Date Validation',
  'Vendor Matching',
  'Anomaly Detection',
]

const RULE_STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-600',
  'Under Review': 'bg-amber-50 text-amber-700',
}

const PRIORITY_BADGE: Record<string, string> = {
  High: 'bg-rose-50 text-rose-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

const STATUS_OPTIONS = ['Active', 'Inactive', 'Under Review']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

export default function SmartRulesPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(RULE_CATEGORIES[0])
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1])
  const [status, setStatus] = useState(STATUS_OPTIONS[0])
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await automationService.getSmartRules(companyId)
      setRules(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load rules' })
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

  const resetForm = () => {
    setName('')
    setCategory(RULE_CATEGORIES[0])
    setPriority(PRIORITY_OPTIONS[1])
    setStatus(STATUS_OPTIONS[0])
    setCondition('')
    setDescription('')
  }

  const handleCreate = () => {
    setEditingItem(null)
    resetForm()
    setFeedback(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setCategory(item.category || RULE_CATEGORIES[0])
    setPriority(item.priority || PRIORITY_OPTIONS[1])
    setStatus(item.status || STATUS_OPTIONS[0])
    setCondition(item.condition || '')
    setDescription(item.description || '')
    setFeedback(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Rule Name is required.' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      if (editingItem) {
        await automationService.updateSmartRule(companyId, editingItem.id, {
          name,
          category,
          priority,
          status,
          condition,
          description,
        })
        setFeedback({ type: 'success', message: 'Smart rule updated' })
      } else {
        await automationService.createSmartRule(companyId, {
          name,
          category,
          priority,
          status,
          condition,
          description,
        })
        setFeedback({ type: 'success', message: 'Smart rule created' })
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save smart rule' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this smart rule?')) return
    setLoading(true)
    try {
      await automationService.deleteSmartRule(companyId, item.id)
      setFeedback({ type: 'success', message: 'Smart rule deleted' })
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete smart rule' })
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
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Smart Rules</h2>
            <p className="mt-1 text-sm text-slate-500">Define automated categorization and transaction rules</p>
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
            Add Rule
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">RULE NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CATEGORY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PRIORITY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">LAST TRIGGERED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No rules found.
                </td>
              </tr>
            ) : (
              rules.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.category || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[item.priority] || 'bg-slate-100 text-slate-600'}`}>
                      {item.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RULE_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.lastTriggered ? new Date(item.lastTriggered).toLocaleString() : <span className="text-slate-400 italic">Never</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <Pencil size={16} />
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <HaypModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Smart Rule' : 'Add Smart Rule'}
        subtitle={editingItem ? 'Update rule conditions and automation priority' : 'Create a new smart rule for transaction automation'}
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rule Name</label>
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
                  {RULE_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {feedback && (
              <div className={`rounded-lg border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                {feedback.message}
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
                  editingItem ? 'Save Changes' : 'Add Rule'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
