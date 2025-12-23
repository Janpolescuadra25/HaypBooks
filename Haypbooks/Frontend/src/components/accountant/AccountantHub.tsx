'use client'
import { useEffect, useState } from 'react'
import UserMenu from '@/components/UserMenu'

type Client = { id: string; name: string; role?: string; lastAccessedAt?: string; status?: string }

export default function AccountantHub() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/companies?filter=invited', { cache: 'no-store' })
        if (!mounted) return
        if (res.ok) setClients(await res.json())
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
          <h1 className="text-2xl font-bold">Clients & Practice</h1>
          <p className="text-sm text-slate-600">Manage your practice and client list</p>
        </div>
        <div>
          <UserMenu />
        </div>
      </header>

      <section>
        {loading ? (
          <div className="text-slate-500">Loading…</div>
        ) : (
          <div>
            {clients.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No clients yet — invite your first client</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c) => (
                  <div key={c.id} className="p-4 border rounded-lg bg-white">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-slate-500">{c.role || 'Client'}</div>
                    <div className="text-xs text-slate-400 mt-1">{c.lastAccessedAt ? `Last: ${new Date(c.lastAccessedAt).toLocaleString()}` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
