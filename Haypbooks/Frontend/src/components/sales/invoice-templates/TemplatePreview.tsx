'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Eye, Pencil, Check, Star } from 'lucide-react'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'

const FAKE_INVOICE = {
  number: 'INV-2026-0042',
  date: 'Apr 5, 2026',
  dueDate: 'May 5, 2026',
  from: { name: 'Acme Corporation', address: '123 Business St., Manila, PH', email: 'billing@acme.ph', phone: '+63 2 1234 5678' },
  to: { name: 'Sample Customer Inc.', address: '456 Client Ave., Quezon City, PH', email: 'accounts@sampleco.ph' },
  items: [
    { description: 'Web Design Services', quantity: 1, unitPrice: 25000, amount: 25000 },
    { description: 'Monthly Maintenance', quantity: 3, unitPrice: 5000, amount: 15000 },
    { description: 'Domain & Hosting', quantity: 1, unitPrice: 3500, amount: 3500 },
  ],
  subtotal: 43500,
  tax: 5220,
  total: 48720,
  terms: 'Net 30',
  message: '',
  notes: 'Bank: BDO Unibank · Account: 00123-456-789',
}

interface Props {
  template: InvoiceTemplate
  onClose: () => void
  onUse?: (t: InvoiceTemplate) => void
  onEdit?: (t: InvoiceTemplate) => void
}

export default function TemplatePreview({ template, onClose, onUse, onEdit }: Props) {
  const { colors, layoutStyle, borderStyle } = template
  const fake = { ...FAKE_INVOICE, message: template.defaultMessage }

  const borderClass = {
    solid: 'border border-gray-200',
    dashed: 'border border-dashed border-gray-300',
    none: '',
    double: 'border-4 border-double border-gray-300',
    rounded: 'border border-gray-200 rounded-2xl',
  }[borderStyle] ?? 'border border-gray-200'

  const tableClass = {
    classic: 'border border-gray-200',
    modern: 'rounded-xl overflow-hidden',
    compact: 'border border-gray-100 text-xs',
    minimal: '',
    bold: 'border-2 border-gray-800',
    elegant: 'border border-gray-100 rounded-lg',
  }[layoutStyle] ?? ''

  const spacing = layoutStyle === 'compact' ? 'p-6' : layoutStyle === 'minimal' ? 'p-8' : 'p-8'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{template.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && !template.isBuiltIn && (
              <button onClick={() => onEdit(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Pencil size={12} /> Edit
              </button>
            )}
            {onUse && (
              <button onClick={() => onUse(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Check size={12} /> Use Template
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className={`mx-auto max-w-2xl bg-white shadow-lg ${borderClass} ${spacing}`}
            style={{ background: colors.background, color: colors.text }}>

            {/* Header */}
            <div className={`flex items-start justify-between mb-8 ${template.logoPosition === 'top-center' ? 'flex-col items-center text-center gap-4' : ''}`}>
              {/* Logo placeholder */}
              {template.sections.companyLogo && (
                <div className={template.logoPosition === 'top-right' ? 'order-2' : ''}>
                  <div className="w-16 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: colors.primary }}>LOGO</div>
                  <p className="text-xs font-semibold mt-1" style={{ color: colors.primary }}>{fake.from.name}</p>
                  <p className="text-xs opacity-60">{fake.from.address}</p>
                  <p className="text-xs opacity-60">{fake.from.email}</p>
                </div>
              )}
              <div className={`text-right ${template.logoPosition === 'top-right' ? 'order-1 text-left' : ''} ${template.logoPosition === 'top-center' ? 'text-center' : ''}`}>
                <h1 className="text-2xl font-bold tracking-wide" style={{ color: colors.primary }}>INVOICE</h1>
                <p className="text-sm font-semibold opacity-70 mt-0.5">{fake.number}</p>
              </div>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
              <div>
                <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Bill To</p>
                <p className="font-semibold">{fake.to.name}</p>
                <p className="opacity-60">{fake.to.address}</p>
                <p className="opacity-60">{fake.to.email}</p>
              </div>
              <div>
                <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Invoice Date</p>
                <p>{fake.date}</p>
                <p className="mt-2 font-semibold opacity-50 uppercase tracking-wider">Due Date</p>
                <p>{fake.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-xl font-bold" style={{ color: colors.primary }}>₱{fake.total.toLocaleString()}</p>
                <p className="mt-2 opacity-60">Terms: {fake.terms}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-4 h-px" style={{ background: colors.primary + '30' }} />

            {/* Line items */}
            <table className={`w-full text-xs mb-4 ${tableClass}`}>
              <thead>
                <tr style={{ background: colors.primary }}>
                  {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                    <th key={h} className={`px-3 py-2 text-left font-semibold text-white ${h !== 'Description' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fake.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'opacity-80'} style={{ background: i % 2 === 0 ? colors.background : colors.accent + '10' }}>
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">₱{item.unitPrice.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold">₱{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-48 space-y-1 text-xs">
                <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>₱{fake.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="opacity-60">VAT 12%</span><span>₱{fake.tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t" style={{ borderColor: colors.primary + '40', color: colors.primary }}>
                  <span>Total</span><span>₱{fake.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Message */}
            {template.sections.thankYouMessage && (
              <div className="rounded-lg p-3 text-xs text-center opacity-70 mb-3" style={{ background: colors.accent + '15' }}>
                {fake.message}
              </div>
            )}

            {/* Bank details */}
            {template.sections.bankDetails && (
              <div className="text-xs opacity-60 text-center">{fake.notes}</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
