'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import {
  MOCK_BANK_ACCOUNTS,
  applyRules,
  importTransactions,
  mockStore,
  normalizeImportedDate,
  parseImportedAmount,
  type ImportDateFormat,
  type ImportTransactionRow,
} from './mockGLState'

export const BANK_TRANSACTIONS_IMPORT_EVENT = 'hb-bank-transactions-import'

export interface BankTransactionsImportEventDetail {
  bankAccountId: string
  toastMessage?: string
}

export interface ImportWizardModalProps {
  open: boolean
  onClose: () => void
  onImportComplete: (count: number) => void
}

type WizardStep = 0 | 1 | 2 | 3 | 4
type AmountMode = 'one' | 'two'
type ColumnField = 'date' | 'description' | 'amount' | 'debit' | 'credit' | 'reference' | 'payee' | 'skip'

interface PreviewRow {
  rowIndex: number
  dateRaw: string
  date: string | null
  description: string
  amount: number | null
  reference?: string
  payeeName?: string
  original: string[]
  valid: boolean
}

interface ImportSummary {
  imported: number
  duplicates: number
  fileName: string
  bankAccountId: string
  bankAccountName: string
}

const STEP_LABELS = ['Upload', 'Account', 'Map Columns', 'Preview', 'Import'] as const

const DATE_FORMATS: ImportDateFormat[] = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseDelimitedText(text: string): string[][] {
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
}

function autoDetectColumnMapping(rows: string[][], hasHeader: boolean, amountMode: AmountMode): Record<number, ColumnField> {
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const header = hasHeader ? rows[0] ?? [] : []
  const mapping: Record<number, ColumnField> = {}

  for (let index = 0; index < columnCount; index += 1) {
    const label = (header[index] ?? '').toLowerCase()
    if (label.includes('date')) {
      mapping[index] = 'date'
      continue
    }
    if (label.includes('description') || label.includes('details') || label.includes('memo') || label.includes('narration')) {
      mapping[index] = 'description'
      continue
    }
    if (amountMode === 'two' && (label.includes('debit') || label.includes('withdrawal'))) {
      mapping[index] = 'debit'
      continue
    }
    if (amountMode === 'two' && (label.includes('credit') || label.includes('deposit'))) {
      mapping[index] = 'credit'
      continue
    }
    if (label.includes('amount')) {
      mapping[index] = 'amount'
      continue
    }
    if (label.includes('reference') || label.includes('ref') || label.includes('check')) {
      mapping[index] = 'reference'
      continue
    }
    if (label.includes('payee') || label === 'name' || label.includes('contact')) {
      mapping[index] = 'payee'
      continue
    }
    mapping[index] = 'skip'
  }

  if (columnCount > 0 && !Object.values(mapping).includes('date')) mapping[0] = 'date'
  if (columnCount > 1 && !Object.values(mapping).includes('description')) mapping[1] = 'description'

  if (amountMode === 'two') {
    if (columnCount > 2 && !Object.values(mapping).includes('debit')) mapping[2] = 'debit'
    if (columnCount > 3 && !Object.values(mapping).includes('credit')) mapping[3] = 'credit'
  } else if (columnCount > 2 && !Object.values(mapping).includes('amount')) {
    mapping[2] = 'amount'
  }

  if (columnCount > 3 && !Object.values(mapping).includes('reference')) mapping[3] = 'reference'

  return mapping
}

function dispatchImportEvent(detail: BankTransactionsImportEventDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<BankTransactionsImportEventDetail>(BANK_TRANSACTIONS_IMPORT_EVENT, { detail }))
}

