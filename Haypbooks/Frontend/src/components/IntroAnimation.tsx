'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function IntroAnimation() {
  const router = useRouter()
  const pathname = usePathname?.() || ''
  const chaosRef = useRef<HTMLDivElement>(null)
  const sheetsRef = useRef<HTMLDivElement[]>([])
  const animsRef = useRef<Animation[]>([])
  const timer1Ref = useRef<number | null>(null)
  const timer2Ref = useRef<number | null>(null)
  const [showClarity, setShowClarity] = useState(false)
  const [aborted, setAborted] = useState(false)
  const [portalBurst, setPortalBurst] = useState(false)

  // Cleanup helper to abort animation immediately
  const cleanup = () => {
    if (timer1Ref.current) {
      window.clearTimeout(timer1Ref.current)
      timer1Ref.current = null
    }
    if (timer2Ref.current) {
      window.clearTimeout(timer2Ref.current)
      timer2Ref.current = null
    }
    // cancel floating animations
    animsRef.current.forEach(a => { try { a.cancel() } catch {} })
    animsRef.current = []
    sheetsRef.current.forEach(s => s.remove())
    sheetsRef.current = []
    setShowClarity(false)
  }

  useEffect(() => {
    // If user navigated away, abort early to avoid overlaying other pages
    if (pathname && pathname !== '/') {
      cleanup()
      setAborted(true)
      return
    }

    // Do not start the intro if the user already saw it or opted into signup
    try {
      if (typeof window !== 'undefined') {
        // Explicit signup intent should suppress the intro immediately
        const params = new URLSearchParams(window.location.search)
        if (params.get('showSignup') === '1') {
          setAborted(true)
          return
        }
        if (localStorage.getItem('hasSeenIntro') === 'true') {
          setAborted(true)
          return
        }
      }
    } catch (e) {}

    // Start animation only on exact '/'
    setAborted(false)

    // Generate chaos spreadsheet elements
    const chaos = chaosRef.current
    if (!chaos) return

      const BOX_LABELS = [
      'Invoices','Expenses','Receipts','Bank Feeds','Payments','Bills','Reconciliations','Reports','Payroll','Taxes','Customers','Vendors','Accounts','Statements','Credits','Debits'
    ]

    // Enable 3D perspective for a more dimensional feel
    chaos.style.perspective = '1200px'
    chaos.style.perspectiveOrigin = '50% 40%'

    const boxes: HTMLDivElement[] = []
    for (let i = 0; i < BOX_LABELS.length; i++) {
      const box = document.createElement('div')
      // style the box to match the reference: pill/rounded rectangle, teal gradient, white bold text
      box.className = 'absolute rounded-lg pointer-events-none flex items-center justify-center text-sm font-semibold text-white'
      box.style.width = `${Math.random() * 160 + 120}px`
      box.style.height = `${Math.random() * 48 + 48}px`
      box.style.left = `${Math.random() * 100}%`
      box.style.top = `${Math.random() * 100}%`
      box.style.position = 'absolute'
      box.style.overflow = 'hidden'

      // 3D tilt and subtle depth
      const rot = (Math.random() - 0.5) * 30
      const rotX = (Math.random() - 0.5) * 12
      const rotY = (Math.random() - 0.5) * 12
      const tz = Math.floor(Math.random() * 40) - 20
      box.style.transform = `rotateZ(${rot}deg) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${tz}px)`

      box.style.opacity = '0.99'
      box.style.padding = '0 20px'
      box.style.fontSize = '14px'
      box.style.letterSpacing = '0.2px'

      // teal gradient base (like the button in attachment)
      box.style.background = 'linear-gradient(90deg, #10b981 0%, #14b8a6 40%, #0ea5a2 100%)'
      // stronger highlight border and outer glow
      box.style.border = '1px solid rgba(4,120,87,0.15)'
      box.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(4,120,87,0.12), 0 0 28px rgba(16,185,129,0.06)'
      box.style.outline = '2px solid rgba(6,95,70,0.02)'

      // create right-side bevel overlay to emulate the button edge seen in the screenshot
      const edge = document.createElement('div')
      edge.style.position = 'absolute'
      edge.style.right = '0'
      edge.style.top = '0'
      edge.style.bottom = '0'
      edge.style.width = '18px'
      edge.style.borderRadius = '0 10px 10px 0'
      edge.style.background = 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.18))'
      edge.style.pointerEvents = 'none'
      edge.style.transform = 'translateZ(30px)'

      // subtle inner highlight bar on the left for depth
      const inner = document.createElement('div')
      inner.style.position = 'absolute'
      inner.style.left = '6px'
      inner.style.top = '6px'
      inner.style.bottom = '6px'
      inner.style.width = '4px'
      inner.style.borderRadius = '2px'
      inner.style.background = 'rgba(255,255,255,0.12)'
      inner.style.pointerEvents = 'none'

      // small floating animation using Web Animations API
      const floatDist = 6 + Math.random() * 8
      const floatDur = 3000 + Math.floor(Math.random() * 2000)
      const anim = box.animate([
        { transform: box.style.transform + ' translateY(0px)' },
        { transform: box.style.transform + ` translateY(${-floatDist}px)` }
      ], { duration: floatDur, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' })
      animsRef.current.push(anim)

      box.textContent = BOX_LABELS[i]
      box.appendChild(edge)
      box.appendChild(inner)
      chaos.appendChild(box)
      boxes.push(box)
    }
    sheetsRef.current = boxes

    // Animate boxes sucking into portal with a tighter timing and stronger easing
    timer1Ref.current = window.setTimeout(() => {
      sheetsRef.current.forEach((box, i) => {
        box.style.transition = `all 0.8s cubic-bezier(0.2, 0.9, 0.28, 1) ${i * 0.02}s`
        box.style.transform = 'translate(-50%, -50%) scale(0.02) rotateX(360deg) rotateY(360deg)'
        box.style.left = '50%'
        box.style.top = '50%'
        box.style.opacity = '0'
      })
      // small portal burst state
      setPortalBurst(true)
    }, 1100)

    // Show clarity world shortly after burst
    timer2Ref.current = window.setTimeout(() => {
      setShowClarity(true)
      // remove portal burst after reveal
      setTimeout(() => setPortalBurst(false), 800)
    }, 1800)

    // ESC key listener
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      cleanup()
      window.removeEventListener('keydown', handleEsc)
    }
  }, [pathname, router])

  const handleEnter = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenIntro', 'true')
    }
    cleanup()
    setAborted(true)
    router.push('/landing')
  }

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenIntro', 'true')
    }
    cleanup()
    setAborted(true)
    router.push('/landing')
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 overflow-hidden">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 z-50 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-300"
      >
        Skip Intro (ESC)
      </button>

      {/* Chaos World - Spreadsheet Hell */}
      <div ref={chaosRef} className="absolute inset-0 z-10" />

      {/* Portal */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className={`relative w-64 h-64 animate-[spin_4s_linear_infinite] transition-all duration-700 ${portalBurst ? 'scale-110 blur-sm' : ''}`}>
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-emerald-400/30 ${portalBurst ? 'opacity-90' : 'opacity-60'} transition-all duration-300`} />
          
          {/* Middle ring */}
          <div className={`absolute inset-4 rounded-full border-4 border-emerald-500/50 ${portalBurst ? 'scale-105' : ''} animate-[spin_3s_linear_infinite_reverse] transition-all duration-500`} />
          
          {/* Core */}
          <div className={`absolute inset-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_80px_rgba(16,185,129,0.75)] ${portalBurst ? 'scale-110' : ''} transition-all duration-300`} />
        </div>
      </div>

      {/* Clarity World */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-1000 ${
          showClarity ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Hero Text */}
        <div className={`text-center mb-12 transition-all duration-700 delay-300 ${
          showClarity ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight">
            Haypbooks
          </h1>
          <p className="text-lg md:text-xl text-emerald-200 font-medium mb-6 max-w-xl">
            Bring order to your books — invoices, receipts, bank feeds, and reports in one place.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={handleEnter}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-semibold rounded-md shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Enter Haypbooks
            </button>
          </div>
        </div>


      </div>

      {/* ESC key listener */}
      <div className="sr-only">Press ESC to skip intro</div>
    </div>
  )
}
