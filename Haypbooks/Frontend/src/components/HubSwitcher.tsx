'use client'
import { useEffect, useState } from 'react'
import { getProfileCached } from '@/lib/profile-cache'

export default function HubSwitcher() {
  const [current, setCurrent] = useState<'OWNER'|'ACCOUNTANT'|null>(null)
  const [available, setAvailable] = useState<Array<'OWNER'|'ACCOUNTANT'>>([])

  useEffect(() => {
    let mounted = true
    getProfileCached().then((p) => {
      if (!mounted) return
      const hubs: Array<'OWNER'|'ACCOUNTANT'> = ['OWNER']
      if (p?.isAccountant) hubs.push('ACCOUNTANT')
      setAvailable(hubs)
      setCurrent((p?.preferredHub as any) || (p?.isAccountant ? 'ACCOUNTANT' : 'OWNER'))
    })
    return () => { mounted = false }
  }, [])

  if (!current || available.length <= 1) return null

  async function switchHub(hub: 'OWNER'|'ACCOUNTANT') {
    try {
      await fetch('/api/users/preferred-hub', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferredHub: hub }) })
      // Navigate to the hub
      if (hub === 'ACCOUNTANT') location.href = '/hub/accountant'
      else location.href = '/hub/companies'
    } catch (e) {
      console.error(e)
      alert('Failed to switch hub')
    }
  }

  return (
    <div className="relative">
      <button aria-haspopup="true" aria-label="Switch hub" className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700 px-3 py-1" onClick={() => { /* toggle via simple prompt */ const other = current === 'OWNER' ? 'ACCOUNTANT' : 'OWNER'; if (confirm(`Switch to ${other === 'OWNER' ? 'Owner' : 'Accountant'} Hub?`)) switchHub(other as any) }}>
        {current === 'OWNER' ? 'Owner Hub' : 'Accountant Hub'}
      </button>
    </div>
  )
}
