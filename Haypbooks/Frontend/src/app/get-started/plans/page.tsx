"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, ArrowRight, ArrowLeft, Check, X, Info } from 'lucide-react'
import { BackgroundEffects } from '@/components/auth/BackgroundEffects'

const PLANS = [
  {
    id: 'growth',
    title: 'Growth',
    priceMonthly: '$29',
    priceAnnual: '$23',
    desc: 'For growing businesses',
    badge: 'Most Popular 💼',
    features: ['Unlimited invoices & bills', 'Advanced reports & analytics', 'Priority email support'],
    allFeatures: [
      'Unlimited invoices & bills',
      'Advanced reports & analytics',
      'Priority email support',
      'Up to 3 users',
      'Automated bank feeds',
      'Custom chart of accounts',
      'Multi-currency support',
      'Project tracking',
      'Recurring invoices',
    ],
  },
  {
    id: 'professional',
    title: 'Professional',
    priceMonthly: '$79',
    priceAnnual: '$63',
    desc: 'For established companies',
    badge: '⭐ Premium',
    features: ['Everything in Growth', 'Up to 15 users', 'Advanced inventory management'],
    allFeatures: [
      'Everything in Growth',
      'Up to 15 users',
      'Advanced inventory management',
      'Purchase orders',
      'Budgeting & forecasting',
      'Custom reporting engine',
      'API access',
      'Dedicated account manager',
      'Batch transactions',
    ],
  },
  {
    id: 'elite',
    title: 'Elite',
    priceMonthly: '$149',
    priceAnnual: '$119',
    desc: 'For large scale operations',
    badge: '🏆 High Performance',
    features: ['Everything in Professional', 'Unlimited users', 'Custom integrations'],
    allFeatures: [
      'Everything in Professional',
      'Unlimited users',
      'Custom integrations',
      'SSO & advanced security',
      'White-labeling options',
      '24/7 Priority support',
      'Dedicated success manager',
      'SLA guarantees',
      'Advanced workflow automation',
    ],
  },
]

export default function GetStartedPlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = React.useState('Growth')
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly')
  const [viewingFeatures, setViewingFeatures] = React.useState<string | null>(null)

  const currentViewingPlan = PLANS.find(p => p.id === viewingFeatures)

  const handleContinue = () => {
    const plan = PLANS.find(p => p.title === selectedPlan)
    if (plan) router.push(`/get-started/subscribe?plan=${plan.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center py-4 px-4 overflow-y-auto">
      <BackgroundEffects showFlashlight={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[24px] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 p-5 lg:p-7 relative"
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5 flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={16} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Choose your plan</h2>
          <p className="text-slate-400 text-xs">Subscribe now and get started immediately, or try free for 30 days — no card required.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-700">Billing:</span>
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Annual <span className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Save 20%</span>
              </button>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400">Choose a plan that fits your business</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
            const isSelected = selectedPlan === plan.title
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.title)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col h-full cursor-pointer group ${
                  isSelected
                    ? 'border-emerald-500 bg-white ring-8 ring-emerald-500/5 shadow-xl'
                    : 'border-slate-100 bg-white hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className="mb-3">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100 mb-2">
                    {plan.badge}
                  </span>
                  <h4 className="font-bold text-slate-900 text-lg mb-0.5">{plan.title}</h4>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold text-slate-900">{price}</span>
                    <span className="text-xs text-slate-400 font-medium">/month</span>
                  </div>
                  <p className="text-xs text-slate-400">{plan.desc}</p>
                </div>

                <div className="space-y-2 flex-grow mb-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingFeatures(plan.id) }}
                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 underline underline-offset-4 uppercase tracking-widest transition-colors"
                    >
                      See all features
                    </button>
                  </div>
                  <button
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                    }`}
                  >
                    {isSelected && <Check size={16} strokeWidth={3} />}
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className="hidden md:block w-px h-4 bg-slate-200" />
            <p className="text-sm font-bold text-slate-500">
              Not sure yet?{' '}
              <button
                onClick={() => router.push('/get-started/trial')}
                className="text-emerald-600 hover:underline"
              >
                Start your free 30-day trial — no credit card needed.
              </button>
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group"
          >
            Continue to checkout
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Features Modal */}
      <AnimatePresence>
        {viewingFeatures && currentViewingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingFeatures(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{currentViewingPlan.title} Features</h3>
                    <p className="text-sm text-slate-500 font-medium">Everything included in this plan</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingFeatures(null)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {currentViewingPlan.allFeatures.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => { setSelectedPlan(currentViewingPlan.title); setViewingFeatures(null) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
                >
                  Select this plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
