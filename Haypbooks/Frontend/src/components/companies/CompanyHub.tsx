'use client'
import { useEffect, useState } from 'react'
import UserMenu from '@/components/UserMenu'

type Company = { id: string; name: string; status?: string; plan?: string; lastAccessedAt?: string }

export default function CompanyHub() {
  const [owned, setOwned] = useState<Company[]>([])
  const [invited, setInvited] = useState<Company[]>([])
  const [tab, setTab] = useState<'owned' | 'invited'>('owned')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/companies?filter=owned', { cache: 'no-store' }),
          fetch('/api/companies?filter=invited', { cache: 'no-store' }),
        ])
        if (!mounted) return
        if (r1.ok) setOwned(await r1.json())
        if (r2.ok) setInvited(await r2.json())
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Companies & Clients</h1>
          <p className="text-sm text-slate-600">Your central hub for companies and access</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">Create New Company</button>
          <UserMenu />
        </div>
      </header>

      <section className="mb-4">
        <div className="p-4 rounded bg-slate-50 border">Subscription summary placeholder (TODO: fetch)</div>
      </section>

      <section className="mb-6">
        <div className="flex gap-4 border-b">
          <button className={`py-3 ${tab==='owned' ? 'border-b-2 border-emerald-500 font-semibold' : 'text-slate-600'}`} onClick={() => setTab('owned')}>My Companies</button>
          <button className={`py-3 ${tab==='invited' ? 'border-b-2 border-emerald-500 font-semibold' : 'text-slate-600'}`} onClick={() => setTab('invited')}>Invited Companies</button>
        </div>
      </section>

      <section>
        {loading ? (
          <div className="text-slate-500">Loading…</div>
        ) : (
          <div>
            {tab === 'owned' && (
              <CompanyGrid companies={owned} emptyMessage="No companies yet — create your first one!" />
            )}
            {tab === 'invited' && (
              <CompanyGrid companies={invited} emptyMessage="No invitations yet" />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function CompanyGrid({ companies, emptyMessage }: { companies: Company[]; emptyMessage: string }) {
  if (!companies || companies.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="mb-2">{emptyMessage}</div>
        <div><a className="text-emerald-600 underline" href="#">Get started</a></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((c) => (
        <div key={c.id} className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{c.name}</div>
            <button className="text-sm text-emerald-600">Open Books</button>
          </div>
          <div className="text-sm text-slate-500 mt-2">{c.plan || 'Free'}</div>
          <div className="text-xs text-slate-400 mt-1">{c.lastAccessedAt ? `Last: ${new Date(c.lastAccessedAt).toLocaleString()}` : ''}</div>
        </div>
      ))}
    </div>
  )
}
