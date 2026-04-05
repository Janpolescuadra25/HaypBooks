'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Plus, Edit2, Trash2, Star, StarOff, Save,
  Mail, Loader2, AlertCircle, Check, ChevronDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface EmailTemplate {
  id: string
  companyId: string
  name: string
  subject: string
  body: string
  tone: string
  cc?: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type EmailTemplateInput = Pick<EmailTemplate, 'name' | 'subject' | 'body' | 'tone'> & {
  cc?: string
  isDefault?: boolean
}

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly' },
  { id: 'brief',        label: 'Brief' },
  { id: 'custom',       label: 'Custom' },
]

const BLANK_FORM: EmailTemplateInput = {
  name: '',
  subject: '',
  body: '',
  tone: 'professional',
  cc: '',
  isDefault: false,
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  companyId: string
  onClose: () => void
  /** Called when templates change so caller can refresh its own list */
  onTemplatesChange?: (templates: EmailTemplate[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TemplateManagerModal({ companyId, onClose, onTemplatesChange }: Props) {
  const [templates, setTemplates]   = useState<EmailTemplate[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)

  // Editor state
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm]           = useState<EmailTemplateInput>(BLANK_FORM)
  const [toneMenu, setToneMenu]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await apiClient.get<EmailTemplate[]>(`/companies/${companyId}/email-templates`)
      const list = res.data ?? []
      setTemplates(list)
      onTemplatesChange?.(list)
    } catch {
      setError('Failed to load email templates.')
    } finally {
      setLoading(false)
    }
  }, [companyId, onTemplatesChange])

  useEffect(() => { load() }, [load])

  const handleEdit = (tpl: EmailTemplate) => {
    setEditingId(tpl.id)
    setForm({ name: tpl.name, subject: tpl.subject, body: tpl.body, tone: tpl.tone, cc: tpl.cc ?? '', isDefault: tpl.isDefault })
  }

  const handleNew = () => {
    setEditingId('new')
    setForm(BLANK_FORM)
  }

  const handleCancel = () => { setEditingId(null); setForm(BLANK_FORM) }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Template name is required.'); return }
    if (!form.subject.trim()) { setError('Subject is required.'); return }
    if (!form.body.trim()) { setError('Body is required.'); return }
    setSaving(true); setError('')
    try {
      if (editingId === 'new') {
        await apiClient.post(`/companies/${companyId}/email-templates`, form)
      } else {
        await apiClient.put(`/companies/${companyId}/email-templates/${editingId}`, form)
      }
      setEditingId(null)
      setForm(BLANK_FORM)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await apiClient.delete(`/companies/${companyId}/email-templates/${id}`)
      await load()
    } catch {
      setError('Failed to delete template.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSetDefault = async (tpl: EmailTemplate) => {
    try {
      await apiClient.put(`/companies/${companyId}/email-templates/${tpl.id}`, { isDefault: true })
      await load()
    } catch {
      setError('Failed to set default template.')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Mail size={16} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Email Templates</h2>
              <p className="text-xs text-slate-500">Manage saved email templates for invoices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" /> {error}
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
              </div>
            )}

            {/* ── Editor form ────────────────────────────────────────────── */}
            <AnimatePresence>
              {editingId !== null && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    {editingId === 'new' ? 'New Template' : 'Edit Template'}
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Template Name</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Standard Invoice, Friendly Reminder…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white" />
                  </div>

                  {/* Tone */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tone</label>
                    <button type="button" onClick={() => setToneMenu(p => !p)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors">
                      <span className="text-slate-700">{TONES.find(t => t.id === form.tone)?.label ?? 'Professional'}</span>
                      <ChevronDown size={13} className="text-slate-400" />
                    </button>
                    <AnimatePresence>
                      {toneMenu && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                          {TONES.map(t => (
                            <button key={t.id} type="button"
                              onClick={() => { setForm(p => ({ ...p, tone: t.id })); setToneMenu(false) }}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-emerald-50 transition-colors ${form.tone === t.id ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}>
                              {form.tone === t.id && <Check size={12} />}{t.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subject Line</label>
                    <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="Invoice {number} — Due {dueDate}"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white" />
                    <p className="text-xs text-slate-400 mt-0.5">Use <code className="bg-slate-100 px-1 rounded">{'{amount}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{dueDate}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{number}'}</code> as placeholders.</p>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Message Body</label>
                    <textarea rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                      placeholder="Dear {customer},&#10;&#10;Your invoice {number} for {amount} is ready…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white resize-none leading-relaxed" />
                  </div>

                  {/* CC */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">CC (optional)</label>
                    <input value={form.cc ?? ''} onChange={e => setForm(p => ({ ...p, cc: e.target.value }))}
                      placeholder="billing@example.com, accounts@example.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white" />
                  </div>

                  {/* Default */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 accent-emerald-600" />
                    <span className="text-sm text-slate-600">Set as default template</span>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {saving ? 'Saving…' : 'Save Template'}
                    </button>
                    <button onClick={handleCancel} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Template list ──────────────────────────────────────────── */}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="ml-2 text-sm">Loading templates…</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Mail size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No saved templates yet</p>
                <p className="text-xs mt-1">Create your first reusable email template</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(tpl => (
                  <div key={tpl.id}
                    className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{tpl.name}</span>
                        {tpl.isDefault && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">Default</span>
                        )}
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full capitalize">{tpl.tone}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{tpl.subject}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tpl.body.slice(0, 80)}{tpl.body.length > 80 ? '…' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!tpl.isDefault && (
                        <button onClick={() => handleSetDefault(tpl)} title="Set as default"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                          <StarOff size={13} />
                        </button>
                      )}
                      {tpl.isDefault && (
                        <span className="p-1.5 text-amber-400"><Star size={13} /></span>
                      )}
                      <button onClick={() => handleEdit(tpl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(tpl.id)} disabled={deleting === tpl.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                        {deleting === tpl.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0 flex items-center justify-between">
          <button onClick={handleNew} disabled={editingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            <Plus size={14} /> New Template
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-white transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
