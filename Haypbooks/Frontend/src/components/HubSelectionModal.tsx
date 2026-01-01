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

  const ownerCompanies: string[] = (user && (user.companies || user.companiesList)) || ['Acme Corp', 'Beta LLC']
  const practiceName: string = (user && (user.practiceName || user.firmName)) || 'Rivera CPA'
  const clientCount: number = (user && (user.clients?.length || user.clientCount)) || 12

  // Derived flags to know if the user already has an owner/company hub or an accountant hub
  const hasOwnerCompanies = !!(user && ((user.companies && user.companies.length > 0) || (user.companiesList && user.companiesList.length > 0)));
  const hasAccountantHub = !!(user && (user.accountantOnboardingCompleted || user.practiceName || (user.clients && user.clients.length > 0)));
  const userRole = (user && (user.role || (user.isAccountant ? 'accountant' : 'business'))) || null

  async function submitAccountantForm() {
    if (!firmName.trim()) { setFirmError('Firm name is required'); return }
    setFirmError('')
    setLoading(true)
    try {
      // Save a business step for the accountant hub if needed
      await fetch('/api/onboarding/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'accountant_firm', data: { firmName } }) })
      const res = await fetch('/api/onboarding/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'full', hub: 'ACCOUNTANT', details: { firmName } }) })
      if (!res.ok) throw new Error('Failed to complete onboarding')
      // Also set preferred hub server-side
      await fetch('/api/users/preferred-hub', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferredHub: 'ACCOUNTANT' }) })

      // update localStorage user if present
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user')
        if (u) {
          try { const parsed = JSON.parse(u); parsed.preferredHub = 'ACCOUNTANT'; parsed.accountantOnboardingCompleted = true; localStorage.setItem('user', JSON.stringify(parsed)) } catch {} 
        }
      }

      router.replace('/hub/accountant')
    } catch (e) {
      console.error('Failed to complete accountant onboarding', e)
      alert('Failed to complete onboarding. Please try again.')
      setLoading(false)
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
      if (hub === 'ACCOUNTANT') router.replace('/hub/accountant')
      else router.replace('/hub/companies')
    } catch (e) {
      console.error('Failed to set preferred hub', e)
      alert('Failed to set preferred hub. Please try again.')
      setLoading(false)
    }
  }

  if (asPage) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white rounded-2xl mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"><span className="text-2xl font-bold text-emerald-600">HB</span></div>
            <h1 className="text-lg font-bold">Welcome back{user?.name ? `, ${user.name}` : ''} 👋</h1>
          </div>
          <p className="text-xs text-white/90 text-center">Choose how you'd like to use HaypBooks today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 flex flex-col justify-between" aria-labelledby="owner-hub-title" role="region">
            <div>
              <h3 id="owner-hub-title" className="text-sm font-medium">For Owners</h3>
              <div className="text-xs text-slate-600 mt-1">My Companies</div>
              <p className="text-xs text-slate-700 mt-2">{ownerCompanies.slice(0,3).join(', ')}{ownerCompanies.length > 3 ? '…' : ''}</p>
            </div>
            <div className="mt-3 space-y-2">
              {(!hasOwnerCompanies && userRole === 'accountant') ? (
                <button data-testid="create-company" onClick={() => router.replace('/companies?create=1')} className="w-full bg-amber-500 text-white px-3 py-2 rounded-md text-sm">Create Company</button>
              ) : (
                <button data-testid="enter-owner" disabled={loading} onClick={() => chooseHub('OWNER')} className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm">Enter Owner Hub</button>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col justify-between" aria-labelledby="acct-hub-title" role="region">
            <div>
              <h3 id="acct-hub-title" className="text-sm font-medium">For Accountants</h3>
              <div className="text-xs text-slate-600 mt-1">My Practice</div>
              <p className="text-xs text-slate-700 mt-2"><strong>{practiceName}</strong> • {clientCount} clients</p>
            </div>
            <div className="mt-3">
              {!showAcctForm ? (
                hasAccountantHub ? (
                  <button data-testid="enter-acct" disabled={loading} onClick={() => chooseHub('ACCOUNTANT')} className="w-full bg-emerald-600 text-white px-3 py-2 rounded-md text-sm">Enter Accountant Hub</button>
                ) : (
                  <button data-testid="create-acct" onClick={() => setShowAcctForm(true)} className="w-full bg-emerald-600 text-white px-3 py-2 rounded-md text-sm">Create Accountant Hub</button>
                )
              ) : (
                <div className="space-y-2">
                  <label htmlFor="acctFirmName" className="block text-xs font-medium">Firm name</label>
                  <input id="acctFirmName" name="acctFirmName" aria-label="Firm name" value={firmName} onChange={(e) => { setFirmName(e.target.value); setFirmError('') }} placeholder="Your firm name" className={`w-full px-2 py-2 border rounded ${firmError ? 'border-red-500' : 'border-slate-200'} text-sm`} />
                  {firmError && <p className="text-xs text-red-600">{firmError}</p>}
                  <div className="flex gap-2">
                    <button onClick={submitAccountantForm} disabled={loading} className="btn-primary flex-1 text-sm">{loading ? 'Saving…' : 'Finish setup'}</button>
                    <button onClick={() => setShowAcctForm(false)} disabled={loading} className="btn-secondary text-sm">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 text-center">You can switch hubs anytime from the top-right menu.</div>
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
          <div className="border rounded-lg p-6 flex flex-col justify-between" aria-labelledby="owner-hub-title" role="region">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.5" className="flex-shrink-0"><path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                <div>
                  <h3 id="owner-hub-title" className="text-md font-semibold">For Owners</h3>
                  <div className="text-sm text-slate-600">My Companies</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">Manage your businesses, subscriptions, teams, and accounting books.</p>

              <ul className="mt-3 text-sm text-slate-700 list-disc list-inside space-y-1">
                {ownerCompanies.map((c, i) => <li key={i}>{c}</li>)}
                <li className="text-emerald-600 hover:underline cursor-pointer">+ Create new</li>
              </ul>
            </div>
            <div className="mt-4 space-y-3">
              {(!hasOwnerCompanies && userRole === 'accountant') ? (
                <button data-testid="create-company" onClick={() => router.replace('/companies?create=1')} className="w-full bg-amber-500 text-white px-4 py-3 rounded-lg font-semibold shadow">Create Company</button>
              ) : (
                <button data-testid="enter-owner" disabled={loading} onClick={() => chooseHub('OWNER')} className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow">Enter Owner Hub</button>
              )}
              <button data-testid="create-business" onClick={() => router.replace('/companies?create=1')} className="w-full border border-slate-200 text-slate-800 px-4 py-3 rounded-lg font-medium">Create Business Account</button>
            </div>
          </div>

          <div className="border rounded-lg p-6 flex flex-col justify-between" aria-labelledby="acct-hub-title" role="region">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.5" className="flex-shrink-0"><rect x="3" y="4" width="18" height="16" rx="2"/></svg>
                <div>
                  <h3 id="acct-hub-title" className="text-md font-semibold">For Accountants</h3>
                  <div className="text-sm text-slate-600">My Practice</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">Manage your clients, tasks, and accounting.</p>

              <ul className="mt-3 text-sm text-slate-700 list-disc list-inside space-y-1">
                <li><strong>{practiceName}</strong></li>
                <li>{clientCount} clients</li>
              </ul>
            </div>
            <div className="mt-4">
              {!showAcctForm ? (
                hasAccountantHub ? (
                  <button data-testid="enter-acct" disabled={loading} onClick={() => chooseHub('ACCOUNTANT')} className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold shadow">Enter Accountant Hub</button>
                ) : (
                  <button data-testid="create-acct" onClick={() => setShowAcctForm(true)} className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold shadow">Create Accountant Hub</button>
                )
              ) : (
                <div className="space-y-3">
                  <label htmlFor="acctFirmName" className="block text-sm font-medium">Firm name</label>
                  <input id="acctFirmName" name="acctFirmName" aria-label="Firm name" value={firmName} onChange={(e) => { setFirmName(e.target.value); setFirmError('') }} placeholder="Your firm name" className={`w-full px-3 py-2 border rounded ${firmError ? 'border-red-500' : 'border-slate-200'}`} />
                  {firmError && <p className="text-sm text-red-600">{firmError}</p>}
                  <div className="flex gap-2">
                    <button onClick={submitAccountantForm} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving…' : 'Finish setup'}</button>
                    <button onClick={() => setShowAcctForm(false)} disabled={loading} className="btn-secondary">Back</button>
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