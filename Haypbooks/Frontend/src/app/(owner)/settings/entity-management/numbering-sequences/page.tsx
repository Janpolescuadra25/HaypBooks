'use client'

import { useState, useEffect, FormEvent } from 'react'
import { ListOrdered, RefreshCw, Loader2, Pencil } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

export default function NumberingSequencesPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [sequences, setSequences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [prefix, setPrefix] = useState('')
  const [nextNumber, setNextNumber] = useState('')
  const [format, setFormat] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await settingsService.getNumberingSequences(companyId)
      setSequences(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setErrorMessage(null)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load numbering sequences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setPrefix(item.prefix || '')
    setNextNumber(item.nextNumber?.toString() || '')
    setFormat(item.format || '')
    setErrorMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId || !editingItem) return
    if (!prefix.trim()) {
      setErrorMessage('Prefix is required.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    try {
      await settingsService.updateNumberingSequence(companyId, editingItem.id, {
        prefix,
        nextNumber: Number(nextNumber),
        format,
      })
      setModalOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save numbering sequence')
    } finally {
      setSaving(false)
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
          <ListOrdered className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Numbering Sequences</h2>
            <p className="mt-1 text-sm text-slate-500">Manage document numbering prefixes and formats</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DOCUMENT TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PREFIX</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">NEXT NUMBER</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">FORMAT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sequences.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No numbering sequences configured
                </td>
              </tr>
            ) : (
              sequences.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.documentType || '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs text-slate-700">{item.prefix || '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono tabular-nums text-slate-700">{item.nextNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs text-slate-700">{item.format || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <Pencil size={16} />
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
        title="Edit Numbering Sequence"
        subtitle="Update prefix and format"
        size="md"
        closeOnOverlayClick={true}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{editingItem?.documentType || '—'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Next Number</label>
              <input
                type="number"
                value={nextNumber}
                onChange={(event) => setNextNumber(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
              <input
                type="text"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
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
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </HaypModal>
    </div>
  )
}
