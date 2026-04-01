'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Plus, Upload, Download, Search, ChevronRight, ChevronDown,
  MoreHorizontal, Edit2, Eye, Trash2, PlusSquare,
  CheckCircle2, X,
  RefreshCw, BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { onboardingService } from '@/services/onboarding.service'
import { useToast } from '@/components/ToastProvider'

// ─── Types ────────────────────────────────────────────────────────────────────
type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
type NormalSide = 'Debit' | 'Credit'

interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  normalSide: NormalSide
  balance: number
  isActive: boolean
  isHeader: boolean
  parentId: string | null
  description?: string
  children?: Account[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function buildTree(flat: Account[]): Account[] {
  const map = new Map(flat.map(a => [a.id, { ...a, children: [] as Account[] }]))
  const roots: Account[] = []
  for (const acc of map.values()) {
    if (!acc.parentId) roots.push(acc)
    else map.get(acc.parentId)?.children?.push(acc)
  }
  return roots
}

function flattenAccounts(accounts: Account[], result: Account[] = []): Account[] {
  for (const acc of accounts) {
    result.push(acc)
    if (acc.children) flattenAccounts(acc.children, result)
  }
  return result
}

const TYPE_COLORS: Record<AccountType, string> = {
  Asset:     'bg-sky-100 text-sky-700',
  Liability: 'bg-rose-100 text-rose-700',
  Equity:    'bg-violet-100 text-violet-700',
  Revenue:   'bg-emerald-100 text-emerald-700',
  Expense:   'bg-amber-100 text-amber-700',
}

const TYPE_CODE_RANGES: Record<AccountType, { min: number; max: number }> = {
  Asset: { min: 1000, max: 1999 },
  Liability: { min: 2000, max: 2999 },
  Equity: { min: 3000, max: 3999 },
  Revenue: { min: 4000, max: 4999 },
  Expense: { min: 5000, max: 5999 },
}

function formatRange(type: AccountType) {
  const range = TYPE_CODE_RANGES[type]
  return `${range.min}-${range.max}`
}

function useFmt() {
  const { currency } = useCompanyCurrency()
  return (n: number) => formatCurrency(n, currency)
}

// ─── Dropdown Menu ─────────────────────────────────────────────────────────────
function RowMenu({ account, hasChildren, onEdit, onDeactivate, onReactivate, onAddSubaccount }: {
  account: Account
  hasChildren: boolean
  onEdit: (a: Account) => void
  onDeactivate: (a: Account) => void
  onReactivate: (a: Account) => void
  onAddSubaccount: (a: Account) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        aria-label="More options"
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
      >
        <MoreHorizontal size={15} className="text-slate-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[168px]"
          >
            <button onClick={() => { onEdit(account); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Edit2 size={13} className="text-slate-400" /> Edit Account
            </button>
            <a
              href={`/accounting/core-accounting/general-ledger?accountId=${account.id}`}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Eye size={13} className="text-slate-400" /> View Ledger
            </a>
            {account.isHeader && (
              <button onClick={() => { onAddSubaccount(account); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <PlusSquare size={13} className="text-slate-400" /> Add Sub-account
              </button>
            )}
            <div className="h-px bg-slate-100 my-1" />
            {account.isActive ? (
              <button
                onClick={() => { onDeactivate(account); setOpen(false) }}
                disabled={hasChildren}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm ${hasChildren ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'}`}
                title={hasChildren ? 'Cannot deactivate while child accounts exist' : 'Deactivate account'}
              >
                <Trash2 size={13} /> Deactivate
              </button>
            ) : (
              <button
                onClick={() => { onReactivate(account); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
              >
                <CheckCircle2 size={13} /> Reactivate
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Account Row (recursive) ───────────────────────────────────────────────────
function AccountRow({
  account, depth, expanded, onToggle, onEdit, onDeactivate, onReactivate, onAddSubaccount, showInactive, search, fmt,
}: {
  account: Account
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  onEdit: (a: Account) => void
  onDeactivate: (a: Account) => void
  onReactivate: (a: Account) => void
  onAddSubaccount: (a: Account) => void
  showInactive: boolean
  search: string
  fmt: (n: number) => string
}) {
  const hasChildren = !!(account.children?.length)
  const isExpanded = expanded.has(account.id)

  const matchesSearch = !search ||
    account.name.toLowerCase().includes(search.toLowerCase()) ||
    account.code.includes(search)

  if (!showInactive && !account.isActive) return null
  if (search && !matchesSearch && !hasChildren) return null

  return (
    <>
      <tr className={`border-b border-slate-100 hover:bg-emerald-50/40 transition-colors group ${!account.isActive ? 'opacity-50' : ''}`}>
        <td className="px-3 py-2.5 w-10">
          {hasChildren ? (
            <button
              onClick={() => onToggle(account.id)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 transition-colors"
            >
              <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
                <ChevronRight size={13} className="text-slate-400" />
              </motion.span>
            </button>
          ) : (
            <div className="w-6" />
          )}
        </td>
        <td className="px-3 py-2.5 w-[90px]">
          <span className="font-mono text-xs text-slate-500" style={{ paddingLeft: depth * 14 }}>
            {account.code}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 14 }}>
            <BookOpen size={13} className={account.isHeader ? 'text-emerald-500' : 'text-slate-300'} />
            <span className={`text-sm ${account.isHeader ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
              {account.name}
            </span>
          </div>
        </td>
        <td className="px-3 py-2.5 w-[110px] text-center">
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[account.type]}`}>
            {account.type}
          </span>
        </td>
        <td className="px-3 py-2.5 w-[80px] text-center">
          <span className="text-[10px] font-medium text-slate-500">{account.normalSide}</span>
        </td>
        <td className="px-3 py-2.5 w-[140px] text-right pr-4">
          <span className={`text-sm font-semibold font-mono tabular-nums ${account.balance < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {fmt(account.balance ?? 0)}
          </span>
        </td>
        <td className="px-3 py-2.5 w-[80px] text-center">
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${account.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {account.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-3 py-2.5 w-[60px] text-center">
          <RowMenu account={account} hasChildren={hasChildren} onEdit={onEdit} onDeactivate={onDeactivate} onReactivate={onReactivate} onAddSubaccount={onAddSubaccount} />
        </td>
      </tr>
      {hasChildren && isExpanded && account.children!.map(child => (
        <AccountRow
          key={child.id}
          account={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onReactivate={onReactivate}
          onAddSubaccount={onAddSubaccount}
          showInactive={showInactive}
          search={search}
          fmt={fmt}
        />
      ))}
    </>
  )
}

// ─── Create / Edit Modal ───────────────────────────────────────────────────────
const AUTO_NORMAL_SIDE: Record<AccountType, NormalSide> = {
  Asset: 'Debit',
  Expense: 'Debit',
  Liability: 'Credit',
  Equity: 'Credit',
  Revenue: 'Credit',
}

function AccountModal({
  account, onClose, onSaved, flatAccounts, companyId, defaultParentId,
}: {
  account: Account | null
  onClose: () => void
  onSaved: () => void
  flatAccounts: Account[]
  companyId: string
  defaultParentId?: string
}) {
  const { currency } = useCompanyCurrency()
  const isEdit = !!account
  const [form, setForm] = useState({
    code: account?.code ?? '',
    name: account?.name ?? '',
    type: (account?.type ?? 'Asset') as AccountType,
    normalSide: (account?.normalSide ?? 'Debit') as NormalSide,
    parentId: account?.parentId ?? defaultParentId ?? '',
    description: account?.description ?? '',
    isHeader: account?.isHeader ?? false,
    openingBalance: 0,
  })

  const parentType = useMemo(() => {
    if (!form.parentId) return null
    const parent = flatAccounts.find(a => a.id === form.parentId)
    return parent?.type ?? null
  }, [form.parentId, flatAccounts])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Auto-set normalSide when type changes
  const handleTypeChange = (newType: AccountType) => {
    // If a parent is selected, enforce parent type
    if (parentType && parentType !== newType) {
      return
    }
    setForm(f => ({ ...f, type: newType, normalSide: AUTO_NORMAL_SIDE[newType] }))
  }

  const hasTransactions = Boolean(account?.balance && account.balance !== 0)

  async function handleSave() {
    if (!form.code.trim()) { setError('Account code is required'); return }
    if (!form.name.trim()) { setError('Account name is required'); return }
    if (parentType && form.type !== parentType) {
      setError(`Account type must match parent account type (${parentType}).`)
      return
    }
    if (hasTransactions && account && form.type !== account.type) {
      setError('Account type cannot be changed once the account has transactions.')
      return
    }

    const codeNum = Number(form.code.trim())
    if (Number.isNaN(codeNum) || !Number.isInteger(codeNum)) {
      setError('Account code must be a whole number (e.g. 1100)')
      return
    }

    const duplicateCode = flatAccounts.find(a => a.id !== account?.id && a.code.trim() === form.code.trim())
    if (duplicateCode) {
      setError('Another account already uses that code. Please choose a unique code.')
      return
    }

    const range = TYPE_CODE_RANGES[form.type]
    if (codeNum < range.min || codeNum > range.max) {
      setError(`Account code must be within ${formatRange(form.type)} for ${form.type} accounts.`)
      return
    }

    const payload: Record<string, unknown> = {
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      normalSide: form.normalSide,
      parentId: form.parentId || null,
      description: form.description,
      isHeader: form.isHeader,
    }
    if (!isEdit) payload.openingBalance = form.openingBalance
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await apiClient.put(`/companies/${companyId}/accounting/accounts/${account.id}`, payload)
      } else {
        await apiClient.post(`/companies/${companyId}/accounting/accounts`, payload)
      }
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const descendants = useMemo(() => {
    if (!account?.id) return new Set<string>()
    const map = new Map<string, string[]>()
    for (const a of flatAccounts) {
      if (a.parentId) {
        const arr = map.get(a.parentId) ?? []
        arr.push(a.id)
        map.set(a.parentId, arr)
      }
    }

    const result = new Set<string>()
    const stack = [account.id]
    while (stack.length) {
      const current = stack.pop()
      if (!current) continue
      const children = map.get(current) ?? []
      for (const child of children) {
        if (!result.has(child)) {
          result.add(child)
          stack.push(child)
        }
      }
    }
    return result
  }, [account?.id, flatAccounts])

  const headerAccounts = flatAccounts.filter(a => a.isHeader && a.id !== account?.id && !descendants.has(a.id))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-stretch justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="w-full max-w-md bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Account' : 'New Account'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? `${account.code} · ${account.name}` : 'Fill in account details below'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="coa-account-code" className="block text-xs font-semibold text-slate-700 mb-1.5">Account Code <span className="text-rose-500">*</span></label>
              <input
                id="coa-account-code"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                placeholder="e.g. 1110"
              />
            </div>
            <div>
              <label htmlFor="coa-account-type" className="block text-xs font-semibold text-slate-700 mb-1.5">Account Type <span className="text-rose-500">*</span></label>
              <select
                id="coa-account-type"
                value={parentType ?? form.type}
                onChange={e => handleTypeChange(e.target.value as AccountType)}
                disabled={!!parentType || hasTransactions}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as AccountType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {parentType && (
                <p className="text-xs text-slate-500 mt-1">Type is determined by selected parent account (<strong>{parentType}</strong>).</p>
              )}
              {hasTransactions && (
                <p className="text-xs text-rose-600 mt-1">Cannot change account type once the account has transactions (balance is non-zero).</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Name <span className="text-rose-500">*</span></label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Cash & Cash Equivalents"
            />
          </div>

          <div>
            <label htmlFor="coa-parent-account" className="block text-xs font-semibold text-slate-700 mb-1.5">Parent Account</label>
            <select
              id="coa-parent-account"
              value={form.parentId}
              onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="">— None (Top Level) —</option>
              {headerAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.code} · {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Normal Side <span className="text-rose-500">*</span></label>
            <div className="flex gap-4">
              {(['Debit', 'Credit'] as NormalSide[]).map(side => (
                <label key={side} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="normalSide"
                    checked={form.normalSide === side}
                    onChange={() => setForm(f => ({ ...f, normalSide: side }))}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm text-slate-700 font-medium">{side}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea aria-label="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              placeholder="Optional description…"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opening Balance ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.openingBalance || ''}
                  onChange={e => setForm(f => ({ ...f, openingBalance: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isHeader}
              disabled={hasTransactions && !account?.isHeader}
              onChange={e => setForm(f => ({ ...f, isHeader: e.target.checked }))}
              className="accent-emerald-600 w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-700">Header account <span className="text-slate-400 font-normal">(cannot have transactions)</span></span>
          </label>
          {hasTransactions && !account?.isHeader && (
            <p className="text-xs text-rose-600">Accounts with transactions cannot be converted into header accounts.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.code || !form.name}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          >
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Account')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
// ─── Import CSV Modal ─────────────────────────────────────────────────────
function ImportModal({ onClose, onImported, companyId }: { onClose: () => void; onImported: () => void; companyId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f); setError(''); setSuccess(''); setPreview([])
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const lines = text.trim().split(/\r?\n/).map(l =>
        l.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      )
      setPreview(lines.slice(0, 5))
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true); setError('')
    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const text = e.target?.result as string
        const lines = text.trim().split(/\r?\n/).map(l =>
          l.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
        )
        const headers = lines[0].map(h => h.toLowerCase())
        const codeIdx = headers.findIndex(h => h === 'code')
        const nameIdx = headers.findIndex(h => h === 'name')
        const typeIdx = headers.findIndex(h => h === 'type')
        const sideIdx = headers.findIndex(h => h.includes('side'))
        const descIdx = headers.findIndex(h => h === 'description')
        if (codeIdx < 0 || nameIdx < 0 || typeIdx < 0) {
          setError('CSV must have Code, Name, and Type columns'); setImporting(false); return
        }
        const dataRows = lines.slice(1).filter(r => r[codeIdx]?.trim() && r[nameIdx]?.trim())
        let count = 0
        for (const r of dataRows) {
          const accType = (r[typeIdx] as AccountType) || 'Asset'
          const normalSide = sideIdx >= 0 ? r[sideIdx] : (['Asset', 'Expense'].includes(accType) ? 'Debit' : 'Credit')
          await apiClient.post(`/companies/${companyId}/accounting/accounts`, {
            code: r[codeIdx],
            name: r[nameIdx],
            type: accType,
            normalSide,
            description: descIdx >= 0 ? r[descIdx] : undefined,
          }).catch(() => {})
          count++
        }
        setSuccess(`Imported ${count} account${count !== 1 ? 's' : ''} successfully`)
        setTimeout(() => { onImported(); onClose() }, 1500)
      } catch (er: any) {
        setError(er?.response?.data?.message ?? 'Import failed')
      } finally { setImporting(false) }
    }
    reader.readAsText(file)
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Import Chart of Accounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV with columns: Code, Name, Type, Normal Side (optional), Description (optional)</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
            >
              <Upload size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">{file ? file.name : 'Click to select CSV file'}</p>
              <p className="text-xs text-slate-400 mt-1">Supports .csv format • Columns: Code, Name, Type, Normal Side, Description</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
            </div>
            {preview.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Preview (first {preview.length - 1} data row{preview.length > 2 ? 's' : ''})</p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="text-xs w-full">
                    <thead><tr className="bg-slate-50">{preview[0].map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-bold text-slate-500 border-b border-slate-200">{h}</th>)}</tr></thead>
                    <tbody>{preview.slice(1).map((row, ri) => <tr key={ri} className="border-b border-slate-100">{row.map((c, ci) => <td key={ci} className="px-2 py-1.5 text-slate-600">{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </div>
            )}
            {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</p>}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleImport} disabled={!file || importing} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
              {importing ? 'Importing…' : 'Import Accounts'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ChartOfAccountsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const fmt = useFmt()
  const { currency } = useCompanyCurrency()
  const [companyName, setCompanyName] = useState('')
  const [treeAccounts, setTreeAccounts] = useState<Account[]>([])
  const [flatAccs, setFlatAccs] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<AccountType | ''>('')
  const [showInactive, setShowInactive] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined)
  const [importModal, setImportModal] = useState(false)
  const toast = useToast()

  // If company loading finishes with no company, stop loading
  useEffect(() => {
    if (!companyLoading && !companyId) setLoading(false)
  }, [companyLoading, companyId])

  // Mark COA customization step complete (Setup Center phase: Financial Setup)
  useEffect(() => {
    try {
      onboardingService.saveStep('coa_custom', {
        completed: true,
        updatedAt: new Date(),
      })
    } catch {
      // best-effort; non-blocking if onboarding service is temporarily unavailable
    }
  }, [])

  // Load accounts from API
  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/accounts?includeInactive=true`)
      const flat: Account[] = Array.isArray(data) ? data : (data?.data ?? [])
      const tree = buildTree(flat)
      setFlatAccs(flat)
      setTreeAccounts(tree)
      // Auto-expand top-level accounts
      setExpanded(new Set(tree.map(a => a.id)))
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const totalAccounts = flatAccs.length
  const activeAccounts = flatAccs.filter(a => a.isActive).length
  const totalDebits = flatAccs.filter(a => a.normalSide === 'Debit' && !a.isHeader).reduce((s, a) => s + (a.balance ?? 0), 0)
  const totalCredits = flatAccs.filter(a => a.normalSide === 'Credit' && !a.isHeader).reduce((s, a) => s + Math.abs(a.balance ?? 0), 0)

  const displayAccounts = useMemo(() => {
    if (!filterType) return treeAccounts
    return treeAccounts.filter(a => a.type === filterType)
  }, [filterType, treeAccounts])

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const openCreate = () => {
    if (!companyId) {
      alert('No active company selected. Please create or pick a company before adding accounts.')
      return
    }
    setEditingAccount(null)
    setDefaultParentId(undefined)
    setModalOpen(true)
  }
  const openEdit = (acc: Account) => { setEditingAccount(acc); setDefaultParentId(undefined); setModalOpen(true) }
  const openAddSubaccount = (parent: Account) => { setEditingAccount(null); setDefaultParentId(parent.id); setModalOpen(true) }

  async function handleDeactivate(acc: Account) {
    if (!companyId) return
    if (!confirm(`Deactivate "${acc.name}"? This will hide it from transaction forms.`)) return
    try {
      await apiClient.delete(`/companies/${companyId}/accounting/accounts/${acc.id}`)
      loadAccounts()
      toast.success('Account deactivated successfully.')
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? ''
      if (msg.toLowerCase().includes('active children')) {
        toast.error('Cannot deactivate account with active children.')
      } else {
        toast.error(msg || 'Failed to deactivate account. Please try again.')
      }
    }
  }

  async function handleReactivate(acc: Account) {
    if (!companyId) return
    try {
      await apiClient.put(`/companies/${companyId}/accounting/accounts/${acc.id}`, { isActive: true })
      loadAccounts()
    } catch { /* ignore */ }
  }

  async function handleSeedDefault() {
    if (!companyId) return
    setSeeding(true)
    try {
      await apiClient.post(`/companies/${companyId}/accounting/accounts/seed-default`)
      await loadAccounts()
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Seeding failed. Please try again.')
    } finally {
      setSeeding(false)
    }
  }

  const handleExport = () => {
    const header = ['Code', 'Name', 'Type', 'Normal Side', 'Balance', 'Status', 'Parent Code', 'Description']
    const codeMap = new Map(flatAccs.map(a => [a.id, a.code]))
    const rows = flatAccs.map(a => [
      a.code, a.name, a.type, a.normalSide,
      String(a.balance ?? 0),
      a.isActive ? 'Active' : 'Inactive',
      a.parentId ? (codeMap.get(a.parentId) ?? '') : '',
      a.description ?? '',
    ])
    const csv = [header, ...rows].map(r =>
      r.map(c => `"${(c ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a2 = document.createElement('a'); a2.href = url; a2.download = 'chart-of-accounts.csv'; a2.click()
    URL.revokeObjectURL(url)
  }

  const expandAll = () => setExpanded(new Set(flatAccs.map(a => a.id)))
  const collapseAll = () => setExpanded(new Set())

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chart of Accounts</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {companyName || 'Your Company'} · Total: {totalAccounts} &bull; Active: {activeAccounts}{totalAccounts - activeAccounts > 0 ? ` · Inactive: ${totalAccounts - activeAccounts}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-52 bg-slate-50"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as AccountType | '')}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 w-36"
            >
              <option value="">All Types</option>
              {(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as AccountType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 text-sm text-slate-600 select-none">
              <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="accent-emerald-600" />
              Inactive
            </label>
            <button onClick={loadAccounts} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={collapseAll} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <ChevronRight size={13} /> Collapse
            </button>
            <button onClick={() => setDocOpen(true)} className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold" aria-label="Open documentation for chart of accounts">?</button>
            <button onClick={expandAll} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <ChevronDown size={13} /> Expand All
            </button>
            <button onClick={() => setImportModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload size={13} /> Import
            </button>
            <button onClick={handleExport} disabled={flatAccs.length === 0} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={13} /> Export
            </button>
            <button
              onClick={openCreate}
              disabled={!companyId || companyLoading}
              title={!companyId ? 'Select or create a company first' : companyLoading ? 'Loading company...' : ''}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus size={14} /> New Account
            </button>
          </div>
        </div>

        {docOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold">Chart of Accounts Help</h2>
                <button onClick={() => setDocOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
              </div>
              <div className="p-4 text-sm text-slate-700 space-y-3">
                <p>This modal offers detailed documentation of functions in the Chart of Accounts module. Use this to understand each UI control and workflow.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Search and filter accounts in realtime.</li>
                  <li>Import and export chart templates.</li>
                  <li>Create new accounts and manage hierarchy visibility.</li>
                </ul>
                <p>Click the help button (?) in the header to come back here.</p>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* ── Table ── */}
      <div className="flex-1 px-6 py-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-3 py-3" />
                <th className="w-[90px] px-3 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Name</th>
                <th className="w-[110px] px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="w-[80px] px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Side</th>
                <th className="w-[140px] px-3 py-3 text-right pr-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="w-[80px] px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="w-[60px] px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <RefreshCw size={24} className="text-slate-300 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-slate-400">Loading accounts…</p>
                  </td>
                </tr>
              ) : displayAccounts.length === 0 && flatAccs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <BookOpen size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 mb-1">No accounts yet</p>
                    <p className="text-xs text-slate-400 mb-4">Set up your default Chart of Accounts template or create accounts manually</p>
                    <button
                      onClick={handleSeedDefault}
                      disabled={seeding}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow shadow-emerald-600/25 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
                      {seeding ? 'Setting up…' : 'Set Up Default COA Template'}
                    </button>
                  </td>
                </tr>
              ) : displayAccounts.map(account => (
                <AccountRow
                  key={account.id}
                  account={account}
                  depth={0}
                  expanded={expanded}
                  onToggle={toggle}
                  onEdit={openEdit}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  onAddSubaccount={openAddSubaccount}
                  showInactive={showInactive}
                  search={search}
                  fmt={fmt}
                />
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">{flatAccs.length} accounts total · {activeAccounts} active</p>
            <p className="text-xs text-slate-400">Click an account row arrow to expand sub-accounts</p>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && companyId && (
          <AccountModal
            account={editingAccount}
            onClose={() => setModalOpen(false)}
            onSaved={loadAccounts}
            flatAccounts={flatAccs}
            companyId={companyId}
            defaultParentId={defaultParentId}
          />
        )}
      </AnimatePresence>
      {/* ── Import Modal ── */}
      {importModal && companyId && (
        <ImportModal onClose={() => setImportModal(false)} onImported={loadAccounts} companyId={companyId} />
      )}
    </div>
  )
}
