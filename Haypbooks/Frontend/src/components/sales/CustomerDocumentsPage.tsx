'use client'

import { useMemo, useState } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypModal from '@/components/shared/HaypModal'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'

type DocumentRow = {
  id: string
  name: string
  customer: string
  type: 'Contract' | 'ID' | 'Agreement'
  uploadedDate: string
  uploadedBy: string
  status: 'Active' | 'Expired' | 'Pending'
}

// TODO: Replace with API data when backend endpoint exists
const DEFAULT_DOCUMENTS: DocumentRow[] = [
  { id: 'doc1', name: 'Service Agreement - Acme', customer: 'Acme Corporation', type: 'Contract', uploadedDate: '2026-03-10', uploadedBy: 'Jane C.', status: 'Active' },
  { id: 'doc2', name: 'Tax Exempt Cert - TechStart', customer: 'TechStart Inc', type: 'ID', uploadedDate: '2026-03-12', uploadedBy: 'Curtis H.', status: 'Active' },
  { id: 'doc3', name: 'Credit Application - Global', customer: 'Global Logistics', type: 'Agreement', uploadedDate: '2026-03-14', uploadedBy: 'Mia T.', status: 'Pending' },
]

export default function CustomerDocumentsPage() {
  const { loading: companyLoading } = useCompanyId()
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const columns = useMemo<HaypColumn<DocumentRow>[]>(
    () => [
      { id: 'name', header: 'Document Name', accessorKey: 'name', size: 220 },
      { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 180 },
      { id: 'type', header: 'Type', accessorKey: 'type', size: 120 },
      { id: 'uploadedDate', header: 'Uploaded Date', accessorKey: 'uploadedDate', size: 140 },
      { id: 'uploadedBy', header: 'Uploaded By', accessorKey: 'uploadedBy', size: 140 },
      { id: 'status', header: 'Status', accessorKey: 'status', size: 120 },
    ],
    [],
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Documents</h1>
            <p className="text-sm text-slate-500 mt-1">Store and manage customer-related files</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">Upload Document</button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Customer Documents" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <HaypDataTable
            data={DEFAULT_DOCUMENTS}
            columns={columns}
            tableId="customer-documents"
            globalFilter={search}
            onGlobalFilterChange={setSearch}
            searchPlaceholder="Search documents..."
            loading={companyLoading}
            onRefresh={() => {}}
            emptyTitle="No documents yet"
            emptySubtitle="Upload customer documents to keep everything organized."
          />
        </div>
      </div>

      {helpOpen && (
        <HaypModal open={helpOpen} onClose={() => setHelpOpen(false)} title="Customer Documents Documentation">
          <div className="p-4 text-sm text-slate-700 space-y-3">
            <p>Store and manage customer-related files linked to customer accounts and contracts.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload contracts, tax IDs, agreements, and more.</li>
              <li>Search by customer, type, or status.</li>
              <li>Track who uploaded files and when.</li>
            </ul>
          </div>
        </HaypModal>
      )}
    </div>
  )
}
