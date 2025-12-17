import React from 'react'
import CompanyCard from './CompanyCard'

export default function CompanyList({ companies }: { companies: any[] }) {
  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">No companies yet</h2>
        <p className="text-sm text-gray-500">Create your first company to open the books.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((c) => (
        <CompanyCard key={c.id} company={c} />
      ))}
    </div>
  )
}
