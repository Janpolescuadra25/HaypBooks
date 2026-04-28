/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Header, flexRender } from '@tanstack/react-table';
import { GripVertical, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>;
  key?: React.Key;
}

export function DraggableHeader<TData, TValue>({
  header,
}: DraggableHeaderProps<TData, TValue>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.getSize(),
    flex: `0 0 ${header.getSize()}px`,
    minWidth: header.column.columnDef.minSize,
    maxWidth: header.column.columnDef.maxSize,
    zIndex: isDragging ? 2 : 0,
  };

  const isSortable = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const isCentered = header.id === 'actions' || header.id === 'select';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center h-11 border-r border-border/50 bg-muted/50 px-3 text-left align-middle font-bold uppercase tracking-tight text-muted-foreground last:border-r-0 hover:bg-muted transition-colors select-none",
        isDragging && "bg-accent text-accent-foreground shadow-lg ring-1 ring-primary/20 z-10"
      )}
      role="columnheader"
    >
      {/* Drag Handle Button */}
      {header.id !== 'select' && header.id !== 'actions' && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-grab p-1 opacity-0 group-hover:opacity-40 focus-visible:opacity-100 hover:opacity-100 hover:text-primary active:cursor-grabbing transition-opacity z-10"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Content & Sorting */}
      <div 
        className={cn(
          "flex flex-1 items-center gap-1 overflow-hidden h-full w-full",
          isSortable ? "cursor-pointer justify-between" : (isCentered ? "justify-center" : "justify-start"),
          header.id !== 'select' && header.id !== 'actions' && "pl-4"
        )}
        onClick={header.column.getToggleSortingHandler()}
      >
        <span className="truncate text-[10px] font-bold uppercase tracking-tight">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
        {isSortable && (
          <div className="flex items-center shrink-0">
             {sorted === 'asc' ? (
                <ChevronUp className="h-3 w-3 text-primary" />
              ) : sorted === 'desc' ? (
                <ChevronDown className="h-3 w-3 text-primary" />
              ) : (
                <ChevronsUpDown className="h-2.5 w-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
              )}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors",
            header.column.getIsResizing() ? "bg-primary w-0.5" : "bg-transparent"
          )}
        />
      )}
    </div>
  );
}
