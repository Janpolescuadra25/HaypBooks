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

  useEffect(() => {
    if (!open) { setMenuStyle(null); return }

    const target = anchorRef?.current ?? null
    const updatePosition = () => {
      if (!target || !menuRef.current) return
      const rect = target.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const panelWidth = matchWidth ? rect.width : menuRef.current?.offsetWidth || 0
      const padding = 16
      const offset = 8

      let left = rect.left

      const isMobile = viewportWidth < 640
      if (isMobile) {
        left = padding
      } else {
        left = Math.max(padding, Math.min(left, viewportWidth - panelWidth - padding))
      }

      setMenuStyle({ 
        position: 'fixed', 
        left, 
        top: rect.bottom + offset, 
        width: isMobile ? `calc(100vw - 2rem)` : (matchWidth ? rect.width : undefined), 
        zIndex: 9999 
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)

    const handleScroll = () => {
      if (closeOnScroll) onClose?.()
      else updatePosition()
    }

    const scrollParents: Array<EventTarget> = []
    let node: Element | null = anchorRef?.current ?? null
    while (node && node !== document.documentElement) {
      try {
        const style = window.getComputedStyle(node)
        const overflowY = style.overflowY
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') scrollParents.push(node)
        node = node.parentElement
      } catch { break }
    }
    scrollParents.push(window)
    for (const sp of scrollParents) sp.addEventListener('scroll', handleScroll as EventListener, { passive: true })

    return () => {
      window.removeEventListener('resize', updatePosition)
      for (const sp of scrollParents) sp.removeEventListener('scroll', handleScroll as EventListener)
    }
  }, [open, anchorRef, matchWidth, onClose, closeOnScroll])

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
    <div ref={menuRef} role="presentation" style={menuStyle || {}} className={className} aria-hidden={!open}>
      {children}
    </div>
  )

  if (disablePortal || typeof document === 'undefined' || !document.body) {
    return content
  }

  return createPortal(content, document.body)
}

export default React.forwardRef<HTMLDivElement, PopoverProps>(PopoverInner)
