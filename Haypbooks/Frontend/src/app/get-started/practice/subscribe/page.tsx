"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  CreditCard, ShieldCheck, ArrowRight, ChevronLeft,
  CheckCircle2, Lock, Calendar, Sparkles,
} from 'lucide-react'

function UserIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function CheckoutInput({ label, placeholder, icon }: { label: string; placeholder: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
        />
      </div>
    </div>
  )
}

export default function PracticeSubscribePage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <React.Fragment key="checkout-form">
            {/* Left: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/3 lg:sticky lg:top-0 lg:h-screen bg-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
              </div>

              <div className="relative z-10">
                <button
                  onClick={() => router.push('/get-started/practice/tiers')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 font-bold text-sm"
                >
                  <ChevronLeft size={18} />
                  Back to Documentation
                </button>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Practice Pro</h3>
                      <p className="text-slate-400 text-sm">Full Tier Unlock</p>
                    </div>
                  </div>

                  <div className="pt-8 space-y-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subscription Plan</span>
                      <span className="font-medium">Annual Billing</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Practice Pro License</span>
                      <span className="font-medium">$499.00 / yr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Setup Fee</span>
                      <span className="text-emerald-400 font-bold">WAIVED</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold">$499.00</div>
                        <div className="text-[10px] text-slate-500 font-medium">Includes all applicable taxes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-6 pt-12 lg:pt-0">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Secure 256-bit SSL encrypted payment. Your data is protected by industry-leading security protocols.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-2/3 p-8 lg:p-24 flex flex-col items-center justify-center bg-white"
            >
              <div className="w-full max-w-md space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Payment Details</h2>
                  <p className="text-slate-500">Complete your subscription to unlock your practice.</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-4">
                    <CheckoutInput label="Cardholder Name" placeholder="Juan Dela Cruz" icon={<UserIcon size={18} />} />
                    <CheckoutInput label="Card Number" placeholder="0000 0000 0000 0000" icon={<CreditCard size={18} />} />
                    <div className="grid grid-cols-2 gap-4">
                      <CheckoutInput label="Expiry Date" placeholder="MM / YY" icon={<Calendar size={18} />} />
                      <CheckoutInput label="CVC" placeholder="123" icon={<Lock size={18} />} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You will be charged <span className="font-bold text-slate-900">$499.00</span> today. Your subscription will automatically renew on March 5, 2027.
                    </p>
                  </div>

                  <button
                    disabled={isProcessing}
                    type="submit"
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm & Pay $499.00
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" referrerPolicy="no-referrer" />
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-screen bg-white flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.5 }}
                  className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl -z-10"
                />
              </div>

              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-4xl font-bold text-slate-900 tracking-tight"
                >
                  Welcome to Practice Pro!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-slate-500 leading-relaxed text-lg"
                >
                  Your subscription is active. All Tier 1–5 features have been instantly unlocked for your firm.
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={() => router.push('/practice-hub')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
              >
                Go to Practice Hub
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