export default function ImportWizardModal({ open, onClose, onImportComplete }: ImportWizardModalProps) {
  const { currency } = useCompanyCurrency()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formatMoney = (value: number) => formatCurrency(value, currency)

  const [step, setStep] = useState<WizardStep>(0)
  const [dragActive, setDragActive] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<string[][]>([])
  const [uploadNote, setUploadNote] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('')
  const [hasHeader, setHasHeader] = useState(true)
  const [dateFormat, setDateFormat] = useState<ImportDateFormat>('MM/DD/YYYY')
  const [amountMode, setAmountMode] = useState<AmountMode>('one')
  const [columnMapping, setColumnMapping] = useState<Record<number, ColumnField>>({})
  const [manualExcludedRows, setManualExcludedRows] = useState<Set<number>>(new Set())
  const [previewSearch, setPreviewSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const [amountMultiplier, setAmountMultiplier] = useState(1)
  const [excludeDuplicates, setExcludeDuplicates] = useState(true)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)

  const resetWizard = () => {
    setStep(0)
    setDragActive(false)
    setIsImporting(false)
    setSelectedFile(null)
    setParsedRows([])
    setUploadNote('')
    setUploadError('')
    setSelectedBankAccountId('')
    setHasHeader(true)
    setDateFormat('MM/DD/YYYY')
    setAmountMode('one')
    setColumnMapping({})
    setManualExcludedRows(new Set())
    setPreviewSearch('')
    setVisibleCount(20)
    setAmountMultiplier(1)
    setExcludeDuplicates(true)
    setImportSummary(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (open) resetWizard()
  }, [open])

  useEffect(() => {
    if (parsedRows.length === 0) return
    setColumnMapping(autoDetectColumnMapping(parsedRows, hasHeader, amountMode))
  }, [amountMode, hasHeader, parsedRows])

  const dataRows = useMemo(() => (hasHeader ? parsedRows.slice(1) : parsedRows), [hasHeader, parsedRows])

  const columnCount = useMemo(() => parsedRows.reduce((max, row) => Math.max(max, row.length), 0), [parsedRows])

  const mappingOptions = useMemo(
    () => amountMode === 'two'
      ? [
          { value: 'date', label: 'Date' },
          { value: 'description', label: 'Description' },
          { value: 'debit', label: 'Debit / Withdrawal' },
          { value: 'credit', label: 'Credit / Deposit' },
          { value: 'reference', label: 'Reference / Check#' },
          { value: 'payee', label: 'Payee / Name' },
          { value: 'skip', label: '(Skip)' },
        ]
      : [
          { value: 'date', label: 'Date' },
          { value: 'description', label: 'Description' },
          { value: 'amount', label: 'Amount' },
          { value: 'reference', label: 'Reference / Check#' },
          { value: 'payee', label: 'Payee / Name' },
          { value: 'skip', label: '(Skip)' },
        ],
    [amountMode],
  )

  const mappedPreviewRows = useMemo<PreviewRow[]>(() => {
    const fieldIndex = (field: ColumnField) => {
      const match = Object.entries(columnMapping).find(([, mappedField]) => mappedField === field)
      return match ? Number(match[0]) : -1
    }

    const dateIndex = fieldIndex('date')
    const descriptionIndex = fieldIndex('description')
    const amountIndex = fieldIndex('amount')
    const debitIndex = fieldIndex('debit')
    const creditIndex = fieldIndex('credit')
    const referenceIndex = fieldIndex('reference')
    const payeeIndex = fieldIndex('payee')

    return dataRows.map((row, rowIndex) => {
      const dateRaw = dateIndex >= 0 ? row[dateIndex] ?? '' : ''
      const description = descriptionIndex >= 0 ? row[descriptionIndex] ?? '' : ''
      const payeeName = payeeIndex >= 0 ? row[payeeIndex] ?? '' : ''
      const reference = referenceIndex >= 0 ? row[referenceIndex] ?? '' : ''
      const normalizedDate = normalizeImportedDate(dateRaw, dateFormat)

      let amount: number | null = null
      if (amountMode === 'two') {
        const debit = Math.abs(parseImportedAmount(debitIndex >= 0 ? row[debitIndex] ?? '' : '') ?? 0)
        const credit = Math.abs(parseImportedAmount(creditIndex >= 0 ? row[creditIndex] ?? '' : '') ?? 0)
        if (debit > 0 || credit > 0) {
          amount = Math.round((credit - debit) * amountMultiplier * 100) / 100
        }
      } else {
        const parsedAmount = parseImportedAmount(amountIndex >= 0 ? row[amountIndex] ?? '' : '')
        amount = parsedAmount === null ? null : Math.round(parsedAmount * amountMultiplier * 100) / 100
      }

      const trimmedDescription = description.trim() || payeeName.trim()

      return {
        rowIndex,
        dateRaw,
        date: normalizedDate,
        description: trimmedDescription,
        amount,
        reference: reference.trim() || undefined,
        payeeName: payeeName.trim() || undefined,
        original: row,
        valid: Boolean(normalizedDate && trimmedDescription && amount !== null),
      }
    })
  }, [amountMode, amountMultiplier, columnMapping, dataRows, dateFormat])

  const duplicateIndices = useMemo(() => {
    const existing = new Set(
      mockStore.items
        .filter(item => (item.bankAccountId ?? item.accountId) === selectedBankAccountId)
        .map(item => `${item.date}|${item.amount.toFixed(2)}`),
    )

    return new Set(
      mappedPreviewRows
        .filter(row => row.valid && row.date && row.amount !== null && existing.has(`${row.date}|${row.amount.toFixed(2)}`))
        .map(row => row.rowIndex),
    )
  }, [mappedPreviewRows, selectedBankAccountId])

  const filteredPreviewRows = useMemo(() => {
    const query = previewSearch.trim().toLowerCase()
    if (!query) return mappedPreviewRows
    return mappedPreviewRows.filter(row =>
      row.description.toLowerCase().includes(query) ||
      (row.reference ?? '').toLowerCase().includes(query) ||
      (row.payeeName ?? '').toLowerCase().includes(query),
    )
  }, [mappedPreviewRows, previewSearch])

  const visiblePreviewRows = useMemo(() => filteredPreviewRows.slice(0, visibleCount), [filteredPreviewRows, visibleCount])

  const validRowCount = useMemo(() => mappedPreviewRows.filter(row => row.valid).length, [mappedPreviewRows])

  const duplicateCount = useMemo(
    () => (excludeDuplicates ? Array.from(duplicateIndices).filter(index => mappedPreviewRows.some(row => row.rowIndex === index && row.valid)).length : 0),
    [duplicateIndices, excludeDuplicates, mappedPreviewRows],
  )

  const selectedCount = useMemo(
    () => mappedPreviewRows.filter(row => row.valid && !manualExcludedRows.has(row.rowIndex) && !(excludeDuplicates && duplicateIndices.has(row.rowIndex))).length,
    [duplicateIndices, excludeDuplicates, manualExcludedRows, mappedPreviewRows],
  )

  const mappingIsValid = useMemo(() => {
    const mappedFields = Object.values(columnMapping)
    if (!mappedFields.includes('date') || !mappedFields.includes('description')) return false
    return amountMode === 'two'
      ? mappedFields.includes('debit') || mappedFields.includes('credit')
      : mappedFields.includes('amount')
  }, [amountMode, columnMapping])

  const canAdvance = step === 0
    ? Boolean(selectedFile && parsedRows.length > 0)
    : step === 1
      ? Boolean(selectedBankAccountId)
      : step === 2
        ? mappingIsValid && validRowCount > 0
        : false

  const handleModalClose = () => {
    if (step === 4 || isImporting) return
    onClose()
    resetWizard()
  }

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    setUploadError('')
    setUploadNote('')
    setSelectedFile(file)
    setManualExcludedRows(new Set())
    setPreviewSearch('')
    setVisibleCount(20)
    setAmountMultiplier(1)
    setExcludeDuplicates(true)

    try {
      const text = await file.text()
      const rows = parseDelimitedText(text)
      setParsedRows(rows)

      const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (extension !== 'csv' && extension !== 'txt') {
        setUploadNote('This format will be processed. Preview may be limited.')
      } else {
        setUploadNote('uploaded successfully')
      }
    } catch {
      setSelectedFile(null)
      setParsedRows([])
      setUploadError('Unable to read the selected file.')
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    await handleFileSelect(event.dataTransfer.files[0] ?? null)
  }

  const handleToggleRow = (rowIndex: number) => {
    setManualExcludedRows(current => {
      const next = new Set(current)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      return next
    })
  }

  const handleSelectAllVisible = () => {
    setManualExcludedRows(current => {
      const next = new Set(current)
      visiblePreviewRows.forEach(row => next.delete(row.rowIndex))
      return next
    })
  }

  const handleDeselectAllVisible = () => {
    setManualExcludedRows(current => {
      const next = new Set(current)
      visiblePreviewRows.forEach(row => {
        if (row.valid) next.add(row.rowIndex)
      })
      return next
    })
  }

  const handleImport = () => {
    if (!selectedBankAccountId || !selectedFile || selectedCount === 0) return

    setIsImporting(true)

    const rowsForImport: ImportTransactionRow[] = mappedPreviewRows
      .filter(row => row.valid && !manualExcludedRows.has(row.rowIndex))
      .map(row => ({
        date: row.date ?? row.dateRaw,
        description: row.description,
        amount: row.amount ?? 0,
        reference: row.reference,
        payeeName: row.payeeName,
      }))

    const result = importTransactions(selectedBankAccountId, rowsForImport, {
      dateFormat,
      fileName: selectedFile.name,
      skipDuplicates: excludeDuplicates,
    })

    const bankAccountName = MOCK_BANK_ACCOUNTS.find(account => account.id === selectedBankAccountId)?.name ?? 'Selected Account'
    setImportSummary({
      imported: result.imported,
      duplicates: result.duplicates,
      fileName: selectedFile.name,
      bankAccountId: selectedBankAccountId,
      bankAccountName,
    })
    onImportComplete(result.imported)
    dispatchImportEvent({ bankAccountId: selectedBankAccountId })
    setIsImporting(false)
    setStep(4)
  }

  const finalizeAndClose = (toastMessage?: string) => {
    if (!importSummary) return
    dispatchImportEvent({ bankAccountId: importSummary.bankAccountId, toastMessage })
    onClose()
    resetWizard()
  }

  const handleApplyRules = () => {
    const updated = applyRules(mockStore.items)
    let count = 0
    updated.forEach(nextTx => {
      mockStore.items = mockStore.items.map(item => item.id === nextTx.id ? nextTx : item)
      count += 1
    })

    finalizeAndClose(`Rules applied — ${count} transaction${count === 1 ? '' : 's'} auto-categorized`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">Import Transactions</h2>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {STEP_LABELS.map((label, index) => {
                    const isActive = index === step
                    const isComplete = index < step
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${isComplete ? 'border-emerald-600 bg-emerald-600 text-white' : isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400'}`}>
                          {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span className={isActive ? 'text-slate-700' : undefined}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {step < 4 ? (
                <button aria-label="Close import wizard" title="Close import wizard" onClick={handleModalClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="px-6 py-6">
            {step === 0 ? (
              <div className="space-y-6">
                <div
                  onDragOver={event => {
                    event.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${dragActive ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <FileUp className="h-7 w-7 text-emerald-600" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-900">Drop your file here</p>
                  <p className="mt-1 text-sm text-slate-500">or click to browse</p>
                  <p className="mt-4 text-xs uppercase tracking-wide text-slate-400">Supports: CSV, QFX, QBO, OFX, TXT</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.qfx,.qbo,.ofx,.txt"
                    aria-label="Choose bank statement file"
                    title="Choose bank statement file"
                    className="hidden"
                    onChange={event => void handleFileSelect(event.target.files?.[0] ?? null)}
                  />
                </div>

                {selectedFile ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-slate-900">File: {selectedFile.name}</div>
                        <div className="text-slate-500">Size: {formatFileSize(selectedFile.size)}</div>
                      </div>
                      {uploadNote ? <span className="text-emerald-600">[✓] {uploadNote}</span> : null}
                    </div>
                    {uploadError ? <div className="mt-2 text-rose-600">{uploadError}</div> : null}
                    {parsedRows.length > 0 ? <div className="mt-2 text-xs text-slate-500">{parsedRows.length} raw row{parsedRows.length === 1 ? '' : 's'} parsed from the file.</div> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Select the bank account for this import:</p>
                </div>

                <div className="space-y-3">
                  {MOCK_BANK_ACCOUNTS.map(account => {
                    const active = account.id === selectedBankAccountId
                    return (
                      <button
                        key={account.id}
                        onClick={() => setSelectedBankAccountId(account.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors ${active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Building2 className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-slate-900">{account.name}</span>
                          <span className="block text-sm text-slate-500">{account.accountNumber}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border ${active ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}`} />
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => dispatchImportEvent({ bankAccountId: selectedBankAccountId || MOCK_BANK_ACCOUNTS[0].id, toastMessage: 'Coming soon' })}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  + Link New Account
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    <input type="checkbox" checked={hasHeader} onChange={event => setHasHeader(event.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    First row is a header
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date format</span>
                    <select value={dateFormat} onChange={event => setDateFormat(event.target.value as ImportDateFormat)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      {DATE_FORMATS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount columns</span>
                    <select value={amountMode} onChange={event => setAmountMode(event.target.value as AmountMode)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <option value="one">One (signed)</option>
                      <option value="two">Two separate</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">Column mapping</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: columnCount }, (_, index) => (
                      <div key={`column-${index}`} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_220px] md:items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-800">Column {index + 1}</div>
                          <div className="text-xs text-slate-500">{hasHeader ? (parsedRows[0]?.[index] ?? 'No header detected') : 'No header row provided'}</div>
                        </div>
                        <select
                          value={columnMapping[index] ?? 'skip'}
                          onChange={event => setColumnMapping(current => ({ ...current, [index]: event.target.value as ColumnField }))}
                          aria-label={`Column ${index + 1} mapping`}
                          title={`Column ${index + 1} mapping`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          {mappingOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">Preview (first 3 rows)</h3>
                    <span className="text-xs text-amber-600">{dataRows.length} rows detected in file</span>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          {Array.from({ length: columnCount }, (_, index) => (
                            <th key={`preview-head-${index}`} className="px-3 py-2">{mappingOptions.find(option => option.value === (columnMapping[index] ?? 'skip'))?.label ?? '(Skip)'}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataRows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={`preview-row-${rowIndex}`} className="border-t border-slate-100">
                            {Array.from({ length: columnCount }, (_, index) => (
                              <td key={`preview-cell-${rowIndex}-${index}`} className="px-3 py-2 text-slate-600">{row[index] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={previewSearch}
                      onChange={event => { setPreviewSearch(event.target.value); setVisibleCount(20) }}
                      placeholder="Search transactions..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700"
                    />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">{filteredPreviewRows.length} rows</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleSelectAllVisible} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Select All</button>
                  <button onClick={handleDeselectAllVisible} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Deselect All</button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="w-10 px-3 py-2" />
                          <th className="w-36 px-3 py-2">Date</th>
                          <th className="px-3 py-2">Description</th>
                          <th className="w-40 px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiblePreviewRows.map(row => {
                          const duplicate = duplicateIndices.has(row.rowIndex)
                          const checked = row.valid && !manualExcludedRows.has(row.rowIndex) && !(excludeDuplicates && duplicate)

                          return (
                            <tr key={`import-preview-${row.rowIndex}`} className="border-t border-slate-100 align-top">
                              <td className="px-3 py-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!row.valid || (excludeDuplicates && duplicate)}
                                  onChange={() => handleToggleRow(row.rowIndex)}
                                  aria-label={`Include imported row ${row.rowIndex + 1}`}
                                  title={`Include imported row ${row.rowIndex + 1}`}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                              </td>
                              <td className="px-3 py-3 text-slate-600">{row.date ?? row.dateRaw || '—'}</td>
                              <td className="px-3 py-3">
                                <div className="font-medium text-slate-800">{row.description || '—'}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  {row.reference ? <span>{row.reference}</span> : null}
                                  {row.payeeName ? <span>{row.payeeName}</span> : null}
                                  {duplicate ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Duplicate</span> : null}
                                  {!row.valid ? <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">Needs mapping</span> : null}
                                </div>
                              </td>
                              <td className={`px-3 py-3 text-right font-mono ${row.amount !== null && row.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {row.amount === null ? '—' : `${row.amount < 0 ? '-' : '+'}${formatMoney(Math.abs(row.amount))}`}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredPreviewRows.length > visibleCount ? (
                  <button onClick={() => setVisibleCount(current => current + 20)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Show more
                  </button>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm text-slate-600">Income is positive / Expense is negative</p>
                  <button
                    onClick={() => setAmountMultiplier(current => current * -1)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" /> Reverse all amounts
                  </button>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <label className="flex items-start gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={excludeDuplicates}
                        onChange={event => setExcludeDuplicates(event.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        <span className="font-medium">Automatically exclude transactions that match existing entries</span>
                        <span className="mt-1 block text-xs text-slate-500">Duplicate detection uses the same date + same amount on the selected bank account.</span>
                      </span>
                    </label>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Selected: {selectedCount} of {validRowCount} rows {duplicateCount > 0 ? `(${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} excluded)` : ''}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 4 && importSummary ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Import Complete!</h3>
                  <p className="mt-2 text-sm text-slate-600">{importSummary.imported} transaction{importSummary.imported === 1 ? '' : 's'} imported to {importSummary.bankAccountName}</p>
                  <p className="mt-1 text-sm text-slate-500">{importSummary.duplicates} duplicate{importSummary.duplicates === 1 ? '' : 's'} skipped</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left">
                  <div className="font-medium text-slate-900">Next Steps:</div>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li>• Review and categorize your transactions</li>
                    <li>• Apply bank rules to auto-categorize</li>
                    <li>• Match transactions to existing records</li>
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => finalizeAndClose(importSummary.imported > 0 ? `${importSummary.imported} transaction${importSummary.imported === 1 ? '' : 's'} imported to ${importSummary.bankAccountName}` : 'No new transactions were imported')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Go to Bank Transactions
                  </button>
                  <button
                    onClick={handleApplyRules}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Apply Bank Rules
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            {step < 4 ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={step === 0 ? handleModalClose : () => setStep(current => Math.max(0, (current - 1) as WizardStep))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {step === 0 ? 'Cancel' : <><ChevronLeft className="h-4 w-4" /> Back</>}
                </button>

                {step === 3 ? (
                  <button
                    onClick={handleImport}
                    disabled={selectedCount === 0 || isImporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Import
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(current => Math.min(3, (current + 1) as WizardStep))}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => finalizeAndClose(importSummary?.imported ? `${importSummary.imported} transaction${importSummary.imported === 1 ? '' : 's'} imported to ${importSummary.bankAccountName}` : 'No new transactions were imported')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}