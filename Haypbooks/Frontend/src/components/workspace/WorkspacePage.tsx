"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Plus, ChevronRight, Search, Calculator, FileText, Receipt, Landmark, PieChart, Coins, TrendingUp, Briefcase } from 'lucide-react'
import CompanyModal from './CompanyModal'
import { getProfileCached } from '@/lib/profile-cache'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ToastProvider'

type Company = { id: string; name: string }
type Practice = { id: string; name: string }

// ─── Background Effects ───────────────────────────────────────────────────────
const DUST_COUNT = 60

const FLOAT_ICONS = [
  { Icon: Calculator, size: 48 },
  { Icon: FileText, size: 54 },
  { Icon: Receipt, size: 42 },
  { Icon: Landmark, size: 60 },
  { Icon: PieChart, size: 52 },
  { Icon: Coins, size: 40 },
  { Icon: TrendingUp, size: 58 },
  { Icon: Briefcase, size: 48 },
  { Icon: Calculator, size: 40 },
  { Icon: FileText, size: 45 },
  { Icon: Receipt, size: 38 },
  { Icon: Landmark, size: 50 },
]

function BackgroundEffects() {
  const dustParticles = useMemo(() =>
    Array.from({ length: DUST_COUNT }).map(() => ({
      startX: Math.random() * 100 + '%',
      startY: Math.random() * 100 + '%',
      size: Math.random() * 4 + 4,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -30,
      moveX: (Math.random() - 0.5) * 400,
      moveY: (Math.random() - 0.5) * 400,
    })), [])

  const floatingIcons = useMemo(() =>
    FLOAT_ICONS.map(item => ({
      ...item,
      startX: Math.random() * 100 + '%',
      startY: Math.random() * 100 + '%',
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -40,
      moveX: (Math.random() - 0.5) * 300,
      moveY: (Math.random() - 0.5) * 300,
      rotate: Math.random() * 360,
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

      {/* Moving flashlight */}
      <motion.div
        animate={{
          x: ['-20%', '20%', '20%', '-20%', '-20%'],
          y: ['-20%', '-20%', '20%', '20%', '-20%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full blur-[60px] z-[-1]"
        style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 70%)' }}
      />

      {/* Floating accounting icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={`icon-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            x: [0, item.moveX],
            y: [0, item.moveY],
            opacity: [0, 0.4, 0.4, 0],
            rotate: [item.rotate, item.rotate + 45, item.rotate - 45, item.rotate],
            scale: [0.8, 1, 1, 0.8],
          }}
          transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
          className="absolute text-emerald-600/50"
          style={{ left: item.startX, top: item.startY }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}

      {/* Floating dust particles */}
      {dustParticles.map((d, i) => (
        <motion.div
          key={`dust-${i}`}
          animate={{
            x: [0, d.moveX],
            y: [0, d.moveY],
            opacity: [0, 0.8, 0.8, 0],
            scale: [1, 1.5, 1.5, 1],
          }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
          className="absolute bg-emerald-400/50 rounded-full blur-[0.5px]"
          style={{ width: d.size, height: d.size, left: d.startX, top: d.startY }}
        />
      ))}
    </div>
  )
}

// ─── Book Card ────────────────────────────────────────────────────────────────
interface BookCardProps {
  title: string
  subtitle: string
  items: Array<{ id: string; name: string; meta?: string }>
  emptyText: string
  buttonText: string
  ctaTestId?: string
  color: string
  accentColor: string
  delay: number
  isExpanded: boolean
  onExpand: () => void
  onItemClick: (idx: number) => void
  onCtaClick: () => void
}

function BookCard({
  title, subtitle, items, emptyText, buttonText, ctaTestId,
  color, accentColor, delay, isExpanded, onExpand, onItemClick, onCtaClick,
}: BookCardProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: delay > 0.1 ? 20 : -20 }}
      animate={{ opacity: 1, x: 0, flex: isExpanded ? 2 : 0.4 }}
      transition={{
        flex: { type: 'spring', stiffness: 300, damping: 35 },
        opacity: { delay, duration: 0.3 },
        x: { delay, duration: 0.3 },
      }}
      whileHover={!isExpanded ? { scale: 1.01 } : {}}
      onClick={() => !isExpanded && onExpand()}
      className={`relative group cursor-pointer flex flex-col ${!isExpanded ? 'opacity-70 hover:opacity-100' : ''} min-w-[100px]`}
    >
      {/* Pages effect behind the book */}
      <motion.div
        animate={{ opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-white rounded-r-lg translate-x-2 translate-y-1 shadow-md border-r-2 border-slate-200"
      />
      <motion.div
        animate={{ opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-white rounded-r-lg translate-x-1 translate-y-0.5 shadow-sm border-r border-slate-100"
      />

      {/* Book cover */}
      <motion.div className={`relative h-full ${color} rounded-l-md rounded-r-xl shadow-xl overflow-hidden flex flex-col border-l-8 border-black/20`}>
        {/* Spine crease */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-black/10 shadow-[2px_0_4px_rgba(0,0,0,0.1)]" />

        {/* Bookmark ribbon */}
        <motion.div
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-0 right-8 w-6 h-12 bg-white/20 backdrop-blur-sm rounded-b-sm flex items-end justify-center pb-2"
        >
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </motion.div>

        {/* Cover content */}
        <div className={`p-6 pt-10 flex-grow flex flex-col ${!isExpanded ? 'items-center justify-center' : ''}`}>
          {isExpanded ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-white tracking-tight leading-tight mb-1">{title}</h2>
              <p className="text-white/70 font-medium text-sm mb-4">{subtitle}</p>

              <div className="flex-grow flex flex-col min-h-0">
                {items.length > 0 ? (
                  <div className="bg-[#fdfbf7] rounded-xl p-3 border border-black/5 flex flex-col min-h-0">
                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a372]/20 focus:border-[#00a372] transition-all"
                      />
                    </div>

                    {/* Scrollable table */}
                    <div className="overflow-y-auto pr-1 max-h-[260px]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
                      {filteredItems.length > 0 ? (
                        <table className="w-full text-xs text-slate-800">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="py-2 text-left">Name</th>
                              <th className="py-2 text-left">Meta</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredItems.map(item => (
                              <tr
                                key={item.id}
                                onClick={e => { e.stopPropagation(); onItemClick(items.findIndex(i => i.id === item.id)) }}
                                className="cursor-pointer hover:bg-emerald-50"
                              >
                                <td className="py-2 px-2">
                                  <span className="font-bold group-hover/item:text-[#00a372] transition-colors">{item.name}</span>
                                </td>
                                <td className="py-2 px-2">
                                  {item.meta || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="py-6 text-center text-slate-400 text-[10px] italic">No matching entries found</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/10 backdrop-blur-md rounded-xl p-4 text-white/90 font-medium border border-white/10 shadow-inner text-sm">
                    {emptyText}
                  </div>
                )}

                <div className="mt-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    data-testid={ctaTestId}
                    onClick={e => { e.stopPropagation(); onCtaClick() }}
                    className={`w-full ${accentColor} hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg border border-white/10`}
                  >
                    <Plus size={18} strokeWidth={3} />
                    <span className="uppercase tracking-widest text-[10px]">{buttonText}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <h2 className="text-white font-bold text-lg whitespace-nowrap rotate-90 origin-center tracking-widest uppercase">
                {title}
              </h2>
              <div className="mt-12 text-white/30">
                <ChevronRight size={24} className={delay > 0.1 ? 'rotate-180' : ''} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Decorative gold line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
    </motion.div>
  )
}

export { BookCard }

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkspacePage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { push } = useToast()

  async function handleSwitchAccount() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      try {
        await authService.logout()
        push({ type: 'success', message: 'Signed out' })
        await new Promise((res) => setTimeout(res, 450))
      } catch (e) {
        push({ type: 'error', message: 'Sign out failed — redirecting to Sign in' })
        await new Promise((res) => setTimeout(res, 80))
      }
    } finally {
      setIsLoggingOut(false)
      try { router.replace('/login') } catch (e) { }
    }
  }
  const [profile, setProfile] = useState<any>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [expandedBook, setExpandedBook] = useState<'companies' | 'practice'>('companies')

  const reloadProfile = useCallback(async () => {
    try {
      const apiClient = (await import('@/lib/api-client')).default
      const res = await apiClient.get('/api/users/me')
      const p = res.data
      setProfile(p)
      setCompanies((p?.companies || []).map((c: any) => ({ id: c.id || c, name: c.name || c })))
      setPractices((p?.practices || p?.firmList || []).map((f: any) => ({ id: f.id || f, name: f.name || f })))
      if (p?.preferredHub === 'ACCOUNTANT') {
        setExpandedBook('practice')
      } else {
        setExpandedBook('companies')
      }
    } catch (err) {
      console.error('[WORKSPACE] reloadProfile failed:', err)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    reloadProfile().catch(err => {
      console.error('[WORKSPACE] Error loading profile:', err)
    })

    return () => { mounted = false }
  }, [reloadProfile])

  const openCompany = (idx: number) => { setSelectedCompany(companies[idx]); setShowCompanyModal(true) }
  const openPractice = (idx: number) => {
    // navigate directly to practice hub with selected practice id
    const pr = practices[idx]
    if (pr?.id) {
      router.push(`/practice-hub?practiceId=${pr.id}`)
    } else {
      router.push('/practice-hub')
    }
  }

  return (
    <div
      className="relative min-h-screen font-sans text-slate-200 flex flex-col items-center pt-8 px-6 pb-12 overflow-x-hidden"
      style={{ background: 'radial-gradient(circle at center, #064e3b 0%, #022c22 100%)' }}
    >
      <BackgroundEffects />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center mb-8"
      >
        <div className="w-12 h-12 bg-[#00a372] rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg ring-4 ring-white/10">
          HB
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-slate-400 mt-0.5 text-center max-w-md font-medium text-sm">
          Select a volume from your collection to continue.
        </p>
      </motion.div>

      {/* Book cards */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 w-full max-w-6xl items-stretch justify-center min-h-[580px]">
        <BookCard
          title="My Companies"
          subtitle="The ledger of your own enterprises"
          items={companies.map(c => ({ id: c.id, name: c.name }))}
          emptyText="No entries in this ledger yet"
          buttonText="Add New Company"
          ctaTestId="add-company"
          color="bg-[#1a8a68]"
          accentColor="bg-[#0f6b50]"
          delay={0.1}
          isExpanded={expandedBook === 'companies'}
          onExpand={() => setExpandedBook('companies')}
          onItemClick={openCompany}
          onCtaClick={() => { router.push('/onboarding/business') }}
        />

        <BookCard
          title="My Practice"
          subtitle="Your professional advisory library"
          items={practices.map(p => ({ id: p.id, name: p.name }))}
          emptyText="Your library is currently empty"
          buttonText="New Practice"
          ctaTestId="open-firm"
          color="bg-[#22c58b]"
          accentColor="bg-[#19a372]"
          delay={0.2}
          isExpanded={expandedBook === 'practice'}
          onExpand={() => setExpandedBook('practice')}
          onItemClick={openPractice}
          onCtaClick={() => router.push('/onboarding/practice?newPractice=true')}
        />
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-slate-400 text-sm mt-10 text-center max-w-lg leading-relaxed font-medium"
      >
        You can switch between Company and Practice views anytime from the top-right user menu.
      </motion.p>

      <div className="relative z-10 text-center mt-6">
        <button
          data-testid="switch-account"
          disabled={isLoggingOut}
          onClick={handleSwitchAccount}
          className={`px-5 py-2 bg-slate-100 text-slate-700 rounded-xl transition-all flex items-center gap-2 mx-auto text-sm font-medium ${isLoggingOut ? 'opacity-70 cursor-wait' : 'hover:bg-slate-200'}`}
        >
          {isLoggingOut ? (
            <svg className="w-4 h-4 animate-spin text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" /><path d="M22 12a10 10 0 10-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          )}
          <span>{isLoggingOut ? 'Signing out...' : 'Switch Account'}</span>
        </button>
      </div>

      {/* Modals */}
      {showCompanyModal && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setShowCompanyModal(false)}
          onSuccess={reloadProfile}
        />
      )}
    </div>
  )
}

