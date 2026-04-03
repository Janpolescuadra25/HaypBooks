'use client'
/**
 * CrudModal — Reusable CRUD modal for Owner Hub pages.
 *
 * Usage:
 *   <CrudModal
 *     open={showModal}
 *     onClose={() => setShowModal(false)}
 *     mode="create"  // or "edit" | "view" | "delete"
 *     title="New Customer"
 *     fields={[
 *       { key: 'name', label: 'Name', type: 'text', required: true },
 *       { key: 'email', label: 'Email', type: 'email' },
 *       { key: 'phone', label: 'Phone', type: 'tel' },
 *       { key: 'status', label: 'Status', type: 'select', options: [...] },
 *       { key: 'notes', label: 'Notes', type: 'textarea' },
 *     ]}
 *     initialData={editRow}
 *     onSubmit={async (data) => { await apiClient.post(...) }}
 *     loading={saving}
 *   />
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Plus, Pencil, Trash2, Eye, Save, Loader2, AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CrudField {
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'url' | 'date' | 'textarea' |
        'select' | 'checkbox' | 'currency' | 'password'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hidden?: (values: Record<string, any>) => boolean
  options?: { label: string; value: string }[]
  description?: string
  defaultValue?: any
  validate?: (value: any, values: Record<string, any>) => string | null
  colSpan?: 1 | 2  // default 1
}

export interface CrudModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view' | 'delete'
  title?: string
  subtitle?: string
  fields: CrudField[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<any>
  onDelete?: (id: string) => Promise<any>
  loading?: boolean
  width?: string  // max-width, e.g. 'max-w-2xl'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ModeIcon({ mode }: { mode: string }) {
  switch (mode) {
    case 'create': return <Plus size={20} className="text-emerald-600" />
    case 'edit':   return <Pencil size={20} className="text-blue-600" />
    case 'view':   return <Eye size={20} className="text-slate-500" />
    case 'delete': return <Trash2 size={20} className="text-rose-600" />
    default: return null
  }
}

const modeConfig: Record<string, { title: string; submitLabel: string; submitIcon: any; variant: string }> = {
  create: { title: 'Create New', submitLabel: 'Create', submitIcon: Plus, variant: 'emerald' },
  edit:   { title: 'Edit', submitLabel: 'Save Changes', submitIcon: Save, variant: 'blue' },
  view:   { title: 'View Details', submitLabel: 'Close', submitIcon: X, variant: 'slate' },
  delete: { title: 'Delete', submitLabel: 'Delete', submitIcon: Trash2, variant: 'rose' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrudModal({
  open,
  onClose,
  mode,
  title: customTitle,
  subtitle,
  fields,
  initialData,
  onSubmit,
  onDelete,
  loading = false,
  width = 'max-w-2xl',
}: CrudModalProps) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const config = modeConfig[mode]
  const isView = mode === 'view'
  const isDelete = mode === 'delete'

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {}
      fields.forEach(f => {
        initial[f.key] = initialData?.[f.key] ?? f.defaultValue ?? (f.type === 'checkbox' ? false : '')
      })
      setForm(initial)
      setErrors({})
      setSubmitError('')
    }
  }, [open, initialData, fields])

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Clear field error on change
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
    setSubmitError('')
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    fields.forEach(f => {
      if (f.hidden?.(form)) return
      if (f.required && !form[f.key] && form[f.key] !== 0 && form[f.key] !== false) {
        newErrors[f.key] = `${f.label} is required`
      }
      if (f.validate) {
        const err = f.validate(form[f.key], form)
        if (err) newErrors[f.key] = err
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitError('')
    try {
      await onSubmit(form)
      onClose()
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    setSubmitError('')
    try {
      await onDelete?.(initialData.id)
      onClose()
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Delete failed')
    }
  }

  const handleSubmitClick = () => {
    if (isView) { onClose(); return }
    if (isDelete) { handleDelete(); return }
    handleSubmit()
  }

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const visibleFields = useMemo(
    () => fields.filter(f => !f.hidden?.(form)),
    [fields, form]
  )

  const variantStyles: Record<string, string> = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
    slate: 'bg-slate-600 hover:bg-slate-700 shadow-slate-600/25',
    rose: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25',
  }

  const SubmitIcon = config.submitIcon

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="crud-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              data-testid="crud-modal-container"
              className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${width} max-h-[90vh] flex flex-col pointer-events-auto`}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDelete ? 'bg-rose-100' : isView ? 'bg-slate-100' : 'bg-emerald-100'
                  }`}>
                    <ModeIcon mode={mode} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {customTitle || `${config.title} Record`}
                    </h2>
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Delete warning ── */}
              {isDelete && (
                <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-700">
                    <strong>Warning:</strong> This action cannot be undone. Are you sure you want to delete this record?
                  </p>
                </div>
              )}

              {/* ── Body ── */}
              <div data-testid="crud-form" className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleFields.map(field => (
                    <div
                      key={field.key}
                      className={field.colSpan === 2 ? 'sm:col-span-2' : ''}
                    >
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                      </label>

                      {field.description && (
                        <p className="text-[11px] text-slate-400 mb-1">{field.description}</p>
                      )}

                      {/* Text / Email / Tel / URL / Password / Number */}
                      {['text', 'email', 'tel', 'url', 'password'].includes(field.type) && (
                        <input
                          type={field.type}
                          value={form[field.key] ?? ''}
                          data-testid={
                            field.key === 'displayName' || field.key === 'name'
                              ? 'customer-name-input'
                              : field.key === 'email'
                                ? 'customer-email-input'
                                : field.key === 'phone'
                                  ? 'customer-phone-input'
                                  : undefined
                          }
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
                          disabled={isView || field.disabled}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                            errors[field.key]
                              ? 'border-rose-300 bg-rose-50'
                              : isView
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-slate-300 bg-white'
                          }`}
                        />
                      )}

                      {/* Number (with step control) */}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={form[field.key] ?? ''}
                          onChange={e => handleChange(field.key, parseFloat(e.target.value) || 0)}
                          placeholder={field.placeholder ?? '0'}
                          disabled={isView || field.disabled}
                          step="any"
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono tabular-nums ${
                            errors[field.key]
                              ? 'border-rose-300 bg-rose-50'
                              : isView
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-slate-300 bg-white'
                          }`}
                        />
                      )}

                      {/* Currency */}
                      {field.type === 'currency' && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={form[field.key] ?? ''}
                            onChange={e => handleChange(field.key, parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={isView || field.disabled}
                            step="0.01"
                            className={`w-full pl-7 pr-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono tabular-nums ${
                              errors[field.key]
                                ? 'border-rose-300 bg-rose-50'
                                : isView
                                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                                  : 'border-slate-300 bg-white'
                            }`}
                          />
                        </div>
                      )}

                      {/* Date */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={form[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          disabled={isView || field.disabled}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                            errors[field.key]
                              ? 'border-rose-300 bg-rose-50'
                              : isView
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-slate-300 bg-white'
                          }`}
                        />
                      )}

                      {/* Select */}
                      {field.type === 'select' && (
                        <select
                          value={form[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          disabled={isView || field.disabled}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                            errors[field.key]
                              ? 'border-rose-300 bg-rose-50'
                              : isView
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">{field.placeholder ?? `Select ${field.label.toLowerCase()}...`}</option>
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea
                          value={form[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
                          disabled={isView || field.disabled}
                          rows={3}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none ${
                            errors[field.key]
                              ? 'border-rose-300 bg-rose-50'
                              : isView
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-slate-300 bg-white'
                          }`}
                        />
                      )}

                      {/* Checkbox */}
                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={!!form[field.key]}
                            onChange={e => handleChange(field.key, e.target.checked)}
                            disabled={isView || field.disabled}
                            className="accent-emerald-600 w-4 h-4 rounded"
                          />
                          <span className="text-sm text-slate-700">
                            {field.placeholder ?? field.label}
                          </span>
                        </label>
                      )}

                      {/* Field error */}
                      {errors[field.key] && (
                        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                          <AlertCircle size={11} /> {errors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
                {submitError && (
                  <p data-testid="form-validation-errors" className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {submitError}
                  </p>
                )}
                {!submitError && <span />}

                <div className="flex items-center gap-2">
                  <button
                    data-testid="crud-cancel-button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="crud-submit-button"
                    onClick={handleSubmitClick}
                    disabled={loading}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${variantStyles[config.variant]}`}
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <SubmitIcon size={14} />
                    )}
                    {loading ? 'Saving...' : config.submitLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
