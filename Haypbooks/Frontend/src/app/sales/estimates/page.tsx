"use client"
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/client-api'
import Link from 'next/link'

type Estimate = { id: string; number: string; customerId: string; status: string; date: string; total: number; expiryDate?: string; convertedInvoiceId?: string }
type Customer = { id: string; name: string }

export default function EstimatesPage() {
  const [rows, setRows] = useState<Estimate[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const custMap = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c.name])), [customers])

  async function load() {
    setLoading(true)
    try {
      const [est, cust] = await Promise.all([
        api<{ estimates: Estimate[]; total: number }>(`/api/estimates?page=1&limit=50`),
        api<{ rows: Customer[] }>(`/api/customers`),
      ])
      setRows(est.estimates)
      setCustomers(cust.rows || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load estimates')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function convert(id: string) {
    try {
      await api(`/api/estimates/${encodeURIComponent(id)}/convert`, { method: 'POST', body: JSON.stringify({}) })
      await load()
    } catch (e: any) { setError(e?.message || 'Failed to convert estimate') }
  }

  async function remove(id: string) {
    try {
      await api(`/api/estimates/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await load()
    } catch (e: any) { setError(e?.message || 'Failed to delete estimate') }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">Estimates</h1>
            <p className="text-slate-600 text-xs">Draft and manage quotes before invoicing.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sales/estimates/new" className="btn-primary !px-2 !py-1 text-xs">New Estimate</Link>
          </div>
        </div>
        {error && <div className="mt-3 text-red-700 text-sm">{error}</div>}
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2">Number</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">No estimates yet.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-medium">{r.number}</td>
                  <td className="px-3 py-2">{custMap[r.customerId] || r.customerId}</td>
                  <td className="px-3 py-2">{r.date?.slice(0,10)}</td>
                  <td className="px-3 py-2">{r.expiryDate?.slice(0,10) || '-'}</td>
                  <td className="px-3 py-2 text-right"><Amount value={Number(r.total||0)} /></td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">{r.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/sales/estimates/${r.id}`} className="btn-secondary !px-2 !py-1 text-xs">Edit</Link>
                      {r.status !== 'converted' && <button className="btn-primary !px-2 !py-1 text-xs" onClick={() => convert(r.id)}>Convert</button>}
                      <button className="btn-danger !px-2 !py-1 text-xs" onClick={() => setConfirmDelete(r.id)}>Delete</button>
                    </div>
                    {confirmDelete === r.id && (
                      <div className="mt-2 text-xs flex items-center gap-2">
                        <span>Delete this estimate?</span>
                        <button className="btn-danger !px-2 !py-1 text-xs" onClick={() => remove(r.id)}>Yes, delete</button>
                        <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
