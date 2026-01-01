'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EntityCard from '@/components/cards/EntityCard'
import TopBar from '@/components/TopBar'

type Company = { id: string; name: string; status?: string; plan?: string; lastAccessedAt?: string }

export default function CompanyHub() {
  const router = useRouter()
  const [owned, setOwned] = useState<Company[]>([])
  const [invited, setInvited] = useState<Company[]>([])
  const [tab, setTab] = useState<'owned' | 'invited'>('owned')
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Permanent vertical offset (px)
  const verticalOffset = -62

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

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const companyCount = owned.length + invited.length

  // Advanced container settings (finalized)
  const outerWidthOption: 'match'|'wider'|'full'|'custom' = 'custom'
  const customWidth = 1800
  const outerPadding = 0
  const alignment: 'center'|'left'|'right' = 'center'
  const offset = -8



  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar searchValue={searchInput} onSearchChange={setSearchInput} companyCount={companyCount} onRegister={() => router.push('/companies/new')} />

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div style={{
            maxWidth: `${customWidth}px`,
            paddingLeft: `${outerPadding}px`,
            paddingRight: `${outerPadding}px`,
            marginLeft: alignment === 'center' ? 'auto' : (alignment === 'left' ? `${offset}px` : undefined),
            marginRight: alignment === 'center' ? 'auto' : (alignment === 'right' ? `${offset}px` : undefined),
          }}>

          {/* White Container (expanded: wider, taller; inner content sizes unchanged) */}
          <div className="relative overflow-visible bg-white rounded-[64px] shadow-[0_6px_18px_rgba(2,6,23,0.04)] ring-1 ring-emerald-50 border border-emerald-100 px-6 pt-4 pb-10 min-h-[460px]" style={{ transform: `translateY(${verticalOffset}px)` }}>



            {/* Centered Search */}
            <div className="mb-12">
              <div className="relative max-w-lg mx-auto">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  aria-label="search entities" 
                  type="text" 
                  placeholder="Search entities by name..." 
                  value={searchInput} 
                  onChange={(e) => setSearchInput(e.target.value)} 
                  className="w-full pl-10 pr-3 h-10 text-xs rounded-full border border-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-200 focus:border-transparent bg-white placeholder:text-slate-400 shadow-sm" 
                />
              </div>
            </div>

            {loading ? (
              <div className="text-slate-500 text-center py-12">Loading…</div>
            ) : (
              <div>
                <CompanyGrid companies={owned} searchTerm={searchTerm} emptyMessage="No companies yet — create your first one!" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CompanyGrid({ companies, emptyMessage, searchTerm }: { companies: Company[]; emptyMessage: string; searchTerm?: string }) {
  const q = (searchTerm || '').trim().toLowerCase()
  const filtered = q ? companies.filter((c) => c.name.toLowerCase().includes(q)) : companies

  if (!filtered || filtered.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="mb-3 text-lg">{q ? 'No companies match that search' : emptyMessage}</div>
        <div className="mb-6"><a className="inline-block px-3 py-1.5 rounded-md text-sm text-emerald-700 bg-emerald-50" href="#">Get started</a></div>
        {/* show register card when empty */}
        <div className="mx-auto max-w-md">
          <EntityCard variant="register" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-8 xl:gap-10 overflow-x-auto pb-4">
      {filtered.map((c) => (
        <div key={c.id} className="flex-shrink-0 w-[300px]">
          <EntityCard id={c.id} name={c.name} subtitle={c.plan || 'Free'} members={12} connected={true} onLaunch={() => window.location.href = `/companies/${c.id}`} />
        </div>
      ))}
      {/* Register card */}
      <div className="flex-shrink-0 w-[300px]">
        <EntityCard variant="register" />
      </div>
    </div>
  )
}
