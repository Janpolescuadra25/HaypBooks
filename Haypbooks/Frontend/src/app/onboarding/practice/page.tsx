"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Landmark, ArrowRight, ArrowLeft, CheckCircle2, Check } from 'lucide-react'
import PracticeProfile from '@/components/PracticeOnboarding/PracticeProfile'
import ServicesOffered from '@/components/PracticeOnboarding/ServicesOffered'
import apiClient from '@/lib/api-client'

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Practice Identity', subtitle: 'Tell us about your accounting practice.' },
  { id: 2, label: 'Services', subtitle: 'Configure which modules appear in your hub.' },
  { id: 3, label: 'Ready', subtitle: '' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticeOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [practiceData, setPracticeData] = useState<any>({})
  const stepRef = useRef<any>(null)

  async function saveStepToBackend(stepIndex: number, data: any) {
    try {
      const stepName = stepIndex === 0 ? 'accountant_firm' : 'accountant_services'
      await apiClient.post('/api/onboarding/save', { step: stepName, data })
    }
    catch { /* best-effort */ }
  }

  async function completePractice(servicesData: any) {
    setSaving(true)
    try {
      // Save the final step data
      await saveStepToBackend(1, servicesData)
      // Call the main complete endpoint
      await apiClient.post('/api/onboarding/complete', { hub: 'ACCOUNTANT', type: 'full' })
    } catch { /* best-effort */ }
    finally { setSaving(false) }
  }

  async function handleStep1Next(data: any) {
    setPracticeData(data)
    await saveStepToBackend(0, data)
    setStep(2)
  }

  async function handleStep2Next() {
    if (!stepRef.current) return
    const services = stepRef.current.getData?.() ?? {}
    if (stepRef.current.hasRequiredData && !stepRef.current.hasRequiredData()) return
    setSaving(true)
    await saveStepToBackend(1, services)
    await completePractice(services)
    setSaving(false)
    setStep(3)
  }

  const currentStepIndex = step - 1

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-emerald-600"
        />
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <div className="lg:w-1/3 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/20">
              <Landmark className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Practice Setup</h1>
            <p className="text-slate-400 leading-relaxed">
              We're tailoring your Haypbooks experience to fit your professional practice perfectly.
            </p>
          </div>

          {/* Step indicators — dot style matching reference */}
          <div className="relative z-10 space-y-6">
            {STEPS.map((s, idx) => (
              <StepIndicator
                key={s.id}
                label={s.label}
                active={currentStepIndex >= idx}
              />
            ))}
          </div>

          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Haypbooks Practice Hub</p>
          </div>
        </div>

        {/* ── RIGHT CONTENT ──────────────────────────────────────────────── */}
        <div className="lg:w-2/3 p-8 lg:p-24 flex flex-col items-center bg-slate-50/30 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Step 1 — Practice Identity */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Practice Identity</h2>
                      <p className="text-slate-500">Let's set up your professional workspace.</p>
                    </div>
                    <PracticeProfile currentStep={1} onNext={handleStep1Next} />
                  </div>
                )}

                {/* Step 2 — Services */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">What Services Do You Offer?</h2>
                      <p className="text-slate-500">This configures which modules your Practice Hub shows.</p>
                    </div>
                    <ServicesOffered ref={stepRef} />

                    {/* Navigation */}
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors"
                      >
                        <ArrowLeft size={18} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleStep2Next}
                        disabled={saving}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Setting up your hub…
                          </>
                        ) : (
                          <>
                            Finish Setup
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Done */}
                {step === 3 && (
                  <PracticeDoneStep
                    practiceName={practiceData?.name}
                    onGoToHub={() => router.push('/get-started/practice/tiers')}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation for step 1 (PracticeProfile has its own submit, so we show nothing here) */}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── StepIndicator (dot style from reference) ────────────────────────────────

function StepIndicator({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-4 transition-all duration-500 ${active ? 'opacity-100 translate-x-2' : 'opacity-30'}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
      <span className={`text-sm font-bold tracking-wide ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
  )
}

// ─── PracticeDoneStep ─────────────────────────────────────────────────────────

function PracticeDoneStep({ practiceName, onGoToHub }: { practiceName?: string; onGoToHub: () => void }) {
  return (
    <div className="space-y-8 text-center py-12">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
        <CheckCircle2 size={48} />
      </div>
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-2">
          {practiceName ? `${practiceName} is ready!` : 'Your firm is ready!'}
        </h2>
        <p className="text-slate-500 text-lg">Your professional workspace has been configured.</p>
      </div>

      <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-[32px] p-8 text-left space-y-6 shadow-sm">
        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">What's next?</h4>
        <div className="space-y-4">
          {[
            'Invite your first team member',
            'Add your first client company',
            'Connect a bank account',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Check size={12} strokeWidth={4} />
              </div>
              <span className="text-sm font-medium text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGoToHub}
        className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 inline-flex items-center gap-2 group"
      >
        Choose your plan
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}
