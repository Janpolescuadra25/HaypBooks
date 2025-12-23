"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  { id: 'starter', name: 'Starter', monthly: 19, bullets: ['1 company', 'Owner + 2 team members', 'Unlimited invoices', 'Basic reports'] },
  { id: 'growth', name: 'Growth', monthly: 49, bullets: ['Up to 5 companies', 'Unlimited team members', 'Recurring invoices + payments', 'Advanced reports'], popular: true },
  { id: 'pro', name: 'Professional', monthly: 99, bullets: ['Unlimited companies', 'Advanced roles & permissions', 'Custom dashboards', 'Priority support'] },
]

export default function SubscribePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id)
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [address, setAddress] = useState({ street: '', city: '', state: '', postal: '', country: '' })

  function next() {
    if (step < 3) setStep(step + 1)
    else finish()
  }
  function prev() {
    if (step > 1) setStep(step - 1)
    else router.push('/get-started/plans')
  }
  function finish() {
    // For now, simulate success and route into onboarding/tenant
    router.push('/onboarding/tenant')
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className={`flex items-center gap-3 ${step === 1 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <div>Choose plan</div>
            </div>
            <div className={`flex items-center gap-3 ${step === 2 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <div>Billing details</div>
            </div>
            <div className={`flex items-center gap-3 ${step === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
              <div>Review & Purchase</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 1: Choose Your Plan</h2>
              <p className="text-slate-600 mb-6">Select the plan that fits your business. Payment will be processed in the next steps.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => (
                  <div key={p.id} className={`rounded-2xl p-6 border ${selectedPlan === p.id ? 'border-emerald-600 shadow-xl' : 'border-slate-200 shadow'} cursor-pointer`} onClick={() => setSelectedPlan(p.id)}>
                    {p.popular && <div className="absolute -mt-8 ml-6 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Most Popular</div>}
                    <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
                    <div className="text-3xl font-bold mb-3">${p.monthly}<span className="text-base text-slate-600">/month</span></div>
                    <p className="text-slate-600 mb-4">{p.name === 'Growth' ? 'For growing teams needing automation and insights' : p.name === 'Starter' ? 'For solo entrepreneurs and small businesses' : 'For established businesses with advanced needs'}</p>
                    <ul className="space-y-2 text-sm mb-4">
                      {p.bullets.map((b, i) => (<li key={i}>✓ {b}</li>))}
                    </ul>
                    <button className={`w-full py-2 rounded-lg font-semibold ${selectedPlan === p.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{selectedPlan === p.id ? 'Selected' : 'Select'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Billing Details</h2>
              <p className="text-slate-600 mb-6">Add your payment method securely. Your card will be charged today after confirmation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Card number" className="px-6 py-4 border rounded-xl" />
                <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" className="px-6 py-4 border rounded-xl" />
                <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="CVC" className="px-6 py-4 border rounded-xl" />
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Name on card" className="px-6 py-4 border rounded-xl md:col-span-2" />

                <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street address" className="px-6 py-4 border rounded-xl md:col-span-2" />
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="px-6 py-4 border rounded-xl" />
                <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State / Province" className="px-6 py-4 border rounded-xl" />
                <input value={address.postal} onChange={(e) => setAddress({ ...address, postal: e.target.value })} placeholder="Postal code" className="px-6 py-4 border rounded-xl" />
                <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="px-6 py-4 border rounded-xl">
                  <option value="">Country</option>
                  <option>United States</option>
                  <option>Canada</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 3: Review & Purchase</h2>
              <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xl font-bold">{PLANS.find(p => p.id === selectedPlan)?.name} Plan</p>
                    <p className="text-slate-600">{PLANS.find(p => p.id === selectedPlan)?.name === 'Growth' ? 'Most popular — perfect for growing teams' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-600">${PLANS.find(p => p.id === selectedPlan)?.monthly}</p>
                    <p className="text-slate-600">per month</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between mb-3"><span className="text-slate-600">Plan cost</span><span className="font-medium">${PLANS.find(p => p.id === selectedPlan)?.monthly}.00</span></div>

                <div className="flex justify-between text-xl font-bold pt-4 border-t"><span>Total due today</span><span className="text-emerald-600">${PLANS.find(p => p.id === selectedPlan)?.monthly}.00</span></div>
                <p className="text-sm text-slate-600 mt-4">Your card will be charged ${PLANS.find(p => p.id === selectedPlan)?.monthly} today. You can cancel anytime.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3 justify-end">
            <button onClick={prev} className="px-6 py-3 rounded-lg border border-slate-200">Back</button>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold">{step === 3 ? 'Confirm purchase' : 'Continue'}</button>
          </div>
        </div>

      </div>
    </div>
  )
}