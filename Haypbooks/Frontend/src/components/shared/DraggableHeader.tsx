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
}

export function DraggableHeader<TData, TValue>({ header }: DraggableHeaderProps<TData, TValue>) {
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

  const style: CSSProperties = {
    opacity: isNonDraggable ? 1 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.getSize(),
    flex: isResizable ? `${header.getSize()} 0 ${header.getSize()}px` : `0 0 ${header.getSize()}px`,
    minWidth: header.column.columnDef.minSize,
    maxWidth: header.column.columnDef.maxSize,
    zIndex: isNonDraggable ? 0 : 1,
  }

  const content = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext())

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center h-11 border-r border-slate-200 bg-slate-50 px-3 text-left align-middle font-bold uppercase tracking-tight text-slate-900 last:border-r-0 select-none',
        !isNonDraggable && 'hover:bg-slate-100',
      )}
      role="columnheader"
    >
      {!isNonDraggable && (
        <button
          {...buttonAttributes}
          {...listeners}
          type="button"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-grab p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-emerald-700 transition-opacity z-10"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
        className={cn(
          'flex flex-1 items-center gap-1 overflow-hidden h-full w-full',
          isSortable ? 'cursor-pointer' : 'cursor-default',
          isNonDraggable ? 'justify-center' : 'justify-start',
          !isNonDraggable && 'pl-4',
        )}
      >
        <span className="truncate text-[10px] font-bold uppercase tracking-tight">
          {content}
        </span>
        {isSortable && (
          <ArrowUpDown className={cn('h-3.5 w-3.5 transition-colors', sorted ? 'text-emerald-600' : 'opacity-0 group-hover:opacity-60')} />
        )}
      </div>

      {isResizable && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            'absolute right-[-2px] top-0 h-full w-1.5 cursor-col-resize hover:bg-slate-300 transition-colors z-20',
            header.column.getIsResizing() ? 'bg-slate-300' : 'bg-transparent',
          )}
        />
      )}
    </div>
  )
}
