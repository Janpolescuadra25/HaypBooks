"use client"
import React, { useEffect, useRef, useState } from 'react'

/**
 * ResizableBox
 * Wraps a child element (input/select/textarea or other single element) and adds a
 * right-edge drag handle so users can horizontally resize the element in place.
 *
 * Behavior and constraints:
 * - Initial width is measured from the child's current width (or defaultWidth prop)
 * - Min/max width can be provided (pixels)
 * - Maximum width is constrained to the parent cell width (so the table/layout doesn't overflow)
 * - Styling: no border-radius applied by default to child wrapper; font-size kept around ~13.5px
 */
export default function ResizableBox({ children, defaultWidth, minWidth = 40, maxWidth, className = '' }: { children: React.ReactNode; defaultWidth?: number; minWidth?: number; maxWidth?: number; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const childRef = useRef<HTMLElement | null>(null)
  const [widthPx, setWidthPx] = useState<number | 'auto'>(() => defaultWidth ? defaultWidth : 'auto')
  const resizingRef = useRef<{ startX: number; startW: number } | null>(null)

  useEffect(() => {
    // measure initial width if not provided
    if (widthPx === 'auto' && wrapperRef.current) {
      const parent = wrapperRef.current.parentElement as HTMLElement | null
      const measured = wrapperRef.current.getBoundingClientRect().width
        const parentWidth = parent ? parent.getBoundingClientRect().width : 0
        // If parent measurement yields zero (JSDOM/testing), allow unconstrained max to
        // avoid immediately collapsing to 0. Use parent width only when sensible (> 20px)
        const allowedMax = maxWidth ?? (parentWidth > 20 ? parentWidth : Infinity)
      setWidthPx(Math.min(measured || 120, allowedMax))
    }
  }, [widthPx, maxWidth])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizingRef.current) return
      const { startX, startW } = resizingRef.current
      const delta = e.clientX - startX
      const raw = Math.max(minWidth, startW + delta)
      // constraining to maxWidth or parent cell width
      const parent = wrapperRef.current?.parentElement as HTMLElement | null
        const parentWidth = parent ? parent.getBoundingClientRect().width : 0
        const allowedMax = maxWidth ?? (parentWidth > 20 ? parentWidth : Infinity)
      const next = Math.min(raw, allowedMax)
      setWidthPx(next)
    }

    function onUp() { resizingRef.current = null; document.body.style.userSelect = '' }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [minWidth, maxWidth])

  function handleMouseDown(e: React.MouseEvent) {
    if (!wrapperRef.current) return
    const startW = typeof widthPx === 'number' ? widthPx : wrapperRef.current.getBoundingClientRect().width
    resizingRef.current = { startX: e.clientX, startW }
    // disable text selection while dragging
    document.body.style.userSelect = 'none'
  }

  // We don't forward refs to arbitrary function components (causes warnings), so
  // render children as-is and rely on the wrapper measurement instead.
  const child = React.Children.only(children) as React.ReactElement

  return (
    <div ref={wrapperRef} className={`resizable-box inline-block relative ${className}`} style={{ width: widthPx === 'auto' ? undefined : `${widthPx}px`, minWidth: `${minWidth}px`, maxWidth: maxWidth ? `${maxWidth}px` : '100%' }}>
      <div className="resizable-inner w-full" style={{ fontSize: '13.5px' }}>
        {child}
      </div>
      {/* right-edge handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={handleMouseDown}
        className="resizer absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-slate-200/50 border-l border-slate-200/20 hover:border-slate-300/40"
        style={{ touchAction: 'none' }}
      />
      {/* no extra styles — use Tailwind utility classes for the border and hover state */}
    </div>
  )
}
