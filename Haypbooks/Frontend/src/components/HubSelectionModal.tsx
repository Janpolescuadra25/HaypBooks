"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function HubSelectionModal({ user, onClose, asPage = false }: { user: any, onClose?: () => void, asPage?: boolean }) {
  const modalRef = React.useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [showAcctForm, setShowAcctForm] = React.useState(false)
  const [firmName, setFirmName] = React.useState('')
  const [firmError, setFirmError] = React.useState('')
  const [isSavingAcct, setIsSavingAcct] = React.useState(false)

  // Basic focus trap: keep focus within modal
  React.useEffect(() => {
    const node = modalRef.current
    if (!node) return
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const first = node.querySelectorAll(focusable)[0] as HTMLElement | undefined
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (!node) return
      if (e.key !== 'Tab') return
      const list = Array.from(node.querySelectorAll(focusable)) as HTMLElement[]
      if (list.length === 0) return
      const idx = list.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey) {
        if (idx === 0) {
          e.preventDefault()
          list[list.length - 1].focus()
        }
      } else {
        if (idx === list.length - 1) {
          e.preventDefault()
          list[0].focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Initial values derived from user props (kept for immediate render), but will be replaced by live fetch
  const ownerCompanies: string[] = (user && (user.companies || user.companiesList)) || ['Acme Corp', 'Beta LLC']
  const [ownerCount, setOwnerCount] = React.useState<number>((user && (user.companies || []).length) || ownerCompanies.length || 0)
  const [clientCountState, setClientCountState] = React.useState<number>((user && (user.clients?.length || user.clientCount)) || 0)

  // Derived flags to know if the user already has an owner/company hub or an accountant hub
  const hasOwnerCompanies = !!(user && ((user.companies && user.companies.length > 0) || (user.companiesList && user.companiesList.length > 0)));
  const hasAccountantHub = !!(user && (user.accountantOnboardingCompleted || user.practiceName || (user.clients && user.clients.length > 0)));
  const userRole = (user && (user.role || (user.isAccountant ? 'accountant' : 'business'))) || null

  const ownerPreview = ownerCompanies.slice(0, 2)
  const ownerMore = Math.max(0, ownerCompanies.length - ownerPreview.length)
  const practiceFirms: string[] = (user && (user.practiceFirms || user.practiceFirmsList)) || ['Hayp Advisory', 'Global Tax Group']
  const practicePreview = practiceFirms.slice(0, 2)
  const practiceMore = Math.max(0, practiceFirms.length - practicePreview.length)

  // Fetch live counts and poll every 15s when modal or page mounts
  React.useEffect(() => {
    let mounted = true
    let timer: ReturnType<typeof setInterval> | null = null

    async function fetchCounts() {
      try {
        const r1 = await fetch('/api/companies?filter=owned', { cache: 'no-store' })
        if (r1.ok) {
          const data = await r1.json()
          if (mounted) setOwnerCount(Array.isArray(data) ? data.length : 0)
        }

        const r2 = await fetch('/api/tenants/clients', { cache: 'no-store' })
        if (r2.ok) {
          const d2 = await r2.json()
          if (mounted) setClientCountState(Array.isArray(d2) ? d2.length : 0)
        }
      } catch (e) {
        console.error('[HubSelectionModal] Failed to fetch live counts', e)
      }
    }

    fetchCounts()
    timer = setInterval(fetchCounts, 15_000)
    return () => { mounted = false; if (timer) clearInterval(timer) }
  }, [])

  async function submitAccountantForm() {
    if (!firmName.trim()) { setFirmError('Accountant Workspace name is required'); return }
    setFirmError('')
    setIsSavingAcct(true)
    try {
      // Save a business step for the accountant hub if needed
      await fetch('/api/onboarding/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'accountant_firm', data: { firmName } }) })
      const res = await fetch('/api/onboarding/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'full', hub: 'ACCOUNTANT', details: { firmName } }) })
      if (!res.ok) throw new Error('Failed to complete onboarding')

      // Analytics (best-effort)
      try { (await import('@/lib/analytics')).trackEvent('accountant_workspace_saved', { source: 'hub-modal' }) } catch (e) {}

      // Also set preferred hub server-side
      await fetch('/api/users/preferred-hub', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferredHub: 'ACCOUNTANT' }) })

      // update localStorage user if present
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user')
        if (u) {
          try { const parsed = JSON.parse(u); parsed.preferredHub = 'ACCOUNTANT'; parsed.accountantOnboardingCompleted = true; localStorage.setItem('user', JSON.stringify(parsed)) } catch {} 
        }
      }

      router.replace('/dashboard')
    } catch (e) {
      console.error('Failed to complete accountant onboarding', e)
      alert('Failed to complete onboarding. Please try again.')
      setIsSavingAcct(false)
    }
  }

  async function chooseHub(hub: 'OWNER' | 'ACCOUNTANT') {
    // If choosing accountant and onboarding is incomplete, show inline form
    if (hub === 'ACCOUNTANT' && !(user as any)?.accountantOnboardingCompleted) {
      setShowAcctForm(true)
      return
    }

    setLoading(true)
    try {
      await fetch('/api/users/preferred-hub', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferredHub: hub }) })
      // update localStorage user if present
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user')
        if (u) {
          try { const parsed = JSON.parse(u); parsed.preferredHub = hub; localStorage.setItem('user', JSON.stringify(parsed)) } catch {} 
        }
      }
      // Redirect to chosen hub
      // Redirect to unified Dashboard
      router.replace('/dashboard')
    } catch (e) {
      console.error('Failed to set preferred hub', e)
      alert('Failed to set preferred hub. Please try again.')
      setLoading(false)
    }
  }

  if (asPage) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">HB</div>
            <h1 className="text-xl font-semibold text-slate-900">HaypBooks</h1>
          </div>
          <p className="text-sm text-slate-500">Choose your hub to continue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col" aria-labelledby="owner-workspace-title" role="region">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <div>
                <h3 id="owner-workspace-title" className="text-base font-semibold text-slate-900">My Companies</h3>
                <p className="text-xs text-slate-500">The ledger of your own enterprises.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">Track internal transactions and manage the operational history of your businesses.</p>

            <ul className="mt-4 space-y-2">
              {ownerPreview.map((c, i) => (
                <li key={i} className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{c}</li>
              ))}
              {ownerMore > 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">+{ownerMore} more</li>
              )}
              {ownerPreview.length === 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">No companies yet</li>
              )}
            </ul>

            <div className="mt-auto pt-6">
              {(!hasOwnerCompanies && userRole === 'accountant') ? (
                <button data-testid="create-company" onClick={() => router.replace('/companies?create=1')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">ADD NEW VOLUME</button>
              ) : (
                <button data-testid="enter-owner" disabled={loading} onClick={() => chooseHub('OWNER')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">ADD NEW VOLUME</button>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col" aria-labelledby="acct-hub-title" role="region">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 8h14M5 16h14"/></svg>
              </div>
              <div>
                <h3 id="acct-hub-title" className="text-base font-semibold text-slate-900">My Practice</h3>
                <p className="text-xs text-slate-500">Your professional advisory library.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">Curate and manage client portfolios, firm accounts, and specialized billing flows.</p>

            <ul className="mt-4 space-y-2">
              {practicePreview.map((c, i) => (
                <li key={i} className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{c}</li>
              ))}
              {practiceMore > 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">+{practiceMore} more</li>
              )}
              {practicePreview.length === 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{clientCountState} active clients</li>
              )}
            </ul>

            <div className="mt-auto pt-6">
              {!showAcctForm ? (
                hasAccountantHub ? (
                  <button data-testid="enter-acct" disabled={loading} onClick={() => chooseHub('ACCOUNTANT')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">OPEN NEW FIRM</button>
                ) : (
                  <button data-testid="create-acct" onClick={() => setShowAcctForm(true)} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">OPEN NEW FIRM</button>
                )
              ) : (
                <div className="space-y-2">
                  <label htmlFor="acctFirmName" className="block text-xs font-medium">Accountant Workspace name</label>
                  <input id="acctFirmName" name="acctFirmName" aria-label="Accountant Workspace name" value={firmName} onChange={(e) => { setFirmName(e.target.value); setFirmError('') }} placeholder="e.g., Maria Santos Accounting" className={`w-full px-2 py-2 border rounded ${firmError ? 'border-red-500' : 'border-slate-200'} text-sm`} />
                  {firmError && <p className="text-xs text-red-600">{firmError}</p>}
                  <div className="flex gap-2 items-center">
                    <button onClick={submitAccountantForm} disabled={isSavingAcct} className="btn-primary flex-1 text-sm">{isSavingAcct ? 'Saving…' : 'Finish setup'}</button>
                    <button onClick={() => setShowAcctForm(false)} disabled={isSavingAcct} className="btn-secondary text-sm">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center">You can switch hubs anytime from the top-right menu.</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="hub-select-title" className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="hub-select-title" className="text-lg font-bold">Choose how you want to use HaypBooks today</h2>
            <p id="hub-select-desc" className="text-sm text-slate-600 mt-1">You can switch anytime from the top-right menu. Only one hub is active at a time.</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col" aria-labelledby="owner-workspace-title" role="region">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <div>
                <h3 id="owner-workspace-title" className="text-base font-semibold text-slate-900">My Companies</h3>
                <p className="text-xs text-slate-500">The ledger of your own enterprises.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">Track internal transactions and manage the operational history of your businesses.</p>

            <ul className="mt-4 space-y-2">
              {ownerPreview.map((c, i) => (
                <li key={i} className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{c}</li>
              ))}
              {ownerMore > 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">+{ownerMore} more</li>
              )}
              {ownerPreview.length === 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">No companies yet</li>
              )}
            </ul>

            <div className="mt-auto pt-6">
              {(!hasOwnerCompanies && userRole === 'accountant') ? (
                <button data-testid="create-company" onClick={() => router.replace('/companies?create=1')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">ADD NEW VOLUME</button>
              ) : (
                <button data-testid="enter-owner" disabled={loading} onClick={() => chooseHub('OWNER')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">ADD NEW VOLUME</button>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col" aria-labelledby="acct-hub-title" role="region">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 8h14M5 16h14"/></svg>
              </div>
              <div>
                <h3 id="acct-hub-title" className="text-base font-semibold text-slate-900">My Practice</h3>
                <p className="text-xs text-slate-500">Your professional advisory library.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">Curate and manage client portfolios, firm accounts, and specialized billing flows.</p>

            <ul className="mt-4 space-y-2">
              {practicePreview.map((c, i) => (
                <li key={i} className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{c}</li>
              ))}
              {practiceMore > 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">+{practiceMore} more</li>
              )}
              {practicePreview.length === 0 && (
                <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm font-medium">{clientCountState} active clients</li>
              )}
            </ul>

            <div className="mt-auto pt-6">
              {!showAcctForm ? (
                hasAccountantHub ? (
                  <button data-testid="enter-acct" disabled={loading} onClick={() => chooseHub('ACCOUNTANT')} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">OPEN NEW FIRM</button>
                ) : (
                  <button data-testid="create-acct" onClick={() => setShowAcctForm(true)} className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide hover:bg-emerald-700">OPEN NEW FIRM</button>
                )
              ) : (
                <div className="space-y-3">
                  <label htmlFor="acctFirmName" className="block text-sm font-medium">Accountant Workspace name</label>
                  <input id="acctFirmName" name="acctFirmName" aria-label="Accountant Workspace name" value={firmName} onChange={(e) => { setFirmName(e.target.value); setFirmError('') }} placeholder="e.g., Maria Santos Accounting" className={`w-full px-3 py-2 border rounded ${firmError ? 'border-red-500' : 'border-slate-200'}`} />
                  {firmError && <p className="text-sm text-red-600">{firmError}</p>}
                  <div className="flex gap-2 items-center">
                    <button onClick={submitAccountantForm} disabled={isSavingAcct} className="btn-primary flex-1">{isSavingAcct ? 'Saving…' : 'Finish setup'}</button>
                    <button onClick={() => setShowAcctForm(false)} disabled={isSavingAcct} className="btn-secondary">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">You can switch hubs anytime from the top-right menu. Selecting a hub sets it as your preferred hub for future logins.</div>
      </div>
    </div>
  )
}