'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type DocumentRow = {
  id: string
  name: string
  customer: string
  type: 'Contract' | 'ID' | 'Agreement'
  uploadedDate: string
  uploadedBy: string
  status: 'Active' | 'Expired' | 'Pending'
}

export default function CustomerDocumentsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/customers`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const docs: DocumentRow[] = [
    { id: 'doc1', name: 'Service Agreement - Acme', customer: 'Acme Corporation', type: 'Contract', uploadedDate: '2026-03-10', uploadedBy: 'Jane C.', status: 'Active' },
    { id: 'doc2', name: 'Tax Exempt Cert - TechStart', customer: 'TechStart Inc', type: 'ID', uploadedDate: '2026-03-12', uploadedBy: 'Curtis H.', status: 'Active' },
    { id: 'doc3', name: 'Credit Application - Global', customer: 'Global Logistics', type: 'Agreement', uploadedDate: '2026-03-14', uploadedBy: 'Mia T.', status: 'Pending' },
  ]

  const filtered = useMemo(() => {
    if (!search) return docs
    const q = search.toLowerCase()
    return docs.filter((row) =>
      row.name.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.type.toLowerCase().includes(q) ||
      row.uploadedDate.toLowerCase().includes(q) ||
      row.uploadedBy.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
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

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search documents"
            placeholder="Search documents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by document name, customer, type, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Document Name</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Uploaded Date</th>
                <th className="text-left px-4 py-3">Uploaded By</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No documents found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.type}</td>
                    <td className="px-4 py-3 text-slate-600">{row.uploadedDate}</td>
                    <td className="px-4 py-3 text-slate-600">{row.uploadedBy}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Active' ? 'text-emerald-700' : row.status === 'Pending' ? 'text-amber-700' : 'text-rose-700'}`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Documents Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Store and manage all documents linked to customer accounts and contracts.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Upload contracts, tax IDs, agreements, and more.</li>
                <li>Search by customer, type, or status.</li>
                <li>Track who uploaded files and when.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
