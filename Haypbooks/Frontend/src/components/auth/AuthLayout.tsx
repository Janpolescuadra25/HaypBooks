"use client"
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BackgroundEffects } from './BackgroundEffects'

type Props = {
  children: React.ReactNode
  innerClassName?: string
}

function StoryItem({ iconPath, title, description, delay }: { iconPath: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-emerald-100/60 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  )
}

export default function AuthLayout({ children, innerClassName }: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#022c22]">
      {/* LEFT HERO PANEL — fixed height, never scrolls */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5">
        <BackgroundEffects isFixed={false} showFlashlight={true} />
        <div className="relative z-10 max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Haypbooks</span>
          </motion.div>
          <div className="space-y-10">
            <StoryItem delay={0.2} iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" title="Crystal Clear Insights" description="Visualize your financial health with real-time analytics and beautiful reports that tell the story of your growth." />
            <StoryItem delay={0.4} iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" title="Bank-Grade Security" description="Your data is protected by industry-leading encryption. We keep your ledgers safe so you can focus on building your empire." />
            <StoryItem delay={0.6} iconPath="M13 10V3L4 14h7v7l9-11h-7z" title="Automated Magic" description="Say goodbye to manual entry. Haypbooks automates your bookkeeping, saving you hours of tedious work every week." />
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL — scrolls independently */}
      <div className="w-full lg:w-1/2 bg-white overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : 'auth'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={innerClassName ?? 'w-full max-w-md mx-auto my-auto px-6 py-12 sm:px-10 sm:py-16'}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes slide-up   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scale-in   { from { opacity:0; transform:scale(0.85) }      to { opacity:1; transform:scale(1) } }
        @keyframes slide-down { from { opacity:0; transform:translateY(-10px)} to { opacity:1; transform:translateY(0) } }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        .animate-slide-up   { animation: slide-up   0.5s cubic-bezier(0.16,1,0.3,1) forwards }
        .animate-scale-in   { animation: scale-in   0.4s cubic-bezier(0.16,1,0.3,1) forwards }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.16,1,0.3,1) forwards }
        .animate-shake      { animation: shake      0.3s cubic-bezier(0.16,1,0.3,1) }
      `}</style>
    </div>
  )
}
