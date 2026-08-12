'use client'

import { useState, useEffect, FormEvent } from 'react'
import { ShieldAlert, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { complianceService } from '@/services/compliance.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const FRAUD_RULE_CATEGORIES = [
  'Transaction Anomaly',
  'Duplicate Detection',
  'Amount Threshold',
  'Vendor Risk',
  'Pattern Analysis',
  'Segregation of Duties',
]

const FRAUD_SEVERITY_BADGE: Record<string, string> = {
  Critical: 'bg-rose-50 text-rose-700',
  High: 'bg-orange-50 text-orange-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

const FRAUD_STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-600',
  'Under Review': 'bg-amber-50 text-amber-700',
}

export default function FraudDetectionRulesPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(FRAUD_RULE_CATEGORIES[0])
  const [severity, setSeverity] = useState('Medium')
  const [status, setStatus] = useState('Active')
  const [thresholdValue, setThresholdValue] = useState('')
  const [condition, setCondition] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await complianceService.getFraudRules(companyId)
      setItems(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load fraud detection rules')
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
    setCategory(FRAUD_RULE_CATEGORIES[0])
    setSeverity('Medium')
    setStatus('Active')
    setThresholdValue('')
    setCondition('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setCategory(item.category || FRAUD_RULE_CATEGORIES[0])
    setSeverity(item.severity || 'Medium')
    setStatus(item.status || 'Active')
    setThresholdValue(item.thresholdValue || '')
    setCondition(item.condition || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim() || !thresholdValue.trim() || !condition.trim()) {
      setErrorMessage('Name, Threshold Value, and Condition are required.')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        name,
        category,
        severity,
        status,
        thresholdValue,
        condition,
      }
      if (editingItem) {
        await complianceService.updateFraudRule(companyId, editingItem.id, payload)
        setFeedback('Fraud rule updated successfully.')
      } else {
        await complianceService.createFraudRule(companyId, payload)
        setFeedback('Fraud rule created successfully.')
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save fraud rule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this fraud rule?')) return
    setLoading(true)
    try {
      await complianceService.deleteFraudRule(companyId, item.id)
      setFeedback('Fraud rule deleted successfully.')
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete fraud rule')
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
          <ShieldAlert className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Fraud Detection Rules</h2>
            <p className="mt-1 text-sm text-slate-500">Manage rule severity, activity, and last-triggered monitoring</p>
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Rule Name</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Severity</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Last Triggered</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No fraud detection rules found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${FRAUD_SEVERITY_BADGE[item.severity] || 'bg-slate-100 text-slate-600'}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${FRAUD_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.lastTriggered ? new Date(item.lastTriggered).toLocaleDateString() : <span className="text-slate-400 italic">Never</span>}</td>
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
        title={editingItem ? 'Edit Fraud Rule' : 'Add Fraud Rule'}
        subtitle={editingItem ? 'Update rule details and status' : 'Create a new fraud detection rule'}
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
                  {FRAUD_RULE_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Severity</label>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Threshold Value</label>
                <input
                  type="text"
                  value={thresholdValue}
                  onChange={(event) => setThresholdValue(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition</label>
              <textarea
                rows={3}
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
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

