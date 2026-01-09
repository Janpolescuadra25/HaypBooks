'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EntityCard from '@/components/cards/EntityCard'
import dynamic from 'next/dynamic'
const TopBar = dynamic(() => import('@/components/TopBar'), { ssr: false })
import useViewportZoom from '@/hooks/useViewportZoom'
import { useToast } from '@/components/ToastProvider'

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

  const [me, setMe] = useState<any | null>(null)
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false)

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

        // Also fetch current user profile so we can auto-create a company if needed
        try {
          const meRes = await fetch('/api/users/me', { cache: 'no-store' })
          if (meRes.ok) {
            const j = await meRes.json()
            if (mounted) setMe(j)
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const { push } = useToast()

  // If there are no owned companies but the user's profile has a companyName (from signup/get-started),
  // attempt a best-effort creation so the Owner Hub will immediately show the card.
  useEffect(() => {
    async function ensureCompany() {
      if (autoCreateAttempted) return
      if (loading) return
      if (!me) return
      if (owned && owned.length > 0) return
      const companyName = me.companyName
      if (!companyName) return

      setAutoCreateAttempted(true)
      try {
        // Best-effort: request backend to create a company and attach the current user as owner.
        const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: companyName }) })
        if (res.ok) {
          push({ type: 'success', message: `Your company ${companyName} was added to your Hub` })
          // Refresh the owned list
          const r = await fetch('/api/companies?filter=owned', { cache: 'no-store' })
          if (r.ok) setOwned(await r.json())
        }
      } catch (e) {
        // ignore non-fatal
        console.warn('auto-create company failed', e)
      }
    }

    ensureCompany()
  }, [loading, me, owned, autoCreateAttempted, push])

  // Offer an explicit CTA for users who already have a companyName in their profile
  async function handleCreateFromProfile() {
    if (!me || !me.companyName) return
    try {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: me.companyName }) })
      if (res.ok) {
        push({ type: 'success', message: `Your company ${me.companyName} was added to your Hub` })
        const r = await fetch('/api/companies?filter=owned', { cache: 'no-store' })
        if (r.ok) setOwned(await r.json())
      } else {
        push({ type: 'error', message: 'Failed to create company — try again' })
      }
    } catch (e) {
      push({ type: 'error', message: 'Failed to create company — try again' })
    }
  }

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const companyCount = owned.length + invited.length

  const { isWide, isCompact } = useViewportZoom()

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
        <div className={`${isWide ? 'w-full px-0' : 'max-w-[1800px] mx-auto'} ${isCompact ? 'px-4' : 'px-16'}`}>

          {/* White Container (expanded: wider, taller; inner content sizes unchanged) */}
          <div className={`relative overflow-visible bg-white rounded-[64px] shadow-[0_6px_18px_rgba(2,6,23,0.04)] ring-1 ring-emerald-50 border border-emerald-100 ${isWide ? 'mx-4 lg:mx-8' : ''} px-6 pt-4 pb-10 min-h-[460px] transform -translate-y-[62px]`}>




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
                <CompanyGrid companies={owned} searchTerm={searchTerm} emptyMessage="No companies yet — create your first one!" me={me} onCreateFromProfile={handleCreateFromProfile} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CompanyGrid({ companies, emptyMessage, searchTerm, me, onCreateFromProfile }: { companies: Company[]; emptyMessage: string; searchTerm?: string; me?: any; onCreateFromProfile?: () => void }) {
  const q = (searchTerm || '').trim().toLowerCase()
  const filtered = q ? companies.filter((c) => c.name.toLowerCase().includes(q)) : companies

  if (!filtered || filtered.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500">
        {q ? <div className="mb-3 text-lg">No companies match that search</div> : null}

        {/* If we detect a companyName in the user's profile, show a create button */}
        {me?.companyName && onCreateFromProfile ? (
          <div className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl max-w-md mx-auto border border-emerald-100">
            <div className="text-lg font-semibold text-slate-800 mb-3">🏢 Your Company is Ready!</div>
            <div className="text-sm text-slate-600 mb-4">
              We detected <strong className="text-emerald-600">{me.companyName}</strong> from your onboarding.
            </div>
            <button 
              onClick={onCreateFromProfile}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ✨ Add to Owner Hub
            </button>
          </div>
        ) : null}

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
