import React, { useRef } from 'react'

type Props = {
  rowIndex: number
  width?: number
  onChange: (rowIndex: number, next: number) => void
  min?: number
  label?: string
}

export default function InlineWidthResizer({ rowIndex, width = 0, onChange, min = 40, label }: Props) {
  const draggingRef = useRef<{ startX: number, startWidth: number } | null>(null)
  // step size for keyboard nudging (px)
  const STEP = 8
  // when a user hits End we clamp to an upper bound (very large default — UI may limit this in parent)
  const MAX = 2000
  const liveRef = useRef<HTMLSpanElement | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as Element
    // start width may come from the prop (col width) — fallback to 0 when not available
    draggingRef.current = { startX: e.clientX, startWidth: Number(width || 0) }

    const handleWindowPointerMove = (we: PointerEvent) => {
      if (!draggingRef.current) return
      const delta = we.clientX - draggingRef.current.startX
      const next = Math.max(min, Math.round(draggingRef.current.startWidth + delta))
      onChange(rowIndex, next)
    }

    const handleWindowPointerUp = () => {
      draggingRef.current = null
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)

    try { if (typeof (e.target as any).setPointerCapture === 'function') { (e.target as Element).setPointerCapture(e.pointerId) } } catch {}
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    const delta = e.clientX - draggingRef.current.startX
    const next = Math.max(min, Math.round(draggingRef.current.startWidth + delta))
    onChange(rowIndex, next)
  }

  function onPointerUp(e: React.PointerEvent) {
    try { if (typeof (e.target as any).releasePointerCapture === 'function') { (e.target as Element).releasePointerCapture(e.pointerId) } } catch {}
    draggingRef.current = null
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // keyboard only for focused resizer
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(min, Math.round((width || 0) + STEP))
      onChange(rowIndex, Math.min(next, MAX))
      if (liveRef.current) liveRef.current.textContent = `${next}px`
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(min, Math.round((width || 0) - STEP))
      onChange(rowIndex, Math.max(next, min))
      if (liveRef.current) liveRef.current.textContent = `${next}px`
      return
    }
    if (e.key === 'Home') {
      e.preventDefault();
      onChange(rowIndex, min)
      if (liveRef.current) liveRef.current.textContent = `${min}px`
      return
    }
    if (e.key === 'End') {
      e.preventDefault();
      onChange(rowIndex, MAX)
      if (liveRef.current) liveRef.current.textContent = `${MAX}px`
      return
    }
  }

  const ariaLabel = label ? `Resize ${label} for row ${rowIndex}` : `Resize description for row ${rowIndex}`

  return (
    <div>
      {/* live region for screen readers — updates when keyboard nudges width */}
      <span aria-live="polite" ref={liveRef} className="sr-only" />
      <div
      role="separator"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={MAX}
      aria-valuenow={width}
      tabIndex={0}
      onKeyDown={onKeyDown}
      title={`Resize ${label ?? 'description'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize touch-none"
      style={{ zIndex: 20 }}
    />
    </div>
  )
}
