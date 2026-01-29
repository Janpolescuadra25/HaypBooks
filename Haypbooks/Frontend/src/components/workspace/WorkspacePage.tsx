"use client"
import React, { useEffect, useState } from 'react'
import HubCard from './HubCard'
import CompanyModal from './CompanyModal'
import FirmModal from './FirmModal'
import { useRouter } from 'next/navigation'
import { getProfileCached } from '@/lib/profile-cache'

type Company = { id: string; name: string }
type Practice = { id: string; name: string }

export default function WorkspacePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showPracticeModal, setShowPracticeModal] = useState(false)

  useEffect(() => {
    let mounted = true
    getProfileCached().then((p) => {
      if (!mounted) return
      setProfile(p)
      setCompanies((p?.companies || []).map((c: any) => ({ id: c.id || c, name: c.name || c })))
      setPractices((p?.practices || p?.firmList || []).map((f: any) => ({ id: f.id || f, name: f.name || f })))
    })
    return () => { mounted = false }
  }, [])

  const openCompany = (c: Company) => { setSelectedCompany(c); setShowCompanyModal(true) }
  const openPractice = (p: Practice) => { setSelectedPractice(p); setShowPracticeModal(true) }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">HB</div>
            <h1 className="text-xl font-semibold text-slate-900">Welcome back{profile?.name ? `, ${profile.name}` : ''}</h1>
          </div>
          <p className="text-sm text-slate-500">Select a company or practice to continue, or create a new one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HubCard
            title="My Companies"
            subtitle="The ledger of your own enterprises"
            items={companies.map(c => c.name)}
            onItemClick={(idx) => openCompany(companies[idx])}
            ctaLabel="+ Add New Company"
            ctaTestId="add-company"
            onCtaClick={() => {
              // go to company creation flow
              window.location.href = '/companies?create=1'
            }}
          />

          <HubCard
            title="My Practice"
            subtitle="Your professional advisory library"
            items={practices.map(p => p.name)}
            onItemClick={(idx) => openPractice(practices[idx])}
            ctaLabel="+ Open New Firm"
            ctaTestId="open-firm"
            onCtaClick={() => { setSelectedPractice(null); setShowPracticeModal(true) }}
          />
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center">You can switch between Company and Practice views anytime from the top-right user menu.</div>

        {showCompanyModal && selectedCompany && (
          <CompanyModal company={selectedCompany} onClose={() => setShowCompanyModal(false)} />
        )}
        {showPracticeModal && (
          <FirmModal practice={selectedPractice} onClose={() => setShowPracticeModal(false)} />
        )}
      </div>
    </main>
  )
}
