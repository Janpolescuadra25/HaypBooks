'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Upload, X, AlertCircle, Loader2, ChevronRight } from 'lucide-react'
import TemplateCard from './TemplateCard'
import TemplatePreview from './TemplatePreview'
import TemplateEditor from './TemplateEditor'
import {
  getAllTemplates, deleteTemplate, duplicateTemplate,
  setDefaultTemplate, exportTemplate, importTemplate,
} from '@/lib/invoice-templates/templateStorage'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'

interface Props {
  onSelect?: (template: InvoiceTemplate) => void
  /** If true, renders as a modal */
  modal?: boolean
  onClose?: () => void
}

export default function TemplateGallery({ onSelect, modal = false, onClose }: Props) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<InvoiceTemplate | null>(null)
  const [editing, setEditing] = useState<InvoiceTemplate | 'new' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => setTemplates(getAllTemplates()), [])
  useEffect(() => { reload() }, [reload])

  const filtered = search
    ? templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.description ?? '').toLowerCase().includes(search.toLowerCase()))
    : templates

  const handleDelete = (t: InvoiceTemplate) => {
    if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return
    deleteTemplate(t.id)
    reload()
    setSuccess(`Deleted "${t.name}"`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDuplicate = (t: InvoiceTemplate) => {
    duplicateTemplate(t.id)
    reload()
    setSuccess(`Duplicated "${t.name}"`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleSetDefault = (t: InvoiceTemplate) => {
    setDefaultTemplate(t.id)
    reload()
    setSuccess(`"${t.name}" is now your default template`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleExport = (t: InvoiceTemplate) => {
    const json = exportTemplate(t)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${t.name.replace(/\s+/g, '-').toLowerCase()}-template.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = importTemplate(ev.target?.result as string)
      if (result) { reload(); setSuccess(`Imported "${result.name}"!`); setTimeout(() => setSuccess(''), 3000) }
      else setError('Invalid template file.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const builtIn = filtered.filter(t => t.isBuiltIn)
  const user = filtered.filter(t => !t.isBuiltIn)

  const inner = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Invoice Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">{templates.length} templates · customize your invoice style</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium">
            <Upload size={14} /> Import
          </button>
          <button onClick={() => setEditing('new' as any)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
            <Plus size={14} /> Create Template
          </button>
          {modal && onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-50 flex-shrink-0">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 flex-shrink-0">
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700 flex items-center gap-2">
              <span className="flex-1">{success}</span><button onClick={() => setSuccess('')}><X size={14} /></button>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /><span className="flex-1">{error}</span><button onClick={() => setError('')}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Built-in */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Starter Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtIn.map(t => (
              <TemplateCard key={t.id} template={t}
                onPreview={setPreview}
                onEdit={() => setEditing(t)}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                onExport={handleExport}
                onSelect={onSelect}
                selectable={!!onSelect}
              />
            ))}
          </div>
        </section>

        {/* User Templates */}
        {user.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">My Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.map(t => (
                <TemplateCard key={t.id} template={t}
                  onPreview={setPreview}
                  onEdit={() => setEditing(t)}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  onExport={handleExport}
                  onSelect={onSelect}
                  selectable={!!onSelect}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No templates found</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {modal ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {inner}
          </motion.div>
        </motion.div>
      ) : inner}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <TemplatePreview template={preview} onClose={() => setPreview(null)}
            onUse={t => { onSelect?.(t); setPreview(null) }}
            onEdit={t => { setPreview(null); setEditing(t) }} />
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {editing !== null && (
          <TemplateEditor
            template={editing === 'new' ? null : editing as InvoiceTemplate}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); setSuccess('Template saved!'); setTimeout(() => setSuccess(''), 3000) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
