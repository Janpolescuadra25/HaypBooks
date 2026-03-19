'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Zap, Calculator, FileText, PieChart, Coins, Receipt,
  ArrowRight, TrendingUp, CheckCircle,
} from 'lucide-react'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  dur: 4 + Math.random() * 4,
}))

const FLOAT_ICONS = [
  { Icon: Calculator, x: '10%', y: '25%', delay: 0 },
  { Icon: FileText,   x: '85%', y: '18%', delay: 1 },
  { Icon: PieChart,   x: '6%',  y: '68%', delay: 2 },
  { Icon: Coins,      x: '88%', y: '62%', delay: 3 },
  { Icon: Receipt,    x: '42%', y: '12%', delay: 4 },
]

export default function StoryHero() {
  const particles = useMemo(() => PARTICLES, [])

  return (
    <section className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      {/* right-half panel */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-50/60 rounded-l-[80px] lg:rounded-l-[120px]" />

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, bottom: '-4px' }}
          animate={{ y: [0, -700], opacity: [0, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* Floating icons */}
      {FLOAT_ICONS.map(({ Icon, x, y, delay }) => (
        <motion.div
          key={delay}
          className="absolute text-emerald-600/10 pointer-events-none z-0"
          style={{ left: x, top: y }}
          animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={32} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* Left column */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-emerald-500" />
              AI-Powered — HaypBooks 2026
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] mb-6"
            >
              One Platform.{' '}
              <span className="text-emerald-600 block">Your Entire</span>
              Business.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-lg"
            >
              Invoicing, expenses, inventory, payroll, and real-time insights — all in one beautifully simple platform built for Philippine businesses.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 text-base"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-8 py-4 rounded-2xl transition-all text-base"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {['#10b981','#059669','#047857','#065f46'].map((color, i) => (
                  <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow" style={{ backgroundColor: color }}>
                    {['JR','MC','AS','BP'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-slate-500 text-xs font-medium">Loved by 500+ Philippine businesses</p>
              </div>
            </motion.div>
          </div>

          {/* Right column — UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Main dashboard card */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              {/* Header bar */}
              <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
                <span className="text-white/80 text-xs font-medium">HaypBooks Dashboard</span>
                <div className="w-16" />
              </div>

              <div className="p-6 space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Revenue', val: '₱184,200', color: 'text-emerald-600' },
                    { label: 'Expenses', val: '₱54,800', color: 'text-rose-500' },
                    { label: 'Net Profit', val: '₱129,400', color: 'text-blue-600' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                      <p className={`text-base font-bold ${m.color}`}>{m.val}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-emerald-500/70 rounded-t-lg"
                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.06, ease: 'easeOut' }}
                        style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['M','T','W','T','F','S','S'].map((d,i) => (
                      <span key={i} className="flex-1 text-center text-slate-400 text-xs">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent invoices */}
                <div className="space-y-2">
                  {[
                    { name: 'Dela Cruz Corp', amount: '₱12,450', status: 'Paid', ok: true },
                    { name: 'Santos Trading', amount: '₱8,200', status: 'Pending', ok: false },
                  ].map(inv => (
                    <div key={inv.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-slate-800 text-sm font-semibold">{inv.name}</p>
                          <p className="text-slate-400 text-xs">Invoice #{1021 + (inv.ok ? 0 : 1)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 text-sm font-bold">{inv.amount}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inv.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating "Payment Received" card */}
            <motion.div
              className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Payment Received</p>
                <p className="text-slate-900 font-bold text-sm">+₱12,450.00</p>
              </div>
            </motion.div>

            {/* Floating checkmark badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-emerald-600 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold whitespace-nowrap">BIR Compliant</span>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="relative z-10 flex flex-col items-center pb-8 text-slate-400"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2"
          animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        </motion.div>
        <p className="text-xs mt-2 tracking-widest uppercase">Scroll to explore</p>
      </motion.div>
    </section>
  )
}
