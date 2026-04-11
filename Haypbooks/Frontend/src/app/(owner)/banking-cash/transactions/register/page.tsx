'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckSquare,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Filter,
  Link2,
  Plus,
  Printer,
  Scissors,
  Trash2,
  X,
} from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import {
  MOCK_BANK_ACCOUNTS,
  MOCK_COA_ACCOUNTS,
  MOCK_ENTITIES,
  addManualRegisterEntry,
  batchDeleteTransactions,
  batchEditAccount,
  editTransactionAccount,
  editTransactionContact,
  editTransactionMemo,
  getAuditLogForEntity,
  getRegisterEntries,
  mockJEs,
  mockStore,
  toggleReconciliation,
  undoCategorize,
  type AuditLogEntry,
  type MockJournalEntry,
  type RegisterEntry,
} from '../mockGLState'

type SourceFilter = 'all' | 'imported' | 'manual' | 'matched' | 'transfer'
type ReconciledFilter = 'all' | 'reconciled' | 'unreconciled'
type EditableField = 'account' | 'contact' | 'memo'
type ActivityFilter = 'all' | 'edits' | 'reconciliations' | 'categorizations'

interface AdvancedFilters {
  accountId: string
  status: SourceFilter
  reconciled: ReconciledFilter
  minAmount: string
  maxAmount: string
}

interface SavedFilter {
  name: string
  search: string
  dateFrom: string
  dateTo: string
  filters: AdvancedFilters
}

interface AddEntryForm {
  date: string
  description: string
  reference: string
  type: 'Debit' | 'Credit'
  amount: string
  accountId: string
  contactId: string
  memo: string
}

const FILTER_STORAGE_KEY = 'hb-bank-register-saved-filters'
const DEFAULT_FILTERS: AdvancedFilters = {
  accountId: '',
  status: 'all',
  reconciled: 'all',
  minAmount: '',
  maxAmount: '',
}

function formatLongDate(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return date
  }
}

