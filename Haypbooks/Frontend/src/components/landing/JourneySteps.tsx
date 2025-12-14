'use client'

import { useEffect, useRef, useState } from 'react'

export default function JourneySteps() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      number: '01',
      title: 'Feeling overwhelmed by your books?',
      description: `Spreadsheets crashing under pressure.\nInvoices buried in endless emails.\nLate nights and weekends lost to manual bookkeeping.\nYou're not alone.`,
      icon: '📊',
      color: 'from-red-500 to-orange-500',
      mood: 'chaos'
    },
    {
      number: '02',
      title: 'Meet HaypBooks',
      description: `A modern accounting platform built for businesses like yours — one that ends the chaos and brings real clarity.\nReady for a better way?`,
      icon: '💡',
      color: 'from-amber-500 to-yellow-500',
      mood: 'hope'
    },
    {
      number: '03',
      title: 'Everything changes in minutes',
      description: `Quick setup with smart guidance.\nInvoices created and sent automatically.\nBank transactions syncing in real-time.\nPowerful insights at your fingertips.\nSee your business clearly — instantly.`,
      icon: '✨',
      color: 'from-emerald-500 to-teal-500',
      mood: 'growth'
    },
    {
      number: '04',
      title: 'Reclaim your time and confidence',
      description: `Finances organized and always up-to-date.\nData-driven decisions, without the stress.\nMore time for growing your business — and enjoying life.\nWelcome to financial freedom.`,
      icon: '🌿',
      color: 'from-teal-500 to-cyan-500',
      mood: 'success'
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-step'))
            setActiveStep(index)
          }
        })
      },
      { threshold: 0.5 }
    )

    const stepElements = sectionRef.current?.querySelectorAll('[data-step]')
    stepElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-slate-800">Every Great Business</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Has a Story
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            This could be yours. A journey from chaos to clarity, from struggle to success.
          </p>
        </div>

        {/* Journey Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-teal-300 to-emerald-200 hidden lg:block transform -translate-x-1/2" />

          <div className="space-y-32">
            {steps.map((step, index) => (
              <div
                key={index}
                data-step={index}
                className={`relative transition-all duration-1000 ${
                  activeStep >= index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
              >
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                  {/* Content Side */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-block mb-4">
                      <span className={`text-6xl md:text-8xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent opacity-20`}>
                        {step.number}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
                      {step.title}
                    </h3>
                    
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>

                  {/* Visual Side */}
                  <div className="flex-1 flex justify-center">
                    <div 
                      className={`relative group transition-all duration-700 ${
                        activeStep === index ? 'scale-100' : 'scale-90'
                      }`}
                    >
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                      
                      {/* Card */}
                      <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-slate-200/50 backdrop-blur-sm group-hover:shadow-emerald-200/50 transition-all duration-500">
                        <div className="text-8xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-500">
                          {step.icon}
                        </div>
                        
                        {/* Animated Mood Indicator */}
                        <div className="mt-6 flex justify-center gap-2">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 rounded-full transition-all duration-500 ${
                                i <= index 
                                  ? `w-8 bg-gradient-to-r ${step.color}` 
                                  : 'w-4 bg-slate-200'
                              }`}
                              style={{ transitionDelay: `${i * 100}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Connector Dot */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                  <div 
                    className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${
                      activeStep >= index 
                        ? `bg-gradient-to-r ${step.color} scale-100` 
                        : 'bg-slate-300 scale-75'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
          <div className="inline-block p-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/50 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h3>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              Join thousands of businesses who've transformed their accounting from burden to breakthrough.
            </p>
            <a 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Start Your Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
