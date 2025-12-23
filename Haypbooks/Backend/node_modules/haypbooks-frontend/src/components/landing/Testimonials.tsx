'use client'

import { useState, useEffect } from 'react'

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      quote: "HaypBooks transformed our accounting from a monthly nightmare into a daily breeze. The time we save pays for itself ten times over.",
      author: "Sarah Chen",
      role: "CEO",
      company: "TechStart Philippines",
      avatar: "👩‍💼",
      stat: "80% time saved",
      color: "from-emerald-500 to-teal-500"
    },
    {
      quote: "We switched from spreadsheets to HaypBooks and never looked back. Real-time insights helped us grow 300% last year.",
      author: "Miguel Santos",
      role: "Finance Director",
      company: "GrowthCo Manila",
      avatar: "👨‍💼",
      stat: "300% growth",
      color: "from-teal-500 to-cyan-500"
    },
    {
      quote: "The automation features are game-changing. Bank reconciliation that used to take days now happens in minutes.",
      author: "Anna Rodriguez",
      role: "Accounting Manager",
      company: "RetailPro Inc",
      avatar: "👩‍💻",
      stat: "95% faster",
      color: "from-cyan-500 to-blue-500"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-100 text-sm font-semibold">
            Success Stories
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Loved by Businesses
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  index === activeIndex 
                    ? 'opacity-100 translate-x-0' 
                    : index < activeIndex 
                      ? 'opacity-0 -translate-x-full absolute inset-0' 
                      : 'opacity-0 translate-x-full absolute inset-0'
                }`}
              >
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10">
                  {/* Quote */}
                  <div className="mb-8">
                    <svg className="w-16 h-16 text-emerald-400/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    
                    <p className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-8">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{testimonial.avatar}</div>
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {testimonial.author}
                        </div>
                        <div className="text-emerald-300 text-sm">
                          {testimonial.role}, {testimonial.company}
                        </div>
                      </div>
                    </div>

                    <div className={`px-6 py-3 bg-gradient-to-r ${testimonial.color} rounded-full text-white font-bold shadow-lg`}>
                      {testimonial.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex 
                    ? 'w-12 h-3 bg-gradient-to-r from-emerald-400 to-teal-400' 
                    : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            { number: '10,000+', label: 'Active Users' },
            { number: '99.9%', label: 'Uptime SLA' },
            { number: '4.9/5', label: 'Customer Rating' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center group cursor-default"
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-emerald-200/80 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
