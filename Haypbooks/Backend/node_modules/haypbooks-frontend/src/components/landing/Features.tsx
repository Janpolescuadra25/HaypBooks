'use client'

import { useState } from 'react'

export default function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Invoice in seconds. Bank feeds sync automatically. Reports generated instantly.',
      gradient: 'from-emerald-500 to-teal-500',
      stat: '10x faster',
      detail: 'Complete Accounting Suite'
    },
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption. SOC 2 certified. Your data is safer than Fort Knox.',
      gradient: 'from-teal-500 to-cyan-500',
      stat: '256-bit SSL',
      detail: 'Enterprise Security'
    },
    {
      icon: '📊',
      title: 'Real-Time Insights',
      description: 'Live dashboards. Instant reports. Make decisions backed by data, not guesses.',
      gradient: 'from-cyan-500 to-blue-500',
      stat: 'Live data',
      detail: 'Financial Reports'
    },
    {
      icon: '🌍',
      title: 'Access Anywhere',
      description: 'Cloud-based. Mobile apps. Work from office, home, or beach. Your choice.',
      gradient: 'from-blue-500 to-indigo-500',
      stat: '24/7 access',
      detail: 'Bank Integration'
    },
    {
      icon: '🤖',
      title: 'Smart Automation',
      description: 'Auto-categorization. Recurring invoices. Bank reconciliation on autopilot.',
      gradient: 'from-indigo-500 to-purple-500',
      stat: '95% automated',
      detail: 'Invoicing & Billing'
    },
    {
      icon: '💬',
      title: 'Expert Support',
      description: 'Live chat. Email. Phone. Real humans who actually care about your success.',
      gradient: 'from-purple-500 to-pink-500',
      stat: '<2min response',
      detail: 'Multi-User Access'
    }
  ]

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            Powerful Features
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-slate-800">Everything You Need</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Nothing You Don't
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Professional accounting tools that feel like magic. Built for modern businesses who refuse to settle.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative"
            >
              {/* Glow Effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 transform group-hover:scale-110`}
              />

              {/* Card */}
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 group-hover:border-emerald-300/50 group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Animated Background Pattern */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-3xl shadow-lg`}>
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Stat Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 group-hover:bg-emerald-50 rounded-full text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-all duration-300">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                    {feature.stat}
                  </div>

                  {/* Hover Arrow */}
                  <div className={`absolute bottom-8 right-8 transform transition-all duration-300 ${
                    hoveredIndex === index ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}>
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-slate-600 mb-6 text-lg">
            And that's just scratching the surface...
          </p>
          <a 
            href="/features"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Explore All Features
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
