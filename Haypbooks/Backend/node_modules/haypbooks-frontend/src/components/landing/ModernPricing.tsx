'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ModernPricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Starter',
      tagline: 'For freelancers & solopreneurs',
      icon: '🌱',
      monthlyPrice: 0,
      annualPrice: 0,
      badge: 'Free Forever',
      description: 'Perfect for getting started',
      features: [
        { text: 'Up to 50 invoices/month', included: true },
        { text: 'Basic financial reports', included: true },
        { text: 'Email support', included: true },
        { text: '1 user', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Basic integrations', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom branding', included: false }
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'from-slate-500 to-gray-600'
    },
    {
      name: 'Growth',
      tagline: 'For growing businesses',
      icon: '📈',
      monthlyPrice: 29,
      annualPrice: 24,
      badge: null,
      description: 'Scale your operations',
      features: [
        { text: 'Unlimited invoices & bills', included: true },
        { text: 'Advanced reports & analytics', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Up to 5 users', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Bank reconciliation', included: true },
        { text: 'Inventory tracking (basic)', included: true },
        { text: 'Custom branding', included: false }
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Professional',
      tagline: 'For established companies',
      icon: '💼',
      monthlyPrice: 79,
      annualPrice: 65,
      badge: 'Most Popular',
      description: 'Everything you need to scale',
      features: [
        { text: 'Everything in Growth', included: true },
        { text: 'Up to 15 users', included: true },
        { text: 'Advanced inventory management', included: true },
        { text: 'Multi-currency support', included: true },
        { text: 'API access', included: true },
        { text: 'Custom branding', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Dedicated account manager', included: false }
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      name: 'Premium',
      tagline: 'For large organizations',
      icon: '⭐',
      monthlyPrice: 149,
      annualPrice: 125,
      badge: null,
      description: 'Maximum power & flexibility',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Unlimited users', included: true },
        { text: 'Advanced automation workflows', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'White-label options', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom training sessions', included: true },
        { text: 'SLA guarantee (99.9%)', included: true }
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Enterprise',
      tagline: 'For enterprise needs',
      icon: '🏢',
      monthlyPrice: null,
      annualPrice: null,
      badge: 'Custom',
      description: 'Tailored to your requirements',
      features: [
        { text: 'Everything in Premium', included: true },
        { text: 'Custom deployment options', included: true },
        { text: 'On-premise hosting available', included: true },
        { text: 'Advanced security features', included: true },
        { text: 'Custom contract terms', included: true },
        { text: 'Dedicated support team', included: true },
        { text: 'Custom development', included: true },
        { text: 'Volume discounts', included: true }
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-emerald-50/30" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            Simple, Transparent Pricing
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-slate-800">Choose Your</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Growth Path
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Start free, scale as you grow. All plans include 30-day trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-white rounded-full shadow-lg border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular ? 'lg:scale-105 z-10' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`px-4 py-1 bg-gradient-to-r ${plan.color} text-white text-sm font-bold rounded-full shadow-lg`}>
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Card */}
              <div 
                className={`relative h-full bg-white rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                  plan.popular 
                    ? 'border-emerald-400 shadow-2xl shadow-emerald-200/50' 
                    : 'border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative p-8">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{plan.icon}</div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-6 min-h-[40px]">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice === null ? (
                      <div className="text-4xl font-bold text-slate-800">
                        Custom
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-slate-800">
                            ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                          </span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-slate-600">/month</span>
                          )}
                        </div>
                        {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                          <div className="text-sm text-emerald-600 font-semibold mt-1">
                            Billed ${(plan.annualPrice || 0) * 12}/year
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 text-sm">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    {plan.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-3 ${
                          feature.included ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        <svg 
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            feature.included ? 'text-emerald-500' : 'text-slate-300'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          {feature.included ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Not sure which plan is right for you?
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            Talk to our team
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
