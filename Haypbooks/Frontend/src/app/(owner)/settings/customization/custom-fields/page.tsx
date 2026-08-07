import { useState, useEffect, FormEvent } from 'react'
import { Columns3, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const ENTITY_OPTIONS = [
  'Invoice',
  'Bill',
  'Payment',
  'Journal Entry',
  'Purchase Order',
  'Sales Order',
  'Customer',
  'Vendor',
  'All Entities',
]

const DATA_TYPE_OPTIONS = [
  'Text',
  'Number',
  'Date',
  'Dropdown',
  'Checkbox',
  'Textarea',
]

export default function CustomFieldsPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [fieldName, setFieldName] = useState('')
  const [entityType, setEntityType] = useState('')
  const [dataType, setDataType] = useState('Text')
  const [required, setRequired] = useState(false)
  const [status, setStatus] = useState('Active')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await settingsService.getCustomFields(companyId)
      setFields(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load custom fields')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handleCreate = () => {
    setEditingItem(null)
    setFieldName('')
    setEntityType('')
    setDataType('Text')
    setRequired(false)
    setStatus('Active')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFieldName(item.fieldName || '')
    setEntityType(item.entityType || '')
    setDataType(item.dataType || 'Text')
    setRequired(Boolean(item.required))
    setStatus(item.status || 'Active')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!fieldName.trim()) {
      setErrorMessage('Field Name is required.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    try {
      if (editingItem) {
        await settingsService.updateCustomField(companyId, editingItem.id, {
          fieldName,
          entityType,
          dataType,
          required,
          status,
        })
      } else {
        await settingsService.createCustomField(companyId, {
          fieldName,
          entityType,
          dataType,
          required,
          status,
        })
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save custom field')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this custom field?')) return
    setLoading(true)
    try {
      await settingsService.deleteCustomField(companyId, item.id)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete custom field')
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
          <Columns3 className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Custom Fields</h2>
            <p className="mt-1 text-sm text-slate-500">Define custom fields for your entities</p>
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
            Add Custom Field
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">FIELD NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ENTITY TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DATA TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">REQUIRED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No custom fields defined
                </td>
              </tr>
            ) : (
              fields.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.fieldName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.entityType || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {item.dataType || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.required ? (
                      <span className="text-emerald-700 font-medium">Yes</span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status || 'Inactive'}
                    </span>
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
        title={editingItem ? 'Edit Custom Field' : 'Create Custom Field'}
        subtitle={editingItem ? 'Update custom field settings' : 'Add a new custom field to your entities'}
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Field Name</label>
              <input
                type="text"
                value={fieldName}
                onChange={(event) => setFieldName(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Entity Type</label>
              <select
                value={entityType}
                onChange={(event) => setEntityType(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select entity</option>
                {ENTITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Type</label>
              <select
                value={dataType}
                onChange={(event) => setDataType(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DATA_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-slate-700">Required</label>
              </div>
              <button
                type="button"
                onClick={() => setRequired(!required)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${required ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${required ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
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
              </select>
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
                  editingItem ? 'Save Changes' : 'Create Field'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
