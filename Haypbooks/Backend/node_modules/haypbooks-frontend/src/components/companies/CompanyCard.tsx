import React from 'react'

export default function CompanyCard({ company }: { company: any }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{company.name}</div>
          <div className="text-sm text-gray-500">{company.plan || 'Free'}</div>
        </div>
        <div className="text-sm text-right">
          <div className="text-xs text-gray-400">Last accessed</div>
          <div>{company.lastAccessedAt ? new Date(company.lastAccessedAt).toLocaleString() : '—'}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="btn btn-secondary">Open Books</button>
        <div className="text-sm text-gray-500">Status: {company.status || 'ACTIVE'}</div>
      </div>
    </div>
  )
}
