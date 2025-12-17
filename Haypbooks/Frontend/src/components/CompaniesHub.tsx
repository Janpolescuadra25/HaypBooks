'use client'
import { useEffect, useState } from 'react'
import CompanyCard from './CompanyCard'

export default function CompaniesHub() {
  const [companies, setCompanies] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/companies', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (mounted) setCompanies(Array.isArray(data) ? data : []) })
      .catch(() => { if (mounted) setCompanies([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  async function createCompany(e: any) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Name is required')
    setCreating(true)
    try {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) })
      if (!res.ok) throw new Error('create failed')
      const data = await res.json()
      setCompanies((prev) => (prev ? [data, ...prev] : [data]))
      setName('')
    } catch (e:any) {
      setError(e?.message || 'Failed to create')
    } finally { setCreating(false) }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Companies & Clients</h1>
          <p className="text-slate-600">Manage your companies, invites, and billing.</p>
        </div>
        <form onSubmit={createCompany} className="flex items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New company name" className="rounded border border-slate-200 px-2 py-1 text-sm" />
          <button type="submit" className="btn-primary btn-sm" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
        </form>
      </div>

      <div className="mb-6">
        <div className="rounded-lg border border-slate-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-700">Subscription</div>
              <div className="text-sm text-slate-500">You have X companies · $0/month · Next billing Jan 17</div>
            </div>
            <a href="/settings/billing" className="text-sky-700">Manage billing</a>
          </div>
        </div>
      </div>

      {loading && <div>Loading companies…</div>}
      {!loading && companies && companies.length === 0 && <div className="text-center py-20">No companies yet — create your first one.</div>}

      {!loading && companies && companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
        </div>
      )}

      {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
    </div>
  )
}
