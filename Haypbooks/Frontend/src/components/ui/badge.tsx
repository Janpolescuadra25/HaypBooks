'use client'

import type { HTMLAttributes, ReactNode } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function Badge({ className = '', children, ...props }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