function formatShortDate(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

function csvEscape(value: string | number | boolean | undefined): string {
  const stringValue = String(value ?? '')
  return `"${stringValue.replace(/"/g, '""')}"`
}

function getTransactionSource(tx: RegisterEntry): Exclude<SourceFilter, 'all'> {
  if (tx.manualEntry) return 'manual'
  if (tx.transactionType === 'Bank Transfer') return 'transfer'
  if (tx.status === 'MATCHED') return 'matched'
  return 'imported'
}

function getTransactionSourceLabel(tx: RegisterEntry): string {
  const source = getTransactionSource(tx)
  if (source === 'manual') return 'Manual'
  if (source === 'matched') return 'Matched'
  if (source === 'transfer') return 'Transfer'
  return 'Imported'
}

function getAuditBucket(action: AuditLogEntry['action']): ActivityFilter {
  if (action === 'edited') return 'edits'
  if (action === 'reconciled' || action === 'unreconciled') return 'reconciliations'
  return 'categorizations'
}

function getAuditDot(action: AuditLogEntry['action']): string {
  if (action === 'edited') return 'bg-blue-500'
  if (action === 'reconciled') return 'bg-emerald-500'
  if (action === 'unreconciled') return 'bg-amber-500'
  if (action === 'deleted') return 'bg-rose-500'
  if (action === 'manual_entry') return 'bg-violet-500'
  return 'bg-slate-500'
}

function getAuditFilterLabel(filter: ActivityFilter): string {
  if (filter === 'edits') return 'Edits'
  if (filter === 'reconciliations') return 'Reconciliations'
  if (filter === 'categorizations') return 'Categorizations'
  return 'All'
}

function matchesAuditFilter(entry: AuditLogEntry, filter: ActivityFilter): boolean {
  return filter === 'all' ? true : getAuditBucket(entry.action) === filter
}

function getCoaId(tx: RegisterEntry): string {
  if (tx.accountCode) {
    const byCode = MOCK_COA_ACCOUNTS.find(account => account.code === tx.accountCode)
    if (byCode) return byCode.id
  }
  return MOCK_COA_ACCOUNTS.find(account => account.name === tx.accountName)?.id ?? ''
}

type StatusIconName = 'file' | 'transfer' | 'split'

function getLinkedJournalEntry(tx: Pick<RegisterEntry, 'journalEntryId' | 'bankRef'>): MockJournalEntry | null {
  const candidates = [tx.bankRef, tx.journalEntryId].filter((value): value is string => Boolean(value))

  for (const id of candidates) {
    const entry = mockJEs.find(item => item.id === id)
    if (entry) return entry
  }

  return null
}

function getJournalEntryReference(entry: MockJournalEntry | null, fallbackId?: string): string {
  return entry?.referenceNo ?? fallbackId?.toUpperCase() ?? '—'
}

function getReferenceDisplayText(tx: RegisterEntry): string {
  if (tx.transactionType === 'Bank Transfer') return 'TRANSFER'
  if (!tx.journalEntryId && !tx.bankRef) return '—'
  const linkedEntry = getLinkedJournalEntry(tx)
  return getJournalEntryReference(linkedEntry, tx.bankRef ?? tx.journalEntryId)
}

function getReferenceSearchText(tx: RegisterEntry): string {
  const linkedEntry = getLinkedJournalEntry(tx)
  return [
    tx.ref,
    tx.bankRef,
    tx.journalEntryId,
    linkedEntry?.referenceNo,
    linkedEntry?.description,
    getReferenceDisplayText(tx),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getJournalEntryMemo(entry: MockJournalEntry | null): string {
  return entry?.lines.find(line => Boolean(line.memo))?.memo ?? entry?.description ?? '—'
}

function getOpenRecordLabel(entry: MockJournalEntry | null): string {
  if (entry?.type === 'Bill') return 'Open Bill →'
  if (entry?.type === 'Invoice') return 'Open Invoice →'
  return 'Open Record →'
}

function getUndoActionLabel(tx: RegisterEntry): string {
  if (tx.status === 'MATCHED') return 'Undo Match'
  if (tx.transactionType === 'Split Transaction') return 'Undo Split'
  if (tx.transactionType === 'Bank Transfer') return 'Undo Transfer'
  return 'Undo Categorization'
}

function getTransferParties(tx: RegisterEntry, entry: MockJournalEntry | null): { from: string; to: string } {
  const currentBank = MOCK_BANK_ACCOUNTS.find(account => account.id === tx.accountId)?.name ?? 'Current Bank Account'
  const otherBank = entry?.lines.find(line => line.accountName !== currentBank)?.accountName ?? 'Linked Bank Account'

  return tx.amount < 0
    ? { from: currentBank, to: otherBank }
    : { from: otherBank, to: currentBank }
}

function getStatusMeta(tx: RegisterEntry): { label: string; classes: string; icon?: StatusIconName } {
  if (tx.manualEntry) {
    return { label: 'Manual', classes: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
  if (tx.transactionType === 'Bank Transfer') {
    return { label: 'Transfer', classes: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'transfer' }
  }
  if (tx.transactionType === 'Split Transaction') {
    return { label: 'Split', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'split' }
  }
  if (tx.status === 'MATCHED') {
    return { label: 'Matched', classes: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'file' }
  }
  return { label: 'Categorized', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

function buildCsv(rows: RegisterEntry[]): string {
  const headers = [
    'Date',
    'Reference',
    'Payee',
    'Description',
    'Account',
    'Withdrawal',
    'Deposit',
    'Balance',
    'Reconciled',
    'Memo',
  ]
  const body = rows.map(row => [
    csvEscape(row.date),
    csvEscape(row.ref ?? row.bankRef ?? ''),
    csvEscape(row.contactName ?? ''),
    csvEscape(row.description),
    csvEscape(row.accountName ?? ''),
    csvEscape(row.amount < 0 ? Math.abs(row.amount).toFixed(2) : ''),
    csvEscape(row.amount > 0 ? row.amount.toFixed(2) : ''),
    csvEscape(row.runningBalance.toFixed(2)),
    csvEscape(row.reconciled ? 'Yes' : 'No'),
    csvEscape(row.memo ?? ''),
  ])
  return [headers.map(csvEscape), ...body].map(line => line.join(',')).join('\n')
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function StatusBadge({ tx }: { tx: RegisterEntry }) {
  const meta = getStatusMeta(tx)
  const Icon = meta.icon === 'file' ? FileText : meta.icon === 'transfer' ? ArrowLeftRight : meta.icon === 'split' ? Scissors : null

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </span>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { currency } = useCompanyCurrency()
  const formatMoney = (value: number) => formatCurrency(value, currency)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [version, setVersion] = useState(0)
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(MOCK_BANK_ACCOUNTS[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [savedFilterName, setSavedFilterName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ txId: string; field: EditableField } | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [toast, setToast] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addError, setAddError] = useState('')
  const [addForm, setAddForm] = useState<AddEntryForm>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    reference: '',
    type: 'Debit',
    amount: '',
    accountId: '',
    contactId: '',
    memo: '',
  })
  const [batchEditOpen, setBatchEditOpen] = useState(false)
  const [batchAccountId, setBatchAccountId] = useState('')
  const [detailTxId, setDetailTxId] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<ActivityFilter>('all')
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [statementBalance, setStatementBalance] = useState('')

  const selectedBankAccount = useMemo(
    () => MOCK_BANK_ACCOUNTS.find(account => account.id === selectedBankAccountId) ?? null,
    [selectedBankAccountId],
  )

  const registerEntries = useMemo(() => {
    if (!selectedBankAccountId) return []
    return getRegisterEntries(selectedBankAccountId, dateFrom || undefined, dateTo || undefined)
  }, [selectedBankAccountId, dateFrom, dateTo, version])

  const accountFilterOptions = useMemo(() => {
    const ids = new Set(registerEntries.map(tx => getCoaId(tx)).filter(Boolean))
    return MOCK_COA_ACCOUNTS.filter(account => ids.has(account.id))
  }, [registerEntries])

  const visibleEntries = useMemo(() => {
    let rows = [...registerEntries].sort((left, right) => {
      const byDate = right.date.localeCompare(left.date)
      if (byDate !== 0) return byDate
      return right.id.localeCompare(left.id)
    })

    const query = search.trim().toLowerCase()
    if (query) {
      rows = rows.filter(tx =>
        tx.description.toLowerCase().includes(query) ||
        (tx.contactName ?? '').toLowerCase().includes(query) ||
        (tx.accountName ?? '').toLowerCase().includes(query) ||
        (tx.memo ?? '').toLowerCase().includes(query) ||
        getReferenceSearchText(tx).includes(query),
      )
    }

    if (appliedFilters.accountId) {
      rows = rows.filter(tx => getCoaId(tx) === appliedFilters.accountId)
    }
    if (appliedFilters.status !== 'all') {
      rows = rows.filter(tx => getTransactionSource(tx) === appliedFilters.status)
    }
    if (appliedFilters.reconciled !== 'all') {
      rows = rows.filter(tx => appliedFilters.reconciled === 'reconciled' ? Boolean(tx.reconciled) : !tx.reconciled)
    }
    if (appliedFilters.minAmount) {
      const min = Number(appliedFilters.minAmount)
      if (!Number.isNaN(min)) rows = rows.filter(tx => Math.abs(tx.amount) >= min)
    }
    if (appliedFilters.maxAmount) {
      const max = Number(appliedFilters.maxAmount)
      if (!Number.isNaN(max)) rows = rows.filter(tx => Math.abs(tx.amount) <= max)
    }

    return rows
  }, [registerEntries, search, appliedFilters])

  const detailTx = useMemo(
    () => (detailTxId ? registerEntries.find(tx => tx.id === detailTxId) ?? null : null),
    [detailTxId, registerEntries],
  )

  const detailJournalEntry = useMemo(
    () => (detailTx ? getLinkedJournalEntry(detailTx) : null),
    [detailTx, version],
  )

  const detailMatchedRecord = useMemo(
    () => (detailTx?.status === 'MATCHED' ? getLinkedJournalEntry(detailTx) : null),
    [detailTx, version],
  )

  const detailHistory = useMemo(() => {
    if (!detailTx) return []
    return getAuditLogForEntity(detailTx.id).filter(entry => matchesAuditFilter(entry, detailFilter))
  }, [detailFilter, detailTx, version])

  const detailTransferParties = detailTx?.transactionType === 'Bank Transfer'
    ? getTransferParties(detailTx, detailJournalEntry)
    : null

  const selectedEntries = useMemo(
    () => visibleEntries.filter(tx => selectedIds.has(tx.id)),
    [selectedIds, visibleEntries],
  )

  const openingBalance = selectedBankAccount?.openingBalance ?? 0
  const totalDeposits = registerEntries.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)
  const totalWithdrawals = registerEntries.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const closingBalance = registerEntries.length > 0 ? registerEntries[registerEntries.length - 1].runningBalance : openingBalance
  const reconciledTotal = registerEntries.filter(tx => tx.reconciled).length
  const outstandingWithdrawals = registerEntries.filter(tx => tx.amount < 0 && !tx.reconciled).reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const outstandingDeposits = registerEntries.filter(tx => tx.amount > 0 && !tx.reconciled).reduce((sum, tx) => sum + tx.amount, 0)
  const adjustedBookBalance = closingBalance - outstandingWithdrawals + outstandingDeposits
  const statementBalanceNumber = Number(statementBalance || '0')
  const reconciliationDifference = statementBalance ? statementBalanceNumber - adjustedBookBalance : 0
  const selectedTotal = selectedEntries.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const allVisibleSelected = visibleEntries.length > 0 && visibleEntries.every(tx => selectedIds.has(tx.id))

  const activeFilterPills = useMemo(() => {
    const pills: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (search.trim()) {
      pills.push({ key: 'search', label: `Search: ${search.trim()}`, onRemove: () => setSearch('') })
    }
    if (dateFrom) {
      pills.push({ key: 'dateFrom', label: `From: ${formatShortDate(dateFrom)}`, onRemove: () => setDateFrom('') })
    }
    if (dateTo) {
      pills.push({ key: 'dateTo', label: `To: ${formatShortDate(dateTo)}`, onRemove: () => setDateTo('') })
    }
    if (appliedFilters.accountId) {
      const account = MOCK_COA_ACCOUNTS.find(item => item.id === appliedFilters.accountId)
      pills.push({
        key: 'accountId',
        label: `Account: ${account?.name ?? appliedFilters.accountId}`,
        onRemove: () => {
          setAppliedFilters(current => ({ ...current, accountId: '' }))
          setDraftFilters(current => ({ ...current, accountId: '' }))
        },
      })
    }
    if (appliedFilters.status !== 'all') {
      pills.push({
        key: 'status',
        label: `Status: ${appliedFilters.status}`,
        onRemove: () => {
          setAppliedFilters(current => ({ ...current, status: 'all' }))
          setDraftFilters(current => ({ ...current, status: 'all' }))
        },
      })
    }
    if (appliedFilters.reconciled !== 'all') {
      pills.push({
        key: 'reconciled',
        label: `Reconciled: ${appliedFilters.reconciled}`,
        onRemove: () => {
          setAppliedFilters(current => ({ ...current, reconciled: 'all' }))
          setDraftFilters(current => ({ ...current, reconciled: 'all' }))
        },
      })
    }
    if (appliedFilters.minAmount) {
      pills.push({
        key: 'minAmount',
        label: `Min: ${formatMoney(Number(appliedFilters.minAmount || '0'))}`,
        onRemove: () => {
          setAppliedFilters(current => ({ ...current, minAmount: '' }))
          setDraftFilters(current => ({ ...current, minAmount: '' }))
        },
      })
    }
    if (appliedFilters.maxAmount) {
      pills.push({
        key: 'maxAmount',
        label: `Max: ${formatMoney(Number(appliedFilters.maxAmount || '0'))}`,
        onRemove: () => {
          setAppliedFilters(current => ({ ...current, maxAmount: '' }))
          setDraftFilters(current => ({ ...current, maxAmount: '' }))
        },
      })
    }

    return pills
  }, [appliedFilters, dateFrom, dateTo, formatMoney, search])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as SavedFilter[]
      if (Array.isArray(parsed)) setSavedFilters(parsed)
    } catch {
      // ignore malformed local state
    }
  }, [])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [selectedBankAccountId, dateFrom, dateTo, search, appliedFilters, version])

  useEffect(() => {
    if (detailTxId && !registerEntries.some(tx => tx.id === detailTxId)) {
      setDetailTxId(null)
    }
  }, [detailTxId, registerEntries])

  useEffect(() => {
    if (!detailTxId && !showAddModal && !batchEditOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (detailTxId) setDetailTxId(null)
      if (showAddModal) setShowAddModal(false)
      if (batchEditOpen) setBatchEditOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [batchEditOpen, detailTxId, showAddModal])

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 2400)
  }

  const persistSavedFilters = (nextFilters: SavedFilter[]) => {
    setSavedFilters(nextFilters)
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(nextFilters))
  }

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters })
  }

  const clearAllFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const saveCurrentFilter = () => {
    const name = savedFilterName.trim()
    if (!name) return
    const next = [
      { name, search, dateFrom, dateTo, filters: { ...draftFilters } },
      ...savedFilters.filter(filter => filter.name !== name),
    ]
    persistSavedFilters(next)
    setSavedFilterName('')
    showToast('Saved filter added')
  }

  const applySavedFilter = (savedFilter: SavedFilter) => {
    setSearch(savedFilter.search)
    setDateFrom(savedFilter.dateFrom)
    setDateTo(savedFilter.dateTo)
    setDraftFilters(savedFilter.filters)
    setAppliedFilters(savedFilter.filters)
    showToast(`Applied saved filter: ${savedFilter.name}`)
  }

  const removeSavedFilter = (name: string) => {
    persistSavedFilters(savedFilters.filter(filter => filter.name !== name))
  }

  const beginEdit = (tx: RegisterEntry, field: EditableField) => {
    if (field === 'account') setEditingValue(getCoaId(tx))
    if (field === 'contact') setEditingValue(tx.contactId ?? '')
    if (field === 'memo') setEditingValue(tx.memo ?? '')
    setEditingCell({ txId: tx.id, field })
  }

  const saveEdit = (tx: RegisterEntry) => {
    if (!editingCell || editingCell.txId !== tx.id) return

    let updated = false
    if (editingCell.field === 'account' && editingValue) {
      updated = Boolean(editTransactionAccount(tx.id, editingValue))
    }
    if (editingCell.field === 'contact') {
      updated = Boolean(editTransactionContact(tx.id, editingValue || undefined))
    }
    if (editingCell.field === 'memo') {
      updated = Boolean(editTransactionMemo(tx.id, editingValue))
    }

    setEditingCell(null)
    setEditingValue('')

    if (updated) {
      setVersion(current => current + 1)
      showToast('Updated')
    }
  }

  const toggleSelectAllVisible = () => {
    setSelectedIds(current => {
      const next = new Set(current)
      if (allVisibleSelected) {
        visibleEntries.forEach(tx => next.delete(tx.id))
      } else {
        visibleEntries.forEach(tx => next.add(tx.id))
      }
      return next
    })
  }

  const toggleSelected = (txId: string) => {
    setSelectedIds(current => {
      const next = new Set(current)
      if (next.has(txId)) next.delete(txId)
      else next.add(txId)
      return next
    })
  }

  const toggleSingleReconciliation = (tx: RegisterEntry) => {
    toggleReconciliation(tx.id, !tx.reconciled)
    setVersion(current => current + 1)
    showToast(tx.reconciled ? 'Marked unreconciled' : 'Marked reconciled')
  }

  const reconcileSelected = () => {
    if (selectedEntries.length === 0) return
    const shouldReconcile = selectedEntries.some(tx => !tx.reconciled)
    selectedEntries.forEach(tx => toggleReconciliation(tx.id, shouldReconcile))
    setVersion(current => current + 1)
    setSelectedIds(new Set())
    showToast(shouldReconcile ? 'Selected transactions reconciled' : 'Selected transactions unreconciled')
  }

  const openBatchEdit = () => {
    setBatchAccountId('')
    setBatchEditOpen(true)
  }

  const applyBatchAccountEdit = () => {
    if (!batchAccountId || selectedEntries.length === 0) return
    batchEditAccount(selectedEntries.map(tx => tx.id), batchAccountId)
    setVersion(current => current + 1)
    setBatchEditOpen(false)
    setBatchAccountId('')
    showToast('Batch account update applied')
  }

  const deleteSelected = () => {
    if (selectedEntries.length === 0) return
    const confirmed = window.confirm(`Delete ${selectedEntries.length} transactions? This cannot be undone.`)
    if (!confirmed) return
    batchDeleteTransactions(selectedEntries.map(tx => tx.id))
    setVersion(current => current + 1)
    setSelectedIds(new Set())
    setDetailTxId(null)
    showToast('Selected transactions deleted')
  }

  const exportVisible = () => {
    const csv = buildCsv(visibleEntries)
    downloadCsv(`bank-register-${selectedBankAccountId || 'export'}.csv`, csv)
  }

  const exportSelected = () => {
    const csv = buildCsv(selectedEntries)
    downloadCsv(`bank-register-selected-${selectedBankAccountId || 'export'}.csv`, csv)
  }

  const submitAddTransaction = () => {
    if (!selectedBankAccountId) {
      setAddError('Select a bank account first.')
      return
    }
    if (!addForm.accountId) {
      setAddError('Account/Category is required.')
      return
    }
    if (!addForm.description.trim()) {
      setAddError('Description is required.')
      return
    }

    const amount = Number(addForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setAddError('Amount must be greater than zero.')
      return
    }

    const created = addManualRegisterEntry({
      bankAccountId: selectedBankAccountId,
      date: addForm.date,
      description: addForm.description,
      reference: addForm.reference || undefined,
      amount,
      type: addForm.type,
      accountId: addForm.accountId,
      contactId: addForm.contactId || undefined,
      memo: addForm.memo || undefined,
    })

    if (!created) {
      setAddError('Unable to create the manual entry.')
      return
    }

    setVersion(current => current + 1)
    setShowAddModal(false)
    setAddError('')
    setAddForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      reference: '',
      type: 'Debit',
      amount: '',
      accountId: '',
      contactId: '',
      memo: '',
    })
    showToast('Manual transaction added')
  }

  const openRecord = (journalEntryId?: string, txId?: string, type?: string) => {
    if (!journalEntryId) {
      showToast('No journal entry linked')
      return
    }

    const params = new URLSearchParams({ id: journalEntryId })
    if (txId) params.set('txnId', txId)
    if (type) params.set('type', type.toLowerCase())
    router.push(`/banking-cash/transactions/view-record?${params.toString()}`)
  }

  const undoFromDetail = () => {
    if (!detailTx) return

    const liveTx = mockStore.items.find(item => item.id === detailTx.id)
    if (!liveTx) return

    const relatedIds = detailTx.transactionType === 'Bank Transfer'
      ? mockStore.items
          .filter(item => item.id === detailTx.id || item.transferSourceId === detailTx.id || item.id === detailTx.transferSourceId)
          .map(item => item.id)
      : [detailTx.id]

    undoCategorize(liveTx)
    setSelectedIds(current => {
      const next = new Set(current)
      relatedIds.forEach(id => next.delete(id))
      return next
    })
    setDetailTxId(null)
    setVersion(current => current + 1)
    showToast('Transaction unmatched — moved back to Bank Transactions')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white print:hidden">
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <button
                onClick={() => router.push('/banking-cash/transactions')}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Bank Feed
              </button>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Banking & Cash / Bank Transactions</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Bank Register</h1>
              <p className="mt-1 text-sm text-slate-500">Processed transactions, manual entries, and reconciliation for a single bank account.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Bank account"
                value={selectedBankAccountId}
                onChange={event => setSelectedBankAccountId(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0"
              >
                {MOCK_BANK_ACCOUNTS.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.accountNumber}
                  </option>
                ))}
              </select>
              <input
                type="search"
                aria-label="Search register transactions"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search payee, memo, account..."
                className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0"
              />
              <input
                type="date"
                aria-label="Date from"
                value={dateFrom}
                onChange={event => setDateFrom(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0"
              />
              <input
                type="date"
                aria-label="Date to"
                value={dateTo}
                onChange={event => setDateTo(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0"
              />
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
              <button
                onClick={() => setFiltersOpen(current => !current)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => router.push('/banking-cash/transactions/activity')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Clock className="h-4 w-4" />
                Activity
              </button>
              <button
                onClick={exportVisible}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-slate-200 bg-white px-6 py-4 print:block">
        <h2 className="text-lg font-bold text-slate-900">Bank Register - {selectedBankAccount?.name ?? 'Bank Account'}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {dateFrom || dateTo ? `${dateFrom || 'Start'} to ${dateTo || 'End'}` : 'All Dates'}
        </p>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span>Opening Balance: <span className="font-semibold text-slate-900">{formatMoney(openingBalance)}</span></span>
            <span>Total Deposits: <span className="font-semibold text-emerald-700">{formatMoney(totalDeposits)}</span></span>
            <span>Total Withdrawals: <span className="font-semibold text-rose-600">{formatMoney(totalWithdrawals)}</span></span>
            <span>Closing Balance: <span className={`font-semibold ${closingBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatMoney(closingBalance)}</span></span>
            <span>Reconciled: <span className="font-semibold text-emerald-700">{reconciledTotal} / {registerEntries.length}</span></span>
          </div>
        </div>

        {filtersOpen && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
            <div className="grid gap-3 lg:grid-cols-6">
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Account</span>
                <select
                  aria-label="Filter by account"
                  value={draftFilters.accountId}
                  onChange={event => setDraftFilters(current => ({ ...current, accountId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                >
                  <option value="">All Accounts</option>
                  {accountFilterOptions.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Status</span>
                <select
                  aria-label="Filter by status"
                  value={draftFilters.status}
                  onChange={event => setDraftFilters(current => ({ ...current, status: event.target.value as SourceFilter }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="imported">Imported</option>
                  <option value="manual">Manual</option>
                  <option value="matched">Matched</option>
                  <option value="transfer">Transfer</option>
                </select>
              </label>

              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Reconciled</span>
                <select
                  aria-label="Filter by reconciled state"
                  value={draftFilters.reconciled}
                  onChange={event => setDraftFilters(current => ({ ...current, reconciled: event.target.value as ReconciledFilter }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                >
                  <option value="all">All</option>
                  <option value="reconciled">Reconciled</option>
                  <option value="unreconciled">Unreconciled</option>
                </select>
              </label>

              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Min Amount</span>
                <input
                  type="number"
                  aria-label="Minimum amount"
                  value={draftFilters.minAmount}
                  onChange={event => setDraftFilters(current => ({ ...current, minAmount: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                  placeholder="0.00"
                />
              </label>

              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Max Amount</span>
                <input
                  type="number"
                  aria-label="Maximum amount"
                  value={draftFilters.maxAmount}
                  onChange={event => setDraftFilters(current => ({ ...current, maxAmount: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                  placeholder="0.00"
                />
              </label>

              <div className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Saved Filters</span>
                <div className="flex gap-2">
                  <input
                    aria-label="Saved filter name"
                    value={savedFilterName}
                    onChange={event => setSavedFilterName(event.target.value)}
                    placeholder="Save current"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                  />
                  <button
                    onClick={saveCurrentFilter}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case text-slate-700 hover:bg-slate-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={applyFilters}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Apply Filters
              </button>
              <button
                onClick={clearAllFilters}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>

            {savedFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {savedFilters.map(filter => (
                  <div key={filter.name} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                    <button onClick={() => applySavedFilter(filter)} className="font-medium hover:text-slate-900">
                      {filter.name}
                    </button>
                    <button aria-label={`Remove saved filter ${filter.name}`} title={`Remove saved filter ${filter.name}`} onClick={() => removeSavedFilter(filter.name)} className="text-slate-400 hover:text-rose-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeFilterPills.length > 0 && (
          <div className="flex flex-wrap gap-2 print:hidden">
            {activeFilterPills.map(filter => (
              <button
                key={filter.key}
                onClick={filter.onRemove}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm hover:border-slate-300"
              >
                {filter.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1420px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all visible transactions"
                    />
                  </th>
                  <th className="w-28 px-4 py-3">Date</th>
                  <th className="w-44 px-4 py-3">Reference</th>
                  <th className="w-48 px-4 py-3">Payee / Name</th>
                  <th className="min-w-[280px] px-4 py-3">Description</th>
                  <th className="w-48 px-4 py-3">Account / Category</th>
                  <th className="w-32 px-4 py-3 text-right">Withdrawal</th>
                  <th className="w-32 px-4 py-3 text-right">Deposit</th>
                  <th className="w-40 px-4 py-3">Status</th>
                  <th className="w-40 px-4 py-3">Reconciled</th>
                  <th className="w-36 border-l-2 border-slate-300 px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleEntries.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-16 text-center text-sm text-slate-400">
                      No register transactions match the current filters.
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className="bg-blue-50/50 font-medium">
                      <td colSpan={10} className="px-4 py-2 text-sm italic text-blue-700">
                        Opening Balance - {selectedBankAccount?.name}
                      </td>
                      <td className="border-l-2 border-slate-300 px-4 py-2 text-right text-sm font-semibold text-blue-700">
                        {formatMoney(openingBalance)}
                      </td>
                    </tr>

                    {visibleEntries.map((tx, index) => {
                      const previous = visibleEntries[index - 1]
                      const isNewDate = index === 0 || previous?.date !== tx.date
                      const isEditingAccount = editingCell?.txId === tx.id && editingCell.field === 'account'
                      const isEditingContact = editingCell?.txId === tx.id && editingCell.field === 'contact'
                      const isEditingMemo = editingCell?.txId === tx.id && editingCell.field === 'memo'
                      const linkedJe = getLinkedJournalEntry(tx)

                      return (
                        <Fragment key={tx.id}>
                          {isNewDate && (
                            <tr className="bg-gray-50">
                              <td colSpan={11} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {formatLongDate(tx.date)}
                              </td>
                            </tr>
                          )}
                          <tr
                            onDoubleClick={() => setDetailTxId(tx.id)}
                            className={`transition-colors hover:bg-slate-50/80 ${tx.reconciled ? 'border-l-4 border-green-400 bg-green-50/30' : ''}`}
                            title="Double-click for details"
                          >
                            <td className="px-3 py-3 align-top" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(tx.id)}
                                onChange={() => toggleSelected(tx.id)}
                                aria-label={`Select ${tx.description}`}
                              />
                            </td>
                            <td className="px-4 py-3 align-top font-mono text-sm text-slate-600">{formatShortDate(tx.date)}</td>
                            <td className="px-4 py-3 align-top" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
                              {tx.transactionType === 'Bank Transfer' ? (
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                                  <ArrowLeftRight className="h-3.5 w-3.5" />
                                  TRANSFER
                                </span>
                              ) : tx.status === 'MATCHED' && (tx.bankRef ?? tx.journalEntryId) ? (
                                <button
                                  onClick={() => openRecord(tx.bankRef ?? tx.journalEntryId, tx.id, linkedJe?.type)}
                                  className="cursor-pointer text-sm font-medium text-blue-600 underline hover:text-blue-800"
                                >
                                  {getJournalEntryReference(linkedJe, tx.bankRef ?? tx.journalEntryId)}
                                </button>
                              ) : tx.journalEntryId ? (
                                <span className="font-mono text-xs text-slate-500">
                                  {getJournalEntryReference(linkedJe, tx.journalEntryId)}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
                              {isEditingContact ? (
                                <select
                                  autoFocus
                                  aria-label={`Edit payee for ${tx.description}`}
                                  value={editingValue}
                                  onChange={event => setEditingValue(event.target.value)}
                                  onBlur={() => saveEdit(tx)}
                                  className="w-full rounded-md border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none"
                                >
                                  <option value="">No payee</option>
                                  {MOCK_ENTITIES.map(entity => (
                                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  onClick={() => beginEdit(tx, 'contact')}
                                  className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                                >
                                  {tx.contactName ?? <span className="text-slate-300">Select payee</span>}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium text-slate-800">{tx.description}</div>
                              <div className="mt-2" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
                                {isEditingMemo ? (
                                  <input
                                    autoFocus
                                    aria-label={`Edit memo for ${tx.description}`}
                                    value={editingValue}
                                    onChange={event => setEditingValue(event.target.value)}
                                    onBlur={() => saveEdit(tx)}
                                    onKeyDown={event => {
                                      if (event.key === 'Enter') saveEdit(tx)
                                    }}
                                    className="w-full rounded-md border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none"
                                  />
                                ) : (
                                  <button
                                    onClick={() => beginEdit(tx, 'memo')}
                                    className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                  >
                                    {tx.memo || <span className="text-slate-300">Add memo</span>}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
                              {isEditingAccount ? (
                                <select
                                  autoFocus
                                  aria-label={`Edit account for ${tx.description}`}
                                  value={editingValue}
                                  onChange={event => setEditingValue(event.target.value)}
                                  onBlur={() => saveEdit(tx)}
                                  className="w-full rounded-md border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none"
                                >
                                  <option value="">Select account</option>
                                  {MOCK_COA_ACCOUNTS.map(account => (
                                    <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  onClick={() => beginEdit(tx, 'account')}
                                  className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                                >
                                  {tx.accountName ?? <span className="text-slate-300">Select account</span>}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm align-top">
                              {tx.amount < 0 ? <span className="font-semibold text-rose-600">{formatMoney(Math.abs(tx.amount))}</span> : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm align-top">
                              {tx.amount > 0 ? <span className="font-semibold text-emerald-700">{formatMoney(tx.amount)}</span> : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <StatusBadge tx={tx} />
                            </td>
                            <td className="px-4 py-3 align-top">
                              <button
                                onClick={event => {
                                  event.stopPropagation()
                                  toggleSingleReconciliation(tx)
                                }}
                                className={`block rounded-md px-2 py-1 text-xs font-medium ${tx.reconciled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              >
                                {tx.reconciled ? 'Reconciled' : 'Mark Reconciled'}
                              </button>
                            </td>
                            <td className="border-l-2 border-slate-300 px-4 py-3 text-right font-mono text-sm align-top">
                              <span className={tx.runningBalance < 0 ? 'font-bold text-red-600' : 'text-slate-800'}>
                                {formatMoney(tx.runningBalance)}
                              </span>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:hidden">
          <button
            onClick={() => setReconcileOpen(current => !current)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Bank Reconciliation</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${reconcileOpen ? 'rotate-180' : ''}`} />
          </button>
          {reconcileOpen && (
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">
              <div className="max-w-sm">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Statement Balance</label>
                <input
                  type="number"
                  aria-label="Statement balance"
                  value={statementBalance}
                  onChange={event => setStatementBalance(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div className="mt-4 max-w-md space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Calculated Balance</span><span className="font-mono text-slate-800">{formatMoney(closingBalance)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Less: Outstanding Withdrawals</span><span className="font-mono text-rose-600">-{formatMoney(outstandingWithdrawals)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Add: Outstanding Deposits</span><span className="font-mono text-emerald-700">+{formatMoney(outstandingDeposits)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold"><span className="text-slate-700">Adjusted Book Balance</span><span className="font-mono text-slate-900">{formatMoney(adjustedBookBalance)}</span></div>
                <div className={`flex justify-between border-t-2 border-slate-300 pt-2 font-bold ${statementBalance && reconciliationDifference === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  <span>Difference</span>
                  <span className="font-mono">{formatMoney(Math.abs(reconciliationDifference))}</span>
                </div>
              </div>

              {statementBalance && (
                <div className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${reconciliationDifference === 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
                  {reconciliationDifference === 0 ? 'RECONCILED' : 'NOT BALANCED'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedEntries.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 print:hidden">
          <div className="flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl">
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedEntries.length} transactions selected</p>
              <p className="text-xs text-slate-500">{formatMoney(selectedTotal)} total</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={reconcileSelected} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                {selectedEntries.every(tx => tx.reconciled) ? 'Unreconcile Selected' : 'Reconcile Selected'}
              </button>
              <button onClick={openBatchEdit} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Edit Account
              </button>
              <button onClick={deleteSelected} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button onClick={exportSelected} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                CSV
              </button>
            </div>
          </div>
        </div>
      )}
      {detailTx && (
        <div className="fixed inset-0 z-40 bg-black/25 p-4" onClick={() => setDetailTxId(null)}>
          <div
            className="mx-auto mt-12 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">{detailTx.description}</h2>
                <p className="mt-1 text-xs text-slate-500">{formatLongDate(detailTx.date)}</p>
              </div>
              <button aria-label="Close transaction detail" title="Close transaction detail" onClick={() => setDetailTxId(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
                <span className="text-slate-500">Payee</span>
                <span className="text-slate-800">{detailTx.contactName ?? 'No payee'}</span>
                <span className="text-slate-500">Category</span>
                <span className="text-slate-800">{detailTx.accountName ?? 'Unassigned'}</span>
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-xs text-slate-700">{getReferenceDisplayText(detailTx)}</span>
                <span className="text-slate-500">Amount</span>
                <span className={detailTx.amount < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-700'}>
                  {detailTx.amount < 0 ? '-' : '+'}{formatMoney(Math.abs(detailTx.amount))}
                </span>
                <span className="text-slate-500">Status</span>
                <span><StatusBadge tx={detailTx} /></span>
                <span className="text-slate-500">JE Reference</span>
                <span className="font-mono text-xs text-slate-700">{getJournalEntryReference(detailJournalEntry, detailTx.journalEntryId)}</span>
                <span className="text-slate-500">Memo</span>
                <span className="text-slate-800">{detailTx.memo ?? 'No memo'}</span>
              </div>

              {detailTx.status === 'MATCHED' && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Match Details</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span>
                      Matched to <span className="font-medium text-blue-600">{getJournalEntryReference(detailMatchedRecord, detailTx.bankRef ?? detailTx.journalEntryId)}</span>
                    </span>
                  </div>
                  {detailMatchedRecord && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <div>Source: {detailMatchedRecord.type === 'Bill' || detailMatchedRecord.type === 'Invoice' ? detailMatchedRecord.type : 'Journal Entry'}</div>
                      <div>Record: {detailMatchedRecord.contactName ? `${detailMatchedRecord.contactName} — ${detailMatchedRecord.description}` : detailMatchedRecord.description}</div>
                      <div>Memo: {getJournalEntryMemo(detailMatchedRecord)}</div>
                      <div>Amount: {formatMoney(detailMatchedRecord.totalAmount)}</div>
                    </div>
                  )}
                </div>
              )}

              {detailTx.transactionType === 'Split Transaction' && detailTx.splitLines?.length ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Split Details</div>
                  <div className="mt-2 text-sm text-slate-700">Split into {detailTx.splitLines.length} lines:</div>
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {detailTx.splitLines.map((line, lineIndex) => (
                      <div key={`${detailTx.id}-split-${lineIndex}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2">
                        <span>Line {lineIndex + 1}: {line.accountName}</span>
                        <span className="font-mono text-slate-700">{formatMoney(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {detailTx.transactionType === 'Bank Transfer' && detailTransferParties ? (
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Details</div>
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div>From: {detailTransferParties.from}</div>
                    <div>To: {detailTransferParties.to}</div>
                    <div>Amount: {formatMoney(Math.abs(detailTx.amount))}</div>
                  </div>
                </div>
              ) : null}

              {detailJournalEntry ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Journal Entry</div>
                  <div className="mt-2 font-mono text-sm font-semibold text-slate-900">
                    {getJournalEntryReference(detailJournalEntry, detailTx.journalEntryId)}
                  </div>
                  <div className="mt-3 space-y-2">
                    {detailJournalEntry.lines.map((line, lineIndex) => {
                      const side = line.debit > 0 ? 'DR' : 'CR'
                      const value = line.debit > 0 ? line.debit : line.credit

                      return (
                        <div key={`${detailJournalEntry.id}-line-${lineIndex}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <div className="flex items-start justify-between gap-3 text-sm">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{side}</div>
                              <div className="font-medium text-slate-800">{line.accountName}</div>
                              {line.memo ? <div className="mt-0.5 text-xs text-slate-500">{line.memo}</div> : null}
                            </div>
                            <div className="font-mono text-sm text-slate-700">{formatMoney(value)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-400">
                  No journal entry details available for this transaction.
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Activity</p>
                  <select
                    aria-label="Filter transaction detail activity"
                    value={detailFilter}
                    onChange={event => setDetailFilter(event.target.value as ActivityFilter)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                  >
                    <option value="all">All</option>
                    <option value="edits">Edits</option>
                    <option value="reconciliations">Reconciliations</option>
                    <option value="categorizations">Categorizations</option>
                  </select>
                </div>

                {detailHistory.length === 0 ? (
                  <p className="text-sm text-slate-400">No activity for {getAuditFilterLabel(detailFilter).toLowerCase()}.</p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {detailHistory.map(entry => (
                      <div key={entry.id} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getAuditDot(entry.action)}`} />
                        <div>
                          <p className="text-slate-700">{entry.details}</p>
                          <p className="text-xs text-slate-400">{entry.userName} - {new Date(entry.timestamp).toLocaleString('en-PH')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-6 py-4">
              {detailTx.status === 'MATCHED' ? (
                <button
                  onClick={() => openRecord(detailTx.bankRef ?? detailTx.journalEntryId, detailTx.id, detailMatchedRecord?.type)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {getOpenRecordLabel(detailMatchedRecord)}
                </button>
              ) : null}
              <button
                onClick={() => openRecord(detailTx.journalEntryId, detailTx.id, detailJournalEntry?.type)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {detailTx.status === 'MATCHED' ? 'View JE →' : 'View Journal Entry →'}
              </button>
              <button
                onClick={undoFromDetail}
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                {getUndoActionLabel(detailTx)}
              </button>
              <button
                onClick={() => setDetailTxId(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-40 bg-black/25 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="mx-auto mt-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Add Manual Transaction</h2>
                <p className="text-xs text-slate-500">Manual entries stay in the Bank Register and require an account selection.</p>
              </div>
              <button aria-label="Close add transaction dialog" title="Close add transaction dialog" onClick={() => setShowAddModal(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                <span>Date</span>
                <input
                  type="date"
                  aria-label="Manual entry date"
                  value={addForm.date}
                  onChange={event => setAddForm(current => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-600">
                <span>Reference</span>
                <input
                  aria-label="Manual entry reference"
                  value={addForm.reference}
                  onChange={event => setAddForm(current => ({ ...current, reference: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                <span>Description</span>
                <input
                  aria-label="Manual entry description"
                  value={addForm.description}
                  onChange={event => setAddForm(current => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-600">
                <span>Type</span>
                <select
                  aria-label="Manual entry type"
                  value={addForm.type}
                  onChange={event => setAddForm(current => ({ ...current, type: event.target.value as AddEntryForm['type'] }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="Debit">Withdrawal</option>
                  <option value="Credit">Deposit</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-600">
                <span>Amount</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  aria-label="Manual entry amount"
                  value={addForm.amount}
                  onChange={event => setAddForm(current => ({ ...current, amount: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-600">
                <span>Account / Category *</span>
                <select
                  aria-label="Manual entry account"
                  value={addForm.accountId}
                  onChange={event => setAddForm(current => ({ ...current, accountId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Select account</option>
                  {MOCK_COA_ACCOUNTS.map(account => (
                    <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-600">
                <span>Payee / Name</span>
                <select
                  aria-label="Manual entry payee"
                  value={addForm.contactId}
                  onChange={event => setAddForm(current => ({ ...current, contactId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">No payee</option>
                  {MOCK_ENTITIES.map(entity => (
                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                <span>Memo</span>
                <input
                  aria-label="Manual entry memo"
                  value={addForm.memo}
                  onChange={event => setAddForm(current => ({ ...current, memo: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </label>

              {addError && <p className="md:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{addError}</p>}
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={submitAddTransaction} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {batchEditOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 p-4" onClick={() => setBatchEditOpen(false)}>
          <div
            className="mx-auto mt-24 w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Batch Edit Account</h2>
              <p className="text-xs text-slate-500">Apply one account to {selectedEntries.length} selected transactions.</p>
            </div>
            <div className="space-y-3 px-6 py-5">
              <label className="space-y-1 text-sm text-slate-600">
                <span>Set Account to</span>
                <select
                  aria-label="Batch account selection"
                  value={batchAccountId}
                  onChange={event => setBatchAccountId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Select account</option>
                  {MOCK_COA_ACCOUNTS.map(account => (
                    <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setBatchEditOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={applyBatchAccountEdit} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg print:hidden">
          {toast}
        </div>
      )}
    </div>
  )
}