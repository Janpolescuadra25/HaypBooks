import React from 'react'

export type SparklineProps = {
  values: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  ariaLabel?: string
}

export default function Sparkline({ values, width = 160, height = 40, color = '#0ea5e9', strokeWidth = 2, ariaLabel }: SparklineProps) {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const n = values.length
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const span = max - min || 1

  const points = values.map((v, i) => {
    const x = (i / Math.max(1, n - 1)) * w
    const y = h - ((v - min) / span) * h
    return [x, y]
  })

  const d = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel}>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
