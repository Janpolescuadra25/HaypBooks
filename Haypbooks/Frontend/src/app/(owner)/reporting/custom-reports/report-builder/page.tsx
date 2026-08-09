'use client'

import React, { useMemo, useState } from 'react'

interface ColumnConfig {
  id: string
  fieldName: string
  type: 'Text' | 'Number' | 'Date' | 'Currency'
  sortable: boolean
  visible: boolean
}

interface FilterConfig {
  id: string
  fieldName: string
  operator: 'Equals' | 'Not Equals' | 'Contains' | 'Greater Than' | 'Less Than'
  value: string
}

interface PreviewRow {
  [key: string]: string | number
}

const defaultColumns: ColumnConfig[] = [
  { id: 'col-1', fieldName: 'Description', type: 'Text', sortable: true, visible: true },
  { id: 'col-2', fieldName: 'Amount', type: 'Currency', sortable: true, visible: true },
]

const defaultFilters: FilterConfig[] = [
  { id: 'filter-1', fieldName: 'Status', operator: 'Equals', value: 'Open' },
]

const buildMockPreview = (columns: ColumnConfig[]): PreviewRow[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const row: PreviewRow = {}
    columns.forEach((column) => {
      if (!column.visible) return
      switch (column.type) {
        case 'Number':
          row[column.fieldName] = 1000 + index * 50
          break
        case 'Currency':
          row[column.fieldName] = 2350 + index * 120
          break
        case 'Date':
          row[column.fieldName] = `2026-0${(index % 9) + 1}-15`
          break
        default:
          row[column.fieldName] = `${column.fieldName} ${index + 1}`
      }
    })
    return row
  })
}

export default function Page() {
  const [reportName, setReportName] = useState('Monthly Sales Overview')
  const [dataSource, setDataSource] = useState('Journal Entries')
  const [startDate, setStartDate] = useState('2026-03-01')
  const [endDate, setEndDate] = useState('2026-08-31')
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [filters, setFilters] = useState<FilterConfig[]>(defaultFilters)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [previewGenerated, setPreviewGenerated] = useState(false)

  const visibleColumns = useMemo(() => columns.filter((column) => column.visible), [columns])

  const handleAddColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        id: `col-${prev.length + 1}`,
        fieldName: '',
        type: 'Text',
        sortable: false,
        visible: true,
      },
    ])
  }

  const handleRemoveColumn = (id: string) => {
    setColumns((prev) => prev.filter((column) => column.id !== id))
  }

  const handleUpdateColumn = (id: string, updates: Partial<ColumnConfig>) => {
    setColumns((prev) => prev.map((column) => column.id === id ? { ...column, ...updates } : column))
  }

  const handleAddFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id: `filter-${prev.length + 1}`, fieldName: '', operator: 'Equals', value: '' },
    ])
  }

  const handleRemoveFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id))
  }

  const handleUpdateFilter = (id: string, updates: Partial<FilterConfig>) => {
    setFilters((prev) => prev.map((filter) => filter.id === id ? { ...filter, ...updates } : filter))
  }

  const handleGeneratePreview = () => {
    setPreviewData(buildMockPreview(visibleColumns))
    setPreviewGenerated(true)
  }

  const handleDownloadCsv = () => {
    const header = visibleColumns.map((column) => column.fieldName)
    const rows = previewData.map((row) =>
      visibleColumns.map((column) => String(row[column.fieldName] ?? ''))
    )
    const csv = [header, ...rows].map((cols) => cols.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName.replace(/\s+/g, '_').toLowerCase()}_preview.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
        <p className="text-sm text-gray-600 mt-1">Create a customizable report definition and preview the output.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Report Name</label>
              <input
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Data Source</label>
              <select
                value={dataSource}
                onChange={(event) => setDataSource(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {['Journal Entries', 'Chart of Accounts', 'Trial Balance', 'Balance Sheet', 'Income Statement', 'Cash Flow'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Columns</h2>
                  <p className="text-xs text-slate-500">Add fields to include in the report preview.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Add Column
                </button>
              </div>
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.id} className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.8fr_0.8fr]">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Field Name</label>
                        <input
                          value={column.fieldName}
                          onChange={(event) => handleUpdateColumn(column.id, { fieldName: event.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
                        <select
                          value={column.type}
                          onChange={(event) => handleUpdateColumn(column.id, { type: event.target.value as ColumnConfig['type'] })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                        >
                          {['Text', 'Number', 'Date', 'Currency'].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={column.sortable}
                            onChange={(event) => handleUpdateColumn(column.id, { sortable: event.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900"
                          />
                          Sortable
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={(event) => handleUpdateColumn(column.id, { visible: event.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900"
                          />
                          Visible
                        </label>
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(column.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                  <p className="text-xs text-slate-500">Apply data filters to refine the report.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFilter}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Add Filter
                </button>
              </div>
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr]">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Field Name</label>
                        <input
                          value={filter.fieldName}
                          onChange={(event) => handleUpdateFilter(filter.id, { fieldName: event.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operator</label>
                        <select
                          value={filter.operator}
                          onChange={(event) => handleUpdateFilter(filter.id, { operator: event.target.value as FilterConfig['operator'] })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                        >
                          {['Equals', 'Not Equals', 'Contains', 'Greater Than', 'Less Than'].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Value</label>
                        <input
                          value={filter.value}
                          onChange={(event) => handleUpdateFilter(filter.id, { value: event.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(filter.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Generate Preview
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
              <p className="text-sm text-slate-500">See a mock rendering of the report based on your configuration.</p>
            </div>
            {previewGenerated && previewData.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Download CSV
              </button>
            )}
          </div>

          {!previewGenerated ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              Configure your report and click Generate Preview.
            </div>
          ) : previewData.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No preview data is available for the selected configuration.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    {visibleColumns.map((column) => (
                      <th key={column.id} className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                        {column.fieldName || 'Field'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {visibleColumns.map((column) => (
                        <td key={column.id} className="whitespace-nowrap px-4 py-3 text-left text-slate-700">
                          {column.type === 'Currency' ? `$${Number(row[column.fieldName] ?? 0).toLocaleString()}` : String(row[column.fieldName] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    {visibleColumns.map((column) => (
                      <td key={column.id} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-900">
                        {column.type === 'Number' || column.type === 'Currency' ? 'Total' : ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
