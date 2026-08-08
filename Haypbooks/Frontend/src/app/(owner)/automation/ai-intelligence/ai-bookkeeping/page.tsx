'use client'

import { useState, useEffect } from 'react'
import { Brain, RefreshCw, Loader2, Check, X, Pencil } from 'lucide-react'
import { automationService } from '@/services/automation.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'

const SUGGESTION_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-blue-50 text-blue-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
}

const confidenceColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-rose-600'
}

const confidenceBg = (score: number) => {
  if (score >= 90) return 'bg-emerald-50'
  if (score >= 70) return 'bg-amber-50'
  return 'bg-rose-50'
}

const ACCOUNT_CATEGORIES = ['Revenue', 'Expenses', 'Assets', 'Liabilities', 'Equity', 'Other']

export default function AIBookkeepingPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [suggestedAccount, setSuggestedAccount] = useState('')
  const [category, setCategory] = useState(ACCOUNT_CATEGORIES[0])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await automationService.getAISuggestions(companyId)
      setSuggestions(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load suggestions' })
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

  const openReviewModal = (item: any) => {
    setSelectedSuggestion(item)
    setSuggestedAccount(item.suggestedAccount || '')
    setCategory(item.category || ACCOUNT_CATEGORIES[0])
    setNotes(item.notes || '')
    setFeedback(null)
    setModalOpen(true)
  }

  const handleApprove = async (item: any) => {
    if (!companyId) return
    setLoading(true)
    try {
      await automationService.approveSuggestion(companyId, item.id)
      setFeedback({ type: 'success', message: 'Suggestion approved' })
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to approve suggestion' })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (item: any) => {
    if (!companyId || !window.confirm('Reject this suggestion?')) return
    setLoading(true)
    try {
      await automationService.rejectSuggestion(companyId, item.id)
      setFeedback({ type: 'success', message: 'Suggestion rejected' })
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reject suggestion' })
    } finally {
      setLoading(false)
    }
  }

  const handleModalApprove = async () => {
    if (!companyId || !selectedSuggestion) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await automationService.approveSuggestion(companyId, selectedSuggestion.id)
      setFeedback({ type: 'success', message: 'Suggestion approved' })
      setModalOpen(false)
      setSelectedSuggestion(null)
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to approve suggestion' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalReject = async () => {
    if (!companyId || !selectedSuggestion) return
    if (!window.confirm('Reject this suggestion?')) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await automationService.rejectSuggestion(companyId, selectedSuggestion.id)
      setFeedback({ type: 'success', message: 'Suggestion rejected' })
      setModalOpen(false)
      setSelectedSuggestion(null)
      await fetchData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reject suggestion' })
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
          <Brain className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI Bookkeeping</h2>
            <p className="mt-1 text-sm text-slate-500">Review AI-generated categorization suggestions</p>
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TRANSACTION</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">AMOUNT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SUGGESTED ACCOUNT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CONFIDENCE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suggestions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No suggestions found.
                </td>
              </tr>
            ) : (
              suggestions.map((item) => {
                const score = Number(item.confidence ?? 0)
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      <div className="truncate max-w-[200px]">{item.transactionDescription || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.suggestedAccount || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${confidenceBg(score)} ${confidenceColor(score)}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SUGGESTION_STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(item)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openReviewModal(item)}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <HaypModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Review Suggestion"
        subtitle="Adjust the AI suggestion before approval or rejection"
        size="md"
        closeOnOverlayClick={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction Description</label>
              <input
                type="text"
                value={selectedSuggestion?.transactionDescription || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
              <input
                type="text"
                value={selectedSuggestion ? Number(selectedSuggestion.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Suggested Account</label>
              <input
                type="text"
                value={suggestedAccount}
                onChange={(event) => setSuggestedAccount(event.target.value)}
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
                {ACCOUNT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confidence</label>
              <input
                type="text"
                value={selectedSuggestion ? `${Number(selectedSuggestion.confidence ?? 0)}%` : ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleModalReject}
              disabled={isSubmitting}
              className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Rejecting...
                </span>
              ) : (
                'Reject'
              )}
            </button>
            <button
              type="button"
              onClick={handleModalApprove}
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Approving...
                </span>
              ) : (
                'Approve'
              )}
            </button>
          </div>
        </div>
      </HaypModal>
    </div>
  )
}

