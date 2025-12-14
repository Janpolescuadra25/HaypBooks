type Column<T> = {
  key: keyof T
  header: string | React.ReactNode
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  headerClassName?: string
  cellClassName?: string
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  dense?: boolean
  striped?: boolean
  fancyHover?: boolean
  caption?: string
  ariaLabel?: string
  selectableRows?: boolean
  selectedKeys?: string[]
  onToggleRow?: (key: string, selected: boolean) => void
  onToggleAll?: (selected: boolean, keys: string[]) => void
  expandedRowKey?: string | null
  renderExpanded?: (row: T) => React.ReactNode
  onRowClick?: (row: T, e: React.MouseEvent<HTMLTableRowElement>) => void
}

import React from 'react'
import { formatMMDDYYYY } from '@/lib/date'

export function DataTable<T extends Record<string, any>>({ columns, rows, keyField, dense = true, striped = true, fancyHover = false, caption, ariaLabel, selectableRows = false, selectedKeys = [], onToggleRow, onToggleAll, expandedRowKey = null, renderExpanded, onRowClick }: DataTableProps<T>) {
  const cellPad = dense ? 'px-3 py-1.5' : 'px-4 py-2'
  const visibility = (bp?: Column<T>['hideBelow']) => (bp ? `hidden ${bp}:table-cell` : '')

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={`min-w-full ${dense ? 'text-sm' : 'text-base'}`} aria-label={caption ? undefined : ariaLabel}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="text-slate-600">
          <tr>
            {selectableRows && (
              <th scope="col" className={`px-3 py-2 text-left`}>
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={rows.length > 0 && selectedKeys.length === rows.length}
                  onChange={(e) => onToggleAll?.(e.currentTarget.checked, rows.map(r => String(r[keyField])))}
                  className="size-4"
                />
              </th>
            )}
            {columns.map((c) => {
              const alignClass = c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
              return (
                <th key={String(c.key)} scope="col" className={`px-3 py-2 ${alignClass} ${c.hideBelow ? `hidden ${c.hideBelow}:table-cell` : ''} ${c.headerClassName || ''}`}>{c.header}</th>
              )
            })}
          </tr>
        </thead>
        <tbody className={`text-slate-800 ${striped ? '[&>tr:nth-child(even)]:bg-slate-50' : ''}`}>
          {rows.map((row) => (
            <React.Fragment key={String(row[keyField])}>
            <tr
              className={`border-t border-slate-200 ${fancyHover ? 'cursor-pointer transition-all duration-150 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-[1px]' : 'hover:bg-slate-50/50'}`}
              onClick={(e) => onRowClick?.(row, e)}
            >
              {selectableRows && (
                <td className={`${cellPad}`}>
                  <input
                    type="checkbox"
                    data-no-row-toggle
                    className="size-4"
                    aria-label={`Select row ${String(row[keyField])}`}
                    checked={selectedKeys.includes(String(row[keyField]))}
                    onChange={(e) => { e.stopPropagation(); onToggleRow?.(String(row[keyField]), e.currentTarget.checked) }}
                  />
                </td>
              )}
              {columns.map((c) => {
                const val = row[c.key]
                const alignClass = c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                return (
                  <td
                    key={String(c.key)}
                    className={`${cellPad} ${alignClass} ${visibility(c.hideBelow)} ${c.cellClassName || ''}`}
                    onClick={(e)=>{
                      // prevent nested interactive elements from triggering row click
                      const target = e.target as HTMLElement
                      if (target.closest('button,a,input,select,textarea,label,[role="button"],[role="menuitem"],[role="switch"],[data-stop-row-click="true"],[data-no-row-toggle],.no-row-expand')) {
                        e.stopPropagation()
                      }
                    }}
                  >
                    <span className={`${typeof val === 'number' ? 'tabular-nums font-mono' : ''}`}>
                      {c.render
                        ? c.render(val, row)
                        : (typeof c.header === 'string' && c.header.toLowerCase() === 'date' && typeof val === 'string'
                            ? formatMMDDYYYY(val)
                            : String(val ?? ''))}
                    </span>
                  </td>
                )
              })}
            </tr>
            {expandedRowKey && renderExpanded && String(row[keyField]) === String(expandedRowKey) && (
              <tr className="border-t border-slate-200 bg-white">
                <td className={`${cellPad}`} colSpan={columns.length + (selectableRows ? 1 : 0)}>
                  {renderExpanded(row)}
                </td>
              </tr>
            )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
