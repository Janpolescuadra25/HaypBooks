"use client"
import React, { useEffect, useState } from 'react'
import CompanyList from '../../components/companies/CompanyList'
import InviteBanner from '../../components/companies/InviteBanner'
import CompanySwitcher from '../../components/companies/CompanySwitcher'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/companies')
        const json = await res.json()
        if (!mounted) return
        setCompanies(json.companies || [])
        // minimal invites endpoint for banner
        const ires = await fetch('/api/companies/invites')
        const ij = await ires.json().catch(()=>({invites:[]}))
        setInvites(ij.invites || [])
      } catch (e) {
        console.error('Failed to load companies', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Companies & Clients</h1>
        <div className="flex items-center gap-4">
          <CompanySwitcher companies={companies} />
          <button className="btn btn-primary">Create New Company</button>
        </div>
      </header>

      <InviteBanner invites={invites} />

      {loading ? (
        <div>Loading companies…</div>
      ) : (
        <CompanyList companies={companies} />
      )}
    </div>
  )
}
