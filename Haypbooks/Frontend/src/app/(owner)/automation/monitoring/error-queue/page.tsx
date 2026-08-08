'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Loader2, Check } from 'lucide-react'
import { automationService } from '@/services/automation.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const ERROR_TYPE_BADGE: Record<string, string> = {
  Validation: 'bg-amber-50 text-amber-700',
  Timeout: 'bg-rose-50 text-rose-700',
  'Data Mismatch': 'bg-orange-50 text-orange-700',
  'API Error': 'bg-red-50 text-red-700',
}

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-rose-50 text-rose-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
}

export default function ErrorQueuePage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await automationService.getErrorQueue(companyId)
      setItems(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load error queue' })
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

  const openModal = (item: any) => {
    setSelectedItem(item)
    setResolutionNotes(item.resolutionNotes || '')
    setFeedback(null)
    setModalOpen(true)
  }

  const handleResolve = async () => {
    if (!companyId || !selectedItem) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await automationService.resolveError(companyId, selectedItem.id, { resolutionNotes })
      setFeedback({ type: 'success', message: 'Error resolved' })
      setModalOpen(false)
      setSelectedItem(null)
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to resolve error' })
    } finally {
      setIsSubmitting(false)
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
          <AlertCircle className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Error Queue</h2>
            <p className="mt-1 text-sm text-slate-500">Review and resolve automation errors and exceptions</p>
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

      {feedback && (
        <div className={`rounded-2xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {feedback.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ERROR ID</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SOURCE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ERROR TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">MESSAGE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">OCCURRED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  No error queue items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{item.errorId || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.source || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ERROR_TYPE_BADGE[item.errorType] || 'bg-slate-100 text-slate-600'}`}>
                      {item.errorType || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.message || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.occurred ? new Date(item.occurred).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status || 'Open'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.status !== 'Resolved' ? (
                      <button
                        type="button"
                        onClick={() => openModal(item)}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Check size={16} className="mr-2" />
                        Resolve
                      </button>
                    ) : null}
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
        title={`Resolve Error — ${selectedItem?.errorId ?? ''}`}
        subtitle="Review error details before resolving"
        size="md"
        closeOnOverlayClick={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Error ID</label>
              <input
                type="text"
                value={selectedItem?.errorId || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
              <input
                type="text"
                value={selectedItem?.source || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Error Type</label>
              <input
                type="text"
                value={selectedItem?.errorType || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Occurred</label>
              <input
                type="text"
                value={selectedItem?.occurred ? new Date(selectedItem.occurred).toLocaleString() : ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea
                value={selectedItem?.message || ''}
                disabled
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={(event) => setResolutionNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
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
              type="button"
              onClick={handleResolve}
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Resolving...
                </span>
              ) : (
                'Resolve Error'
              )}
            </button>
          </div>
        </div>
      </HaypModal>
    </div>
  )
}
