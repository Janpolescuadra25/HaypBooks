"use client"

import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'motion/react'
import React from 'react'
import {
  Zap, Lock, Trophy, Star, Crown, Gem,
  ArrowRight, CheckCircle2, TrendingUp, Clock,
  Sparkles, ChevronDown, Coins, Rocket,
  Brain, Layers, Wand2, Users, BarChart3,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    level: '1', title: 'Beginner',    icon: <Star    className="text-slate-400"  />, status: 'Level 1',
    desc: 'Start your journey with essential tools',
    features: ['Dashboard', 'Shortcuts', 'Basic Reports'],         xp: '0 XP',   active: true,  locked: false,
  },
  {
    level: '2', title: 'Apprentice',  icon: <Zap     className="text-blue-400"   />, status: 'Level 2',
    desc: 'Unlock more accounting features',
    features: ['Bank Connections', 'Transaction Categorization', 'Client Management'], xp: '100 XP',  active: false, locked: true,
  },
  {
    level: '3', title: 'Practitioner',icon: <Trophy  className="text-amber-400"  />, status: 'Level 3',
    desc: 'Full accounting capabilities',
    features: ['Full Invoicing Suite', 'Bill Management', 'Bank Reconciliation'], xp: '500 XP',  active: false, locked: true,
  },
  {
    level: '4', title: 'Expert',      icon: <Crown   className="text-purple-400" />, status: 'Level 4',
    desc: 'Advanced features unlocked',
    features: ['Financial Statements', 'Budget Management', 'Multi-currency'],    xp: '1500 XP', active: false, locked: true,
  },
  {
    level: '5', title: 'Master',      icon: <Gem     className="text-emerald-400"/>, status: 'Level 5',
    desc: 'Full practice capabilities',
    features: ['Multi-entity Support', 'Consolidation', 'Custom Reports'],        xp: '5000 XP', active: false, locked: true,
  },
]

const PREMIUM_TOOLS = [
  { icon: <Brain    className="text-purple-400" />, title: 'AI Bookkeeping',      price: '$9.99/mo',  desc: 'Auto-categorization with AI' },
  { icon: <Layers   className="text-blue-400"   />, title: 'Smart Matching',      price: '$14.99/mo', desc: 'Intelligent transaction matching' },
  { icon: <Wand2    className="text-emerald-400"/>, title: 'Advanced Automation', price: '$19.99/mo', desc: 'Complex workflow builder' },
  { icon: <Users    className="text-amber-400"  />, title: 'Client Portal',       price: '$24.99/mo', desc: 'Branded client access portal' },
  { icon: <BarChart3 className="text-red-400"   />, title: 'Analytics Pro',       price: '$29.99/mo', desc: 'Advanced business intelligence' },
]

