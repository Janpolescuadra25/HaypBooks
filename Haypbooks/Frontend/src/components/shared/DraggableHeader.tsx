/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Header, flexRender } from '@tanstack/react-table'
import { GripVertical, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>
  isLastDataColumn?: boolean
  isDefaultSizing?: boolean
}

export function DraggableHeader<TData, TValue>({ header, isLastDataColumn, isDefaultSizing }: DraggableHeaderProps<TData, TValue>) {
  const isNonDraggable = header.id === 'select' || header.id === 'actions'
  const [isMounted, setIsMounted] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
    disabled: isNonDraggable,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const buttonAttributes = useMemo(() => {
    if (isMounted) return attributes
    // Remove generated aria-describedby until after hydration to avoid SSR/client mismatch.
    const { 'aria-describedby': _, ...rest } = attributes as Record<string, any>
    return rest
  }, [attributes, isMounted])

  const isResizable = header.column.getCanResize()
  const sorted = header.column.getIsSorted()
  const isSortable = header.column.getCanSort()
  const isActionColumn = header.column.id === 'actions'
  const isSelectColumn = header.column.id === 'select'
  const columnSize = header.getSize()
  const useFlexGrow = !isActionColumn && !isSelectColumn && isDefaultSizing
  const dragTransform = CSS.Translate.toString(transform)
  const resolvedTransform = dragTransform

  const style: CSSProperties = {
    opacity: isNonDraggable ? 1 : 1,
    transform: resolvedTransform,
    transition,
    width: useFlexGrow ? undefined : columnSize,
    flex: useFlexGrow ? `${columnSize} 1 0` : `0 0 ${columnSize}px`,
    minWidth: header.column.columnDef.minSize || 60,
    maxWidth: header.column.columnDef.maxSize,
    position: isActionColumn ? 'sticky' : undefined,
    right: isActionColumn ? 0 : undefined,
    zIndex: isActionColumn ? 30 : isNonDraggable ? 0 : 1,
    marginLeft: isActionColumn ? 'auto' : undefined,
    overflow: isActionColumn ? 'visible' : undefined,
  }

  const content = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext())

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative box-border flex items-center h-12 border-r border-slate-100 bg-white px-3 text-left align-middle font-bold uppercase tracking-tight text-slate-900 last:border-r-0 select-none transition-colors',
        !isNonDraggable && 'hover:bg-slate-50/80',
        isActionColumn && 'sticky right-0 z-30 !bg-white overflow-visible shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] border-l border-slate-100',
      )}
      role="columnheader"
    >
      {!isNonDraggable && (
        <button
          {...buttonAttributes}
          {...listeners}
          type="button"
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-emerald-600 transition-opacity z-10"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
        className={cn(
          'flex flex-1 items-center gap-1.5 h-full w-full',
          isSortable ? 'cursor-pointer' : 'cursor-default',
          isNonDraggable ? 'justify-center' : 'justify-start',
          !isNonDraggable && 'pl-3',
        )}
      >
        <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wide text-slate-500 group-hover:text-slate-900 transition-colors">
          {content}
        </span>
        {isSortable && (
          <ArrowUpDown className={cn('h-3 w-3 transition-all', sorted ? 'text-emerald-600 scale-110' : 'opacity-0 group-hover:opacity-40')} />
        )}
      </div>

      {isResizable && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            'absolute right-[-2px] top-0 h-full w-1.5 cursor-col-resize hover:bg-emerald-500/20 transition-colors z-20',
            header.column.getIsResizing() ? 'bg-emerald-500/40' : 'bg-transparent',
          )}
        />
      )}
    </div>
  )
}
