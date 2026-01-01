"use client"
import React from 'react'

export default function HubPageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hub-page-container ${className || ''}`}>
      {children}
    </div>
  )
}
