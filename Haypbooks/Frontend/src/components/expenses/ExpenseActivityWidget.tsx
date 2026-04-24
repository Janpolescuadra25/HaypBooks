"use client"

import React, { useState } from 'react'
import { Clock3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useCompanyId } from '@/hooks/useCompanyId'

interface Props {
  tableName: string
  entityLabel?: string
  pageSize?: number
}

export default function ExpenseActivityWidget({ tableName, entityLabel, pageSize = 8 }: Props) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const [open, setOpen] = useState(false)

  const { entries, loading } = useActivityLog({
    companyId,
    pageSize,
    initialFilters: { tableName },
  })

  return (
    <section className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Clock3 size={14} className="text-emerald-600" />Recent Activity</h2>
          <p className="text-xs text-gray-500 mt-0.5">Latest {entityLabel ?? tableName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen((o) => !o)} className="px-3 py-1.5 rounded-lg text-sm border border-gray-100 bg-white text-gray-700">{open ? 'Collapse' : 'Expand'}</button>
          <button onClick={() => router.push(`/activity?tableName=${encodeURIComponent(tableName)}`)} className="px-3 py-1.5 rounded-lg text-sm border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50">View all</button>
        </div>
      </div>
      {open && (
        <div className="p-4">
          <ActivityLog entries={entries} loading={loading} emptyMessage={`No ${entityLabel ?? tableName} activity`} />
        </div>
      )}
    </section>
  )
}
