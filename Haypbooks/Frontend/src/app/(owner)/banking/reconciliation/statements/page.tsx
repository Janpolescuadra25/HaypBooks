import { useState, useEffect, FormEvent } from 'react'
import { FileText, RefreshCw, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { bankingService } from '@/services/banking.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const STATEMENT_STATUS_BADGE: Record<string, string> = {
  Imported: 'bg-blue-50 text-blue-700',
  Reconciled: 'bg-emerald-50 text-emerald-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  'Discrepancy Found': 'bg-rose-50 text-rose-700',
}

export default function StatementArchivePage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [bankAccount, setBankAccount] = useState('')
  const [statementDate, setStatementDate] = useState('')
  const [startingBalance, setStartingBalance] = useState('')
  const [endingBalance, setEndingBalance] = useState('')
  const [status, setStatus] = useState('Imported')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await bankingService.getBankStatements(companyId)
      setItems(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load bank statements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const formatCurrency = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-400">—</span>
    }
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })
  }

  const handleCreate = () => {
    setEditingItem(null)
    setBankAccount('')
    setStatementDate('')
    setStartingBalance('')
    setEndingBalance('')
    setStatus('Imported')
    setNotes('')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setBankAccount(item.bankAccount || '')
    setStatementDate(item.statementDate ? item.statementDate.slice(0, 10) : '')
    setStartingBalance(item.startingBalance?.toString() ?? '')
    setEndingBalance(item.endingBalance?.toString() ?? '')
    setStatus(item.status || 'Imported')
    setNotes(item.notes || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    if (!bankAccount.trim() || !statementDate || !startingBalance || !endingBalance) {
      setErrorMessage('Bank Account, Statement Date, Starting Balance, and Ending Balance are required.')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const payload = {
        bankAccount,
        statementDate,
        startingBalance: Number(startingBalance),
        endingBalance: Number(endingBalance),
        status,
        notes,
      }
      if (editingItem) {
        await bankingService.updateBankStatement(companyId, editingItem.id, payload)
        setFeedback('Bank statement updated successfully.')
      } else {
        await bankingService.createBankStatement(companyId, payload)
        setFeedback('Bank statement created successfully.')
      }
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save bank statement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!companyId || !window.confirm('Are you sure you want to delete this bank statement?')) return
    setLoading(true)
    try {
      await bankingService.deleteBankStatement(companyId, item.id)
      setFeedback('Bank statement deleted successfully.')
      await fetchData()
      window.setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete bank statement')
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
          <FileText className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Statement Archive</h2>
            <p className="mt-1 text-sm text-slate-500">Archive and manage bank statements for reconciliation and audit evidence</p>
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
            Add Statement
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Bank Account</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Statement Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Starting Balance</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Ending Balance</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No statements found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.bankAccount}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.statementDate ? new Date(item.statementDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(item.startingBalance)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(item.endingBalance)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATEMENT_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
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
        title={editingItem ? 'Edit Bank Statement' : 'Add Bank Statement'}
        subtitle={editingItem ? 'Update statement details' : 'Create a new bank statement record'}
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Account</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(event) => setBankAccount(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Statement Date</label>
                <input
                  type="date"
                  value={statementDate}
                  onChange={(event) => setStatementDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Starting Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={startingBalance}
                  onChange={(event) => setStartingBalance(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ending Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={endingBalance}
                  onChange={(event) => setEndingBalance(event.target.value)}
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
                  <option value="Imported">Imported</option>
                  <option value="Reconciled">Reconciled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Discrepancy Found">Discrepancy Found</option>
                </select>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
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
                  editingItem ? 'Save Changes' : 'Add Statement'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
