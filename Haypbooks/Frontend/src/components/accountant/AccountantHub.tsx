'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const TopBar = dynamic(() => import('@/components/accountant/AccountantTopBar'), { ssr: false })
import Link from 'next/link'
import { useToast } from '@/components/ToastProvider'

type Client = { 
  tenantId: string
  tenantName: string
  role?: string
  lastAccessedAt?: string
  companiesCount: number
  companies: Array<{ id: string; name: string }>
}

export default function AccountantHub() {
  const router = useRouter()
  const { push: pushToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadClients = async () => {
    setLoading(true)
    try {
      // Fetch clients
      const res = await fetch('/api/tenants/clients', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        console.log('[AccountantHub] Loaded clients:', data)
        setClients(data)
      } else {
        console.error('[AccountantHub] Failed to fetch clients:', res.status)
      }

      // Fetch pending invites count
      try {
        const invRes = await fetch('/api/tenants/invites/pending', { cache: 'no-store' })
        if (invRes.ok) {
          const invites = await invRes.json()
          setPendingCount(invites.length)
        }
      } catch (e) {
        console.error('[AccountantHub] Failed to fetch pending invites:', e)
      }
    } catch (e) {
      console.error('[AccountantHub] Error loading clients:', e)
      pushToast({ type: 'error', message: 'Failed to load clients' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      await loadClients()
    }
    if (mounted) load()
    return () => { mounted = false }
  }, [])

  const handleAccessClient = async (tenantId: string) => {
    try {
      await fetch(`/api/tenants/${tenantId}/access`, { method: 'POST' })
      pushToast({ type: 'success', message: 'Switched to client tenant' })
      // Navigate to client's company selection or first company
      router.push('/hub/selection')
    } catch (e) {
      console.error('Failed to update last accessed', e)
      pushToast({ type: 'error', message: 'Failed to switch to client' })
    }
  }

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients
    const term = searchTerm.toLowerCase()
    return clients.filter(c => 
      c.tenantName.toLowerCase().includes(term) || 
      c.companies.some(co => co.name.toLowerCase().includes(term))
    )
  }, [clients, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-[1800px] mx-auto px-16">
          
          {/* White Container - matching Owner Workspace style */}
          <div className="relative overflow-visible bg-white rounded-[64px] shadow-[0_6px_18px_rgba(2,6,23,0.04)] ring-1 ring-emerald-50 border border-emerald-100 px-6 pt-6 pb-10 min-h-[460px] transform -translate-y-[62px]">
            
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
                  <p className="text-slate-600 mt-1">Manage your client accounts</p>
                </div>
                <div className="flex items-center gap-3">
                  {pendingCount > 0 && (
                    <Link 
                      href="/hub/invites" 
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {pendingCount} {pendingCount === 1 ? 'Invitation' : 'Invitations'}
                    </Link>
                  )}
                  <button
                    onClick={() => loadClients()}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Refresh clients list"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search clients or companies..."
                      className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <svg 
                      className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setSearchInput('') }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </form>
              </div>
            </header>

            <section>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-500 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading clients…
              </div>
            </div>
          ) : (
            <div>
              {clients.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No clients yet</h3>
                  <p className="text-slate-500 mb-1">You'll see clients here once business owners invite you</p>
                  <p className="text-sm text-slate-400">Check your email for invitation links</p>
                  {pendingCount > 0 && (
                    <Link 
                      href="/hub/invites"
                      className="mt-6 inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      View {pendingCount} Pending {pendingCount === 1 ? 'Invitation' : 'Invitations'}
                    </Link>
                  )}
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No matches found</h3>
                  <p className="text-slate-500">Try a different search term</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSearchInput('') }}
                    className="mt-4 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-slate-600">
                    {searchTerm ? (
                      <span>Found {filteredClients.length} of {clients.length} clients</span>
                    ) : (
                      <span>{clients.length} {clients.length === 1 ? 'client' : 'clients'} total</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                      <div 
                        key={client.tenantId} 
                        className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900 mb-1">{client.tenantName}</h3>
                              <p className="text-sm text-slate-500">{client.role || 'Accountant'}</p>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-slate-600">
                              <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{client.companiesCount} {client.companiesCount === 1 ? 'company' : 'companies'}</span>
                            </div>
                            {client.lastAccessedAt && (
                              <div className="flex items-center text-sm text-slate-600">
                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Last: {new Date(client.lastAccessedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {client.companies.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Companies</p>
                              <div className="space-y-1">
                                {client.companies.slice(0, 3).map(co => (
                                  <div key={co.id} className="text-sm text-slate-700 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                    {co.name}
                                  </div>
                                ))}
                                {client.companies.length > 3 && (
                                  <div className="text-xs text-slate-500 ml-3.5">
                                    +{client.companies.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => handleAccessClient(client.tenantId)}
                            className="w-full px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Client
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
        
        </div>
        </div>
      </main>
    </div>
  )
}
