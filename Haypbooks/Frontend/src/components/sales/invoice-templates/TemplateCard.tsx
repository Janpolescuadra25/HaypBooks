'use client'

import React from 'react'
import { Star, Copy, Trash2, Pencil, Eye, Check, Upload, Download } from 'lucide-react'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'

interface Props {
  template: InvoiceTemplate
  onPreview: (t: InvoiceTemplate) => void
  onEdit: (t: InvoiceTemplate) => void
  onDuplicate: (t: InvoiceTemplate) => void
  onDelete: (t: InvoiceTemplate) => void
  onSetDefault: (t: InvoiceTemplate) => void
  onExport: (t: InvoiceTemplate) => void
  onSelect?: (t: InvoiceTemplate) => void
  selectable?: boolean
  compact?: boolean
}

export default function TemplateCard({ template, onPreview, onEdit, onDuplicate, onDelete, onSetDefault, onExport, onSelect, selectable = false, compact = false }: Props) {
  const { colors } = template

  return (
    <div
      className={`group relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        template.isDefault
          ? 'border-emerald-400 shadow-md shadow-emerald-100'
          : 'border-gray-100 hover:border-emerald-200 hover:shadow-md'
      } ${selectable ? 'cursor-pointer' : ''}`}
      onClick={selectable ? () => onSelect?.(template) : undefined}
    >
      {/* Color Bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})` }} />

      {/* Default Badge */}
      {template.isDefault && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          <Check size={10} /> Default
        </div>
      )}

      {/* Draft Badge */}
      {template.isDraft && !template.isDefault && (
        <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          Draft
        </div>
      )}

      {/* Card Body */}
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          {/* Mini Preview */}
          <div
            className="w-14 h-16 rounded-lg flex-shrink-0 border flex flex-col overflow-hidden"
            style={{ background: colors.background, borderColor: colors.primary + '40' }}
          >
            <div className="h-3" style={{ background: colors.primary }} />
            <div className="flex-1 p-1 space-y-0.5">
              {[0.8, 0.5, 0.7, 0.4, 0.6].map((w, i) => (
                <div key={i} className="h-0.5 rounded-full" style={{ width: `${w * 100}%`, background: i === 0 ? colors.text : colors.accent + '80' }} />
              ))}
            </div>
            <div className="h-1" style={{ background: colors.accent + '60' }} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-base">{template.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
            </div>
            {!compact && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{template.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {template.isBuiltIn && <span className="bg-gray-50 border border-gray-100 px-1.5 py-px rounded text-gray-500">Built-in</span>}
              {template.usageCount > 0 && <span>Used {template.usageCount}×</span>}
              {template.lastUsedAt && <span>· {relativeTime(template.lastUsedAt)}</span>}
            </div>
          </div>
        </div>

        {/* Color Swatches */}
        {!compact && (
          <div className="flex items-center gap-1.5 mt-3">
            {[colors.primary, colors.accent, colors.background, colors.text].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ background: c }} title={c} />
            ))}
            <span className="text-xs text-gray-400 ml-1 capitalize">{template.layoutStyle}</span>
            <span className="text-xs text-gray-400">· {template.borderStyle}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`border-t border-gray-50 px-3 py-2 flex items-center gap-1 bg-gray-50/50 ${compact ? 'hidden group-hover:flex' : ''}`}>
        <button onClick={e => { e.stopPropagation(); onPreview(template) }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-emerald-700 rounded-md transition-colors font-medium border border-transparent hover:border-emerald-100">
          <Eye size={11} /> Preview
        </button>
        {!template.isBuiltIn && (
          <button onClick={e => { e.stopPropagation(); onEdit(template) }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-blue-700 rounded-md transition-colors font-medium border border-transparent hover:border-blue-100">
            <Pencil size={11} /> Edit
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onDuplicate(template) }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded-md transition-colors font-medium border border-transparent hover:border-gray-200">
          <Copy size={11} /> Copy
        </button>
        <button onClick={e => { e.stopPropagation(); onExport(template) }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded-md transition-colors font-medium border border-transparent hover:border-gray-200">
          <Download size={11} /> Export
        </button>
        {!template.isDefault && (
          <button onClick={e => { e.stopPropagation(); onSetDefault(template) }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium border border-transparent hover:border-emerald-200 ml-auto">
            <Star size={11} /> Set Default
          </button>
        )}
        {!template.isBuiltIn && (
          <button onClick={e => { e.stopPropagation(); onDelete(template) }}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-auto">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3.6e6)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}
