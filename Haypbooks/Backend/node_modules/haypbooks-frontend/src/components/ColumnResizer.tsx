'use client'

import React, { useCallback, useEffect, useRef } from 'react'

interface Props {
  colKey: string
  width: number
  onChange: (colKey: string, next: number) => void
  min?: number
}

/**
 * ColumnResizer — drag handle for resizable table column headers.
 * Renders a thin vertical bar that the user can drag to resize the column.
 */
export default function ColumnResizer({ colKey, width, onChange, min = 40 }: Props) {
  const startX = useRef<number | null>(null)
  const startW = useRef<number>(width)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (startX.current == null) return
    const delta = e.clientX - startX.current
    const next = Math.max(min, startW.current + delta)
    onChange(colKey, next)
  }, [colKey, min, onChange])

  const onMouseUp = useCallback(() => {
    startX.current = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [onMouseMove])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startX.current = e.clientX
    startW.current = width
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width, onMouseMove, onMouseUp])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div
      onMouseDown={onMouseDown}
      aria-label="Resize column"
      role="separator"
      className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
    >
      <div className="w-px h-4 bg-slate-300 group-hover:bg-slate-500 transition-colors rounded-full" />
    </div>
  )
}
