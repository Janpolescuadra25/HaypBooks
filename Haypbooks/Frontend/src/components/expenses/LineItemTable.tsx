'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'

export interface Column {
  key: string
  label: string
  type: string
  width?: number
  minWidth?: number
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
}

export interface LineItemBase {
  id: string
  [key: string]: any
}

export interface LineItemTableProps<Row extends LineItemBase = LineItemBase> {
  columns: Column[]
  rows: Row[]
  onChange: React.Dispatch<React.SetStateAction<Row[]>> | ((rows: Row[]) => void)
  currency?: string
  calculatedColumns?: Record<string, (row: Row) => number>
  onAccountSelect?: (rowId: string, accountId: string) => void
  onItemSelect?: (rowId: string, itemId: string) => void
  showDragHandle?: boolean
  showCopyButton?: boolean
  showDeleteButton?: boolean
  addRowLabel?: string
}

const defaultMinWidth = 80
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export default function LineItemTable<Row extends LineItemBase = LineItemBase>({
  columns,
  rows,
  onChange,
  currency = 'USD',
  calculatedColumns,
  onAccountSelect,
  onItemSelect,
  showDragHandle = true,
  showCopyButton = true,
  showDeleteButton = true,
  addRowLabel = 'Add Line',
}: LineItemTableProps<Row>) {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    return columns.reduce((acc, column) => {
      acc[column.key] = column.width ?? 120
      return acc
    }, {} as Record<string, number>)
  })

  const getColumnClassName = useCallback((key: string) => {
    return `line-col-${key.replace(/[^a-zA-Z0-9_-]+/g, '-')}`
  }, [])

  const widthsRef = useRef(widths)
  useEffect(() => { widthsRef.current = widths }, [widths])

  const minWidths = useMemo(() => columns.reduce<Record<string, number>>((acc, column) => {
    acc[column.key] = column.minWidth ?? defaultMinWidth
    return acc
  }, {}), [columns])

  const { containerRef, startResize, isOverflowing } = useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: columns.map((column) => column.key),
    saveWidths: setWidths,
    fixedWidth: 146,
    minWidth: minWidths,
    fallbackMinWidth: defaultMinWidth,
  })

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const overIndexRef = useRef<number | null>(null)

  useEffect(() => {
    setWidths((prev) => {
      const next = { ...prev }
      columns.forEach((column) => {
        if (!(column.key in next)) {
          next[column.key] = column.width ?? 120
        }
      })
      return next
    })
  }, [columns])


  const onDragStart = useCallback((id: string, index: number) => (event: React.DragEvent<HTMLTableRowElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
    dragIndexRef.current = index
  }, [])

  const onDragOver = useCallback((id: string, index: number) => (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault()
    if (overId !== id) {
      setOverId(id)
      overIndexRef.current = index
    }
  }, [overId])

  const onDrop = useCallback((event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault()
    if (dragIndexRef.current == null || overIndexRef.current == null) {
      setDraggingId(null)
      setOverId(null)
      return
    }
    const from = dragIndexRef.current
    const to = overIndexRef.current
    if (from === to) {
      setDraggingId(null)
      setOverId(null)
      return
    }

    const nextRows = [...rows]
    const [moved] = nextRows.splice(from, 1)
    nextRows.splice(to, 0, moved)
    onChange(nextRows)
    setDraggingId(null)
    setOverId(null)
    dragIndexRef.current = null
    overIndexRef.current = null
  }, [onChange, rows])

  const onDragEnd = useCallback(() => {
    setDraggingId(null)
    setOverId(null)
    dragIndexRef.current = null
    overIndexRef.current = null
  }, [])

  const updateRow = useCallback((id: string, key: string, rawValue: string | number) => {
    const nextRows = rows.map((row) => {
      if (row.id !== id) return row
      const value = key === 'quantity' || key === 'unitPrice' || key === 'taxRate'
        ? Number(rawValue)
        : String(rawValue)
      const nextRow = { ...row } as Record<string, any>
      nextRow[key] = value
      if (calculatedColumns) {
        Object.entries(calculatedColumns).forEach(([calculatedKey, fn]) => {
          nextRow[calculatedKey] = fn(nextRow as Row)
        })
      }
      return nextRow as Row
    })
    onChange(nextRows)
  }, [calculatedColumns, onChange, rows])

  const createEmptyRow = useCallback(() => {
    return columns.reduce((acc, column) => {
      acc[column.key] = column.type === 'number' || column.type === 'calculated' ? 0 : ''
      return acc
    }, { id: makeId() } as Record<string, any>) as Row
  }, [columns])

  const duplicateRow = useCallback((id: string) => {
    const index = rows.findIndex((row) => row.id === id)
    if (index === -1) return
    const duplicate = { ...rows[index], id: makeId() }
    const nextRows = [...rows]
    nextRows.splice(index + 1, 0, duplicate)
    onChange(nextRows)
  }, [onChange, rows])

  const deleteRow = useCallback((id: string) => {
    onChange(rows.filter((row) => row.id !== id))
  }, [onChange, rows])

  const addRow = useCallback(() => {
    onChange([...rows, createEmptyRow()])
  }, [createEmptyRow, onChange, rows])

  const getValue = useCallback((row: Row, column: Column) => {
    if (column.type === 'calculated' && calculatedColumns?.[column.key] !== undefined) {
      return calculatedColumns[column.key](row)
    }
    return row[column.key]
  }, [calculatedColumns])

  const getAlignmentClass = useCallback((column: Column) => {
    return column.type === 'number' || column.type === 'calculated' ? 'text-right' : 'text-left'
  }, [])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
        <p className="mt-1 text-sm text-slate-500">Add each expense line and the bill will update automatically.</p>
      </div>
      <div ref={containerRef} className={`mt-6 rounded-xl border border-slate-200 ${isOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
        {rows.length === 0 ? (
          <div className="min-w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center text-sm text-slate-500">
            Add line items to get started
          </div>
        ) : (
          <table className="table-fixed w-full text-sm">
            <colgroup>
              <col className="line-col-handle" />
              {columns.map((column) => (
                <col key={column.key} className={getColumnClassName(column.key)} />
              ))}
              <col className="line-col-actions" />
            </colgroup>
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200" />
                {columns.map((column) => (
                  <th key={column.key} className={`relative overflow-hidden px-4 py-3 border-r border-slate-200 ${getAlignmentClass(column)} ${getColumnClassName(column.key)}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{column.label}</span>
                      <div
                        className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-slate-200"
                        onMouseDown={(event) => startResize(event, column.key)}
                      />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isDragging = row.id === draggingId
                return (
                  <tr
                    key={row.id}
                    draggable={showDragHandle}
                    onDragStart={onDragStart(row.id, index)}
                    onDragOver={onDragOver(row.id, index)}
                    onDrop={onDrop}
                    onDragEnd={onDragEnd}
                    className={`${isDragging ? 'opacity-50' : ''} border-t border-slate-200 ${overId === row.id ? 'bg-slate-50' : ''}`}
                  >
                    <td className="w-12 px-2 py-3 border-r border-slate-200 text-center text-slate-500">
                      {showDragHandle ? (
                        <span className="inline-flex h-10 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-all group active:scale-95">
                          <GripVertical size={20} strokeWidth={2.5} className="group-active:text-emerald-600 transition-colors" />
                        </span>
                      ) : null}
                    </td>
                    {columns.map((column) => {
                      const value = getValue(row, column)
                      const alignmentClass = getAlignmentClass(column)
                      return (
                        <td key={column.key} className={`px-4 py-3 border-r border-slate-200 align-top ${alignmentClass} ${getColumnClassName(column.key)}`}>
                          {column.type === 'text' && (
                            <input
                              type="text"
                              value={String(value ?? '')}
                              placeholder={column.placeholder}
                              onChange={(event) => updateRow(row.id, column.key, event.target.value)}
                              className="w-full h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
                            />
                          )}
                          {column.type === 'number' && (
                            <input
                              type="number"
                              value={value === undefined || value === null ? '' : value}
                              placeholder={column.placeholder}
                              onChange={(event) => updateRow(row.id, column.key, event.target.value === '' ? 0 : Number(event.target.value))}
                              className="w-full h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
                            />
                          )}
                          {column.type === 'select' && (
                            <select
                              aria-label={column.label}
                              value={String(value ?? '')}
                              onChange={(event) => {
                                const selected = event.target.value
                                updateRow(row.id, column.key, selected)
                                if (column.key === 'account') {
                                  onAccountSelect?.(row.id, selected)
                                }
                                if (column.key === 'item') {
                                  onItemSelect?.(row.id, selected)
                                }
                              }}
                              className="w-full h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
                            >
                              <option value="">Select</option>
                              {column.options?.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          )}
                          {column.type === 'calculated' && (
                            <div className="flex items-center w-full h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 tabular-nums">
                              {typeof value === 'number' ? formatCurrency(value, currency) : String(value ?? '—')}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {showCopyButton && (
                          <button type="button" title="Duplicate row" aria-label="Duplicate row" onClick={() => duplicateRow(row.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-200">
                            <Copy size={18} />
                          </button>
                        )}
                        {showDeleteButton && (
                          <button type="button" title="Delete row" aria-label="Delete row" onClick={() => deleteRow(row.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50">
          <Plus size={18} /> {addRowLabel}
        </button>
      </div>
      <style jsx>{`
        .line-col-handle { width: 48px; min-width: 48px; max-width: 48px; }
        .line-col-actions { width: 98px; min-width: 98px; max-width: 98px; }
        ${columns.map((column) => `
          .${getColumnClassName(column.key)} {
            width: ${widths[column.key]}px;
            min-width: ${widths[column.key]}px;
            max-width: ${widths[column.key]}px;
          }
        `).join('')}
      `}</style>
    </div>
  )
}
