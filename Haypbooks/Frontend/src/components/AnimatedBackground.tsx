"use client"
import React from 'react'

export default function AnimatedBackground() {
  // Don't render on server to avoid SSR issues
  if (typeof window === 'undefined') return null

  return (
    <div data-testid="animated-background" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-100/10 rounded-full blur-2xl animate-pulse" />
    </div>
  )
}
