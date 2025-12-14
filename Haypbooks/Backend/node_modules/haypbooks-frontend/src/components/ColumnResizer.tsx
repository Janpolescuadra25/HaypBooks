import React, { useRef } from 'react'

type Props = {
  colKey: string
  width: number
  onChange: (colKey: string, next: number) => void
  min?: number
}

export default function ColumnResizer({ colKey, width = 0, onChange, min = 40 }: Props) {
  const draggingRef = useRef<{ startX: number, startWidth: number } | null>(null)
  const liveRef = useRef<HTMLSpanElement | null>(null)
  const STEP = 8
  const MAX = 2000

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = { startX: e.clientX, startWidth: width }
    
    // Fallback window-level listeners for environments without pointer capture (JSDOM)
    const handleWindowPointerMove = (we: PointerEvent) => {
      if (!draggingRef.current) return
      const delta = we.clientX - draggingRef.current.startX
      const next = Math.max(min, Math.round(draggingRef.current.startWidth + delta))
      onChange(colKey, next)
    }

    const handleWindowPointerUp = () => {
      draggingRef.current = null
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)

    // Some environments (JSDOM) don't implement setPointerCapture — guard it.
    try { if (typeof (e.target as any).setPointerCapture === 'function') { (e.target as Element).setPointerCapture(e.pointerId) } } catch {}
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    const delta = e.clientX - draggingRef.current.startX
    const next = Math.max(min, Math.round(draggingRef.current.startWidth + delta))
    onChange(colKey, next)
  }

  function onPointerUp(e: React.PointerEvent) {
    try { if (typeof (e.target as any).releasePointerCapture === 'function') { (e.target as Element).releasePointerCapture(e.pointerId) } } catch {}
    draggingRef.current = null
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(min, Math.round(width + STEP))
      onChange(colKey, Math.min(next, MAX))
      if (liveRef.current) liveRef.current.textContent = `${next}px`
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(min, Math.round(width - STEP))
      onChange(colKey, Math.max(next, min))
      if (liveRef.current) liveRef.current.textContent = `${next}px`
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      onChange(colKey, min)
      if (liveRef.current) liveRef.current.textContent = `${min}px`
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      onChange(colKey, MAX)
      if (liveRef.current) liveRef.current.textContent = `${MAX}px`
      return
    }
  }

  return (
    <div>
      <span aria-live="polite" ref={liveRef} className="sr-only" />
      <div
      role="separator"
      aria-label={`Resize ${colKey} column`}
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={MAX}
      aria-valuenow={width}
      tabIndex={0}
      onKeyDown={onKeyDown}
      title={`Resize ${colKey}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={"absolute right-0 top-0 bottom-0 w-2 cursor-col-resize touch-none transition-colors " +
        "bg-transparent hover:bg-slate-200/60 active:bg-slate-300/70"}
      style={{ zIndex: 20 }}
    />
    </div>
  )
}
