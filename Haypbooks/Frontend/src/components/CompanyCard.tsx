'use client'
import React from 'react'

export default function CompanyCard({ company, onOpen }: { company: any; onOpen?: (id: string) => void }) {
  const last = company.lastAccessedAt ? new Date(company.lastAccessedAt).toLocaleString() : '—'
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{company.plan || 'Standard'}</div>
          <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
          <div className="text-xs text-slate-400">Last accessed: {last}</div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/dashboard?tenantId=${company.id}`} className="btn-primary btn-sm">Open books</a>
        </div>
      </div>
    </div>
  )
}
