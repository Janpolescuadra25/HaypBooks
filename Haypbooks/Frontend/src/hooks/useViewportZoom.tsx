import { useEffect, useState } from 'react'

export default function useViewportZoom() {
  const [isCompact, setIsCompact] = useState(false)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    function update() {
      const vv = (window as any).visualViewport
      const scale = vv?.scale ?? 1
      const width = vv?.width ?? window.innerWidth
      const dpi = window.devicePixelRatio ?? 1

      // Compact threshold raised to avoid triggering compact mode at 110% zoom
      setIsCompact(scale > 1.15 || width < 760 || dpi > 1.5)
      // Treat zoomed-out (scale < 1) OR wide viewport (>=1600px) as "wide" (edge-to-edge)
      // Using 0.995 to account for tiny rounding differences in some browsers
      setIsWide(scale < 0.995 || width >= 1600)
    }

    update()
    const onResize = () => update()
    window.addEventListener('resize', onResize, { passive: true })
    ;(window as any).visualViewport?.addEventListener?.('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      ;(window as any).visualViewport?.removeEventListener?.('resize', onResize)
    }
  }, [])

  return { isCompact, isWide }
}
