'use client'
import { motion } from 'motion/react'

const STEPS = [
  {
    num: '01',
    emoji: '📝',
    title: 'Create Your Account',
    detail: 'Sign up in 60 seconds. No credit card needed, no lengthy forms — just your email and you\'re in.',
    label: 'CREATE',
  },
  {
    num: '02',
    emoji: '🔗',
    title: 'Connect Your Business',
    detail: 'Link your bank, import existing data, or start fresh. HaypBooks guides you step by step.',
    label: 'CONNECT',
  },
  {
    num: '03',
    emoji: '📈',
    title: 'Grow with Confidence',
    detail: 'Send invoices, track expenses, manage inventory and payroll — everything in real time.',
    label: 'GROW',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Get Started In Minutes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white rounded-[48px] shadow-xl border border-slate-100 px-8 py-12 md:py-16"
        >
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-emerald-100 z-0" style={{ left: '20%', right: '20%' }} />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Number badge */}
                <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-600/20 mb-6 relative">
                  <span>{step.emoji}</span>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                </div>

                <div className="inline-block bg-emerald-50 text-emerald-600 text-xs font-extrabold tracking-widest px-3 py-1 rounded-full mb-4">
                  {step.label}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
