import React, { useEffect, useRef, useState, ForwardedRef } from 'react'
import { createPortal } from 'react-dom'

export interface PopoverProps {
  open: boolean
  anchorRef?: React.RefObject<HTMLElement>
  onClose?: () => void
  matchWidth?: boolean
  className?: string
  style?: React.CSSProperties
  closeOnScroll?: boolean
  disablePortal?: boolean
  children?: React.ReactNode
}

function PopoverInner(props: PopoverProps, ref: ForwardedRef<HTMLDivElement>) {
  const { open, anchorRef, onClose, matchWidth = true, className, style, closeOnScroll = true, disablePortal = false, children } = props
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null)
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    if (!open) { setMenuStyle(null); setMeasured(false); return }

    const target = anchorRef?.current ?? null
    if (!target) return

    let rafId = 0

    const calculatePosition = () => {
      const rect = target.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const panelWidth = matchWidth ? rect.width : (menuRef.current?.offsetWidth || 300)
      const padding = 16
      const offset = 8

      let left = rect.left
      const isMobile = viewportWidth < 640
      if (isMobile) {
        left = padding
      } else {
        if (left + panelWidth + padding > viewportWidth) {
          left = Math.max(padding, rect.right - panelWidth)
        }
        left = Math.max(padding, left)
      }

      const popoverHeight = menuRef.current?.offsetHeight || 0
      const spaceBelow = viewportHeight - rect.bottom - offset
      const spaceAbove = rect.top - offset
      let top: number
      if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
        top = rect.bottom + offset
      } else {
        top = rect.top - popoverHeight - offset
      }
      top = Math.max(8, Math.min(top, viewportHeight - popoverHeight - 8))

      setMenuStyle({
        position: 'fixed',
        left,
        top,
        width: isMobile ? `calc(100vw - 2rem)` : (matchWidth ? rect.width : undefined),
        zIndex: 9999,
      })
    }

    const popoverHeight = menuRef.current?.offsetHeight || 0
    if (!measured && popoverHeight === 0) {
      // First pass: render off-screen so the browser can measure the popover height
      setMenuStyle({ position: 'fixed', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none', zIndex: 9999 })
      rafId = requestAnimationFrame(() => setMeasured(true))
      return () => cancelAnimationFrame(rafId)
    }

    // Second pass (or first pass when height is already known): calculate real position with flip
    calculatePosition()

    window.addEventListener('resize', calculatePosition)

    const handleScroll = () => {
      if (closeOnScroll) onClose?.()
      else calculatePosition()
    }

    const scrollParents: Array<EventTarget> = []
    let node: Element | null = anchorRef?.current ?? null
    while (node && node !== document.documentElement) {
      try {
        const cs = window.getComputedStyle(node)
        if (cs.overflowY === 'auto' || cs.overflowY === 'scroll' || cs.overflowY === 'overlay') scrollParents.push(node)
        node = node.parentElement
      } catch {
        break
      }
    }
    scrollParents.push(window)
    for (const sp of scrollParents) sp.addEventListener('scroll', handleScroll as EventListener, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', calculatePosition)
      for (const sp of scrollParents) sp.removeEventListener('scroll', handleScroll as EventListener)
    }
  }, [open, anchorRef, matchWidth, onClose, closeOnScroll, measured])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (menuRef.current && menuRef.current.contains(t)) return
      if (anchorRef?.current && anchorRef?.current.contains(t)) return
      onClose?.()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, anchorRef, onClose])

  const content = (
    <div
      ref={menuRef}
      role="presentation"
      style={menuStyle || { position: 'fixed', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }}
      className={className}
      aria-hidden={!open}
    >
      {children}
    </div>
  )

  if (disablePortal || typeof document === 'undefined' || !document.body) {
    return content
  }

  return createPortal(content, document.body)
}

export default React.forwardRef<HTMLDivElement, PopoverProps>(PopoverInner)
