"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function CompanySwitcher({ companies }: { companies: any[] }) {
  const router = useRouter()

  const handleSwitch = async (id: string) => {
    // Defensive idempotent update
    await fetch(`/api/companies/${id}/last-accessed`, { method: 'PATCH' }).catch(() => {})
    // Set local context (cookie) so accounting app knows which company to open
    document.cookie = `hb_company=${id}; path=/`
    // Navigate into accounting app or company dashboard (separation: hub does not embed accounting)
    router.push(`/companies/${id}/dashboard`)
  }

  return (
    <div>
      <select
        aria-label="Company switcher"
        className="border rounded p-2"
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value
          if (v) handleSwitch(v)
        }}
      >
        <option value="">Switch company...</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
