import { useState, useEffect, FormEvent } from 'react'
import { CheckSquare, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { complianceService } from '@/services/compliance.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const TEST_STATUSES = ['Passed', 'Failed', 'In Progress', 'Not Tested']

const REVIEW_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual']

const TEST_STATUS_BADGE: Record<string, string> = {
  Passed: 'bg-emerald-50 text-emerald-700',
  Failed: 'bg-rose-50 text-rose-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Not Tested': 'bg-slate-100 text-slate-600',
}

export default function ControlTestingPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [controlRef, setControlRef] = useState('')
  const [tester, setTester] = useState('')
  const [testDate, setTestDate] = useState('')
  const [status, setStatus] = useState(TEST_STATUSES[0])
  const [findings, setFindings] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await complianceService.getControlTests(companyId)
      setItems(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load control tests')
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
    setControlRef('')
    setTester('')
    setTestDate('')
    setStatus(TEST_STATUSES[0])
    setFindings('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setControlRef(item.controlRef || '')
    setTester(item.tester || '')
    setTestDate(item.testDate ? item.testDate.slice(0, 10) : '')
    setStatus(item.status || TEST_STATUSES[0])
    setFindings(item.findings || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!name.trim() || !controlRef.trim() || !tester.trim() || !testDate) {
      setErrorMessage('Test Name, Control Reference, Tester, and Test Date are required.')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        name,
        controlRef,
        tester,
        testDate,
        status,
        findings,
      }
      if (editingItem) {
        await complianceService.updateControlTest(companyId, editingItem.id, payload)
        setFeedback('Control test updated successfully.')
      } else {
        await complianceService.createControlTest(companyId, payload)
        setFeedback('Control test created successfully.')
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save control test')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this control test?')) return
    setLoading(true)
    try {
      await complianceService.deleteControlTest(companyId, item.id)
      setFeedback('Control test deleted successfully.')
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete control test')
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
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Control Testing</h2>
            <p className="mt-1 text-sm text-slate-500">Track control test results and compliance evidence</p>
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
            Add Test
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Test Name</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Control Ref</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Tester</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Test Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No control tests found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.controlRef}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.tester}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.testDate ? new Date(item.testDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TEST_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
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
        title={editingItem ? 'Edit Control Test' : 'Add Control Test'}
        subtitle={editingItem ? 'Update test details' : 'Log a new control test'}
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Test Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Control Reference</label>
                <input
                  type="text"
                  value={controlRef}
                  onChange={(event) => setControlRef(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tester</label>
                <input
                  type="text"
                  value={tester}
                  onChange={(event) => setTester(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Test Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(event) => setTestDate(event.target.value)}
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
                  {TEST_STATUSES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Findings</label>
              <textarea
                rows={3}
                value={findings}
                onChange={(event) => setFindings(event.target.value)}
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
                  editingItem ? 'Save Changes' : 'Add Test'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
