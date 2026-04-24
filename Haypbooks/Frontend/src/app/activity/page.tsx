"use client"

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ModuleActivityPage from '@/components/activity/ModuleActivityPage'
import { formatEntityLabel } from '@/components/ui/ActivityLog'

export default function ActivityRoutePage() {
  const params = useSearchParams()
  const tableName = params?.get('tableName') ?? undefined
  const title = tableName ? `${formatEntityLabel(tableName)} Activity` : 'Activity'
  const subtitle = tableName ? `Latest activity for ${formatEntityLabel(tableName)}` : 'Recent activity across modules'

  return (
    <ModuleActivityPage
      title={title}
      subtitle={subtitle}
      backHref="/"
      tableName={tableName}
    />
  )
}