const XP_ACTIVITIES = [
  { task: 'Complete reconciliation',  xp: '+25'  },
  { task: 'Create invoice',           xp: '+5'   },
  { task: 'Add new client',           xp: '+50'  },
  { task: 'Complete month-end close', xp: '+100' },
  { task: 'Refer a friend',           xp: '+200' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticeTiersPage() {
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  const onProceed   = () => router.push('/practice-hub')
  const onSubscribe = () => router.push('/get-started/practice/subscribe')

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-400"
    >
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#064e3b_0%,transparent_70%)] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <Rocket size={14} />
            Practice Hub
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] max-w-4xl mx-auto">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700">
              Journey.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Begin with free tools and unlock more as you grow. Earn XP through activity or skip the grind by subscribing to premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onProceed}
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
            >
              Start with free tier
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onSubscribe}
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              Subscribe Now
              <Crown size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-12 flex flex-col items-center gap-4 text-slate-500"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to see how it works</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">How Practice Hub Works</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <MechanismCard icon={<TrendingUp className="text-emerald-400" />} title="Earn XP"          desc="Complete tasks, serve clients, and grow your practice to earn experience points" />
            <MechanismCard icon={<Lock       className="text-blue-400"    />} title="Unlock Tools"    desc="Reach XP milestones to unlock new tools and features for your practice" />
            <MechanismCard icon={<Clock      className="text-amber-400"   />} title="Maintain Access" desc="Stay active to maintain unlocked tools. Inactivity may lock features again" />
          </div>
        </div>
      </section>

      {/* Tier Progression */}
      <section className="relative z-10 py-32 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight">Tier Progression</h2>
              <p className="text-slate-400">Your roadmap from beginner to master.</p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Free Forever</span>
              <div className="h-px w-32 bg-emerald-500/30 mt-2" />
            </div>
          </div>
          <div className="space-y-4">
            {TIERS.map(t => <TierRow key={t.level} {...t} />)}
          </div>
        </div>
      </section>

      {/* Maintenance & XP Activities */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] space-y-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Clock size={28} />
              </div>
              <h3 className="text-3xl font-bold">Tool Maintenance</h3>
              <p className="text-slate-400 leading-relaxed">
                Unlocked tools require regular activity to maintain access. If you are inactive for 30 days, your tools will become locked again. Stay active to keep your progress!
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Coins className="text-emerald-400" />
              XP Activities
            </h3>
            <div className="grid gap-3">
              {XP_ACTIVITIES.map(a => <XPActivity key={a.task} task={a.task} xp={a.xp} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Tools */}
      <section className="relative z-10 py-32 px-6 bg-emerald-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              Skip the grind
            </div>
            <h2 className="text-5xl font-bold tracking-tight">Premium Tools</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_TOOLS.map(t => <PremiumToolCard key={t.title} {...t} onSubscribe={onSubscribe} />)}
            <div className="p-8 bg-emerald-600 rounded-[32px] flex flex-col justify-between group cursor-pointer hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/20">
              <div className="space-y-4">
                <Crown className="text-white" size={32} />
                <h4 className="text-xl font-bold text-white">Want Everything Unlocked?</h4>
                <p className="text-emerald-100 text-sm">Subscribe to Practice Pro and get instant access to all tools, no grinding required!</p>
              </div>
              <button
                onClick={onSubscribe}
                className="mt-8 bg-white text-emerald-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
              >
                View Plans
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to begin?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onSubscribe}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-emerald-600/20"
            >
              Subscribe Now
            </button>
            <button
              onClick={onProceed}
              className="w-full sm:w-auto text-slate-400 hover:text-white font-bold text-lg flex items-center gap-2 transition-colors"
            >
              Start with free tier
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Haypbooks Practice Hub. All rights reserved.</p>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MechanismCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-4 hover:bg-white/[0.05] transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function TierRow({ level, title, icon, status, desc, features, xp, active, locked }: {
  level: string; title: string; icon: React.ReactNode; status: string; desc: string;
  features: string[]; xp: string; active: boolean; locked: boolean;
}) {
  return (
    <div className={`group relative p-8 rounded-[32px] border transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
      {level !== '5' && (
        <div className="absolute left-14 bottom-[-32px] w-0.5 h-8 bg-gradient-to-b from-white/10 to-transparent" />
      )}
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex items-center gap-6 lg:w-1/4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-500'}`}>
            {icon}
          </div>
          <div>
            <h4 className={`font-bold text-xl ${active ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-slate-600'}`}>{status}</span>
          </div>
        </div>
        <div className="lg:w-1/3">
          <p className={`text-sm leading-relaxed ${active ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>
        </div>
        <div className="flex-grow flex flex-wrap gap-2">
          {features.map(f => (
            <div key={f} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-600'}`}>
              <CheckCircle2 size={10} className={active ? 'text-emerald-500' : 'text-slate-700'} />
              {f}
            </div>
          ))}
        </div>
        <div className="lg:w-1/6 text-right">
          <div className={`text-xs font-bold ${active ? 'text-emerald-500' : 'text-slate-600'}`}>{xp}</div>
          <div className="text-[10px] text-slate-700 uppercase tracking-tighter">Required</div>
        </div>
      </div>
      {locked && (
        <div className="absolute top-1/2 -translate-y-1/2 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
          <Lock size={20} />
        </div>
      )}
    </div>
  )
}

function XPActivity({ task, xp }: { task: string; xp: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
      <span className="text-slate-300 text-sm font-medium">{task}</span>
      <span className="text-emerald-400 font-mono font-bold">{xp} XP</span>
    </div>
  )
}

function PremiumToolCard({ icon, title, price, desc, onSubscribe }: {
  icon: React.ReactNode; title: string; price: string; desc: string; onSubscribe: () => void;
}) {
  return (
    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-6 hover:bg-white/[0.05] transition-all group">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{price}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest">Purchase</div>
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onSubscribe}
        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
      >
        Add to Practice
      </button>
    </div>
  )
}
