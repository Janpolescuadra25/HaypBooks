'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StoryHero() {
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0005})`,
          }}
        />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-300/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * -0.3}px)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-center" style={{ marginTop: 'var(--hero-nudge, 2rem)' }}>
        {/* Trusted badge removed per request */}

        {/* Main Headline with Typewriter Effect */}
        <h1 
          className={`text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 transition-all duration-1000 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="block text-white mb-2">
            Your Business
          </span>
          <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent animate-gradient-x">
            Deserves Better
          </span>
        </h1>

        {/* Subheadline */}
        <p 
          className={`text-xl md:text-2xl lg:text-3xl text-emerald-100/90 mb-12 max-w-4xl mx-auto font-light leading-relaxed transition-all duration-1000 delay-400 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Transform chaos into clarity.
          <br />
          Professional accounting software built and designed for growing businesses.
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-600 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link 
            href="/signup"
            className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/60 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Your Journey Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <Link 
            href="#pricing"
            className="px-10 py-5 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl border-2 border-white/20 hover:bg-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105"
          >
            View Pricing
          </Link>

        </div>

        {/* Trust Indicators (with inline scroll badge between items 2 and 3) */}
        <div 
          className={`flex flex-wrap justify-center items-center gap-8 text-sm text-emerald-200/80 transition-all duration-1000 delay-800 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { icon: '✓', text: 'No credit card required' },
            { icon: '✓', text: '30-day free trial' },
            { icon: '✓', text: 'Cancel anytime' },
            { icon: '✓', text: 'Data security guaranteed' }
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2 group">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                {item.icon}
              </span>
              <span>{item.text}</span>

              {/* insert scroll badge between second and third items */}
              {idx === 1 && (
                <span className="flex flex-col items-center gap-2 mx-6 -mt-1 animate-bounce pointer-events-none">
                  <span className="text-xs sm:text-sm font-medium bg-slate-900/28 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full text-emerald-100 shadow-sm">
                    Scroll to explore
                  </span>
                  <svg className="w-6 h-6 text-emerald-300/80 drop-shadow-md mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              )}
            </span>
          ))}        
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(-5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </section>
  )
}
