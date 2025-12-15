'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';

// 3D Particle Class (defined outside component to avoid re-creation)
class Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  brightness: number;
  color: string;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.size = 0;
    this.brightness = 0;
    this.color = '';
    this.reset();
  }

  reset() {
    this.x = Math.random() * 2000 - 1000;
    this.y = Math.random() * 2000 - 1000;
    this.z = Math.random() * 2000;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.vz = -Math.random() * 2 - 1;
    this.size = Math.random() * 2 + 1;
    this.brightness = Math.random() * 0.5 + 0.5;

    // Teal color variations
    const colors = [
      'rgba(20, 184, 166',
      'rgba(13, 148, 136',
      'rgba(45, 212, 191',
      'rgba(94, 234, 212',
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    // Mouse interaction
    const dx = (mouseX - canvasWidth / 2) * 0.01;
    const dy = (mouseY - canvasHeight / 2) * 0.01;
    this.x += dx;
    this.y += dy;

    if (this.z < -100) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const fov = 500;
    const scale = fov / (fov + this.z);
    const x2d = this.x * scale + canvas.width / 2;
    const y2d = this.y * scale + canvas.height / 2;
    const size = this.size * scale;

    if (x2d < -50 || x2d > canvas.width + 50 || y2d < -50 || y2d > canvas.height + 50) return;
    if (size < 0.1) return;

    const depthOpacity = Math.max(0, Math.min(1, 1 - this.z / 2000));
    const alpha = this.brightness * depthOpacity;

    // Outer glow
    const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
    gradient.addColorStop(0, `${this.color}, ${alpha})`);
    gradient.addColorStop(0.3, `${this.color}, ${alpha * 0.5})`);
    gradient.addColorStop(1, `${this.color}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = `${this.color}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Stage timings (ms) - null means stay on that stage
const STAGE_DURATIONS = [2200, 2800, 2800, 2600, null];

export default function CinematicIntro() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const particlesRef = useRef<Particle3D[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    for (let i = 0; i < 150; i++) {
      particlesRef.current.push(new Particle3D());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.update(mouseRef.current.x, mouseRef.current.y, canvas.width, canvas.height);
        p.draw(ctx, canvas);
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Start intro after a short paint opportunity. Use rAF for reliability
    // (timeouts can be throttled when the tab is backgrounded or during rapid
    // navigations). Keep a short timeout fallback for environments where
    // rAF may be delayed.
    const startRaf = requestAnimationFrame(() => {
      if (process.env.NODE_ENV === 'development') console.debug('CinematicIntro: starting (rAF)')
      setIntroStarted(true)
    })
    const startTimeout = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') console.debug('CinematicIntro: starting (timeout)')
      setIntroStarted(true)
    }, 120)

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(startRaf)
      clearTimeout(startTimeout);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Stage progression
  useEffect(() => {
    const duration = STAGE_DURATIONS[currentStage];
    if (duration === null) return; // Stay on final stage

    const timer = setTimeout(() => {
      if (currentStage < STAGE_DURATIONS.length - 1) {
        setCurrentStage(currentStage + 1);
      }
    }, duration);

    timeoutsRef.current.push(timer);

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [currentStage]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Skip to final CTA stage
        setCurrentStage(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If the page is opened in the background or timers are throttled, ensure
  // the intro still starts once the document becomes visible.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !introStarted) {
        if (process.env.NODE_ENV === 'development') console.debug('CinematicIntro: visibilitychange -> starting')
        setIntroStarted(true)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [introStarted])

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  // Respect user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleExit = (cx?: number, cy?: number) => {
    // mark intro seen
    localStorage.setItem('haypbooks_intro_seen', 'true');

    // trigger base exiting visuals (canvas fade etc.)
    setIsExiting(true);

    // If reduced motion, navigate immediately
    if (prefersReducedMotion) {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      router.push('/landing');
      return;
    }

      // Trigger a simple fade transition (no expanding circle)
      // Allow one paint frame so CSS transitions take effect
      requestAnimationFrame(() => {
        setOverlayActive(true);
        // cleanup and nav after fade duration (~500ms)
        const t = setTimeout(() => {
          timeoutsRef.current.forEach((t) => clearTimeout(t));
          if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
          router.push('/landing');
        }, 500);
        timeoutsRef.current.push(t);
      });
  };

  const handleGetStarted = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (overlayActive) return; // guard
    // compute click center if available
    if (e && e.currentTarget) {
      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
      handleExit(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      handleExit();
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 intro-root"
    >
      {/* 3D Particles Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-[1] transition-opacity duration-[700ms] canvas ${isExiting ? 'canvas-exit' : introStarted ? 'canvas-visible' : ''}` }
      />

      {/* Glow Ring */}
      <div
        className={`absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0 glow-ring ${isExiting ? 'glow-exit' : introStarted ? 'glow-visible' : ''}`}
      />

      {/* Stage Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Stage 1: Opening Hook */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[250ms] ease-in-out ${
            currentStage === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-3xl md:text-4xl text-slate-300 font-light max-w-3xl px-8 leading-relaxed">
            <span className={`reveal-line ${currentStage === 0 ? 'active' : ''}`}>
              Your business deserves better.
            </span>
          </p>
        </div>

        {/* Stage 2: Problem Statements */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[250ms] ease-in-out ${
            currentStage === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-2xl md:text-3xl text-slate-400 font-light max-w-4xl px-8 leading-relaxed">
            <span className={`reveal-line delay-0 ${currentStage === 1 ? 'active' : ''}`}>
              Crashing spreadsheets.
            </span>
            <br />
            <span className={`reveal-line delay-1 ${currentStage === 1 ? 'active' : ''}`}>
              Lost invoices.
            </span>
            <br />
            <span className={`reveal-line delay-2 ${currentStage === 1 ? 'active' : ''}`}>
              Stolen weekends.
            </span>
            <br />
            <span className={`reveal-line delay-3 ${currentStage === 1 ? 'active' : ''}`}>
              Enough is enough.
            </span>
          </p>
        </div>

        {/* Stage 3: Brand Reveal */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-[250ms] ease-in-out ${
            currentStage === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h1 className={`text-8xl md:text-9xl font-extrabold tracking-tight mb-8 text-white logo-reveal ${currentStage === 2 ? 'active' : ''}`}>
            HaypBooks
          </h1>
          <p className={`text-2xl md:text-3xl text-teal-200 max-w-3xl leading-relaxed px-8 tagline-reveal ${currentStage === 2 ? 'active' : ''}`}>
            Professional accounting software.
            <br />
            <span className="font-semibold">Built for businesses that move fast.</span>
          </p>
        </div>

        {/* Stage 4: Benefits */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[250ms] ease-in-out ${
            currentStage === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-4xl px-8 space-y-6">
            <div className={`text-xl md:text-2xl text-teal-100 benefit-item delay-0 ${currentStage === 3 ? 'active' : ''}`}>
              <span className="font-semibold text-teal-300">✓</span> Invoice in seconds
            </div>
            <div className={`text-xl md:text-2xl text-teal-100 benefit-item delay-1 ${currentStage === 3 ? 'active' : ''}`}>
              <span className="font-semibold text-teal-300">✓</span> Bank feeds sync automatically
            </div>
            <div className={`text-xl md:text-2xl text-teal-100 benefit-item delay-2 ${currentStage === 3 ? 'active' : ''}`}>
              <span className="font-semibold text-teal-300">✓</span> Real-time reports, anywhere
            </div>
            <div className={`text-xl md:text-2xl text-teal-100 benefit-item delay-3 ${currentStage === 3 ? 'active' : ''}`}>
              <span className="font-semibold text-teal-300">✓</span> One powerful system
            </div>
          </div>
        </div>

        {/* Stage 5: Final CTA */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-[250ms] ease-in-out ${
            currentStage === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h2 className={`text-5xl md:text-6xl font-bold mb-12 text-white cta-headline ${currentStage === 4 ? 'active' : ''}`}>
            Ready to take control?
          </h2>
          <button
            ref={buttonRef}
            onClick={handleGetStarted}
            className={`relative px-12 py-6 text-xl font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-teal-500/50 overflow-hidden z-10 group cta-button ${currentStage === 4 ? 'active' : ''}`}
            aria-label="Get Started Free"
          >
            <span className="relative z-10">Get Started Free</span>
            {/* Expanding white circle on hover */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-white/30 rounded-full transition-all duration-[600ms] group-hover:w-[300px] group-hover:h-[300px] -z-10" />
            {/* Pulsing glow */}
            <span className="absolute inset-0 rounded-full bg-teal-400 opacity-40 blur-xl animate-pulse"></span>
          </button>

          {/* Exit overlay (expanding circle transition) */}
          <div
            aria-hidden
            className={`exit-overlay ${overlayActive ? 'exit-active' : ''}`}
          />

          {/* Landing peek: subtle darker teal/emerald gradient with faint grid to hint the landing page */}
          <div
            aria-hidden
            className={`landing-peek ${overlayActive ? 'landing-peek-active' : ''}`}
          />

          {/* Full-screen fade overlay to blend intro -> landing peek */}
          <div
            aria-hidden
            className={`fade-overlay ${overlayActive ? 'active' : ''}`}
          />

          {/* Dim the intro content while overlay/peek is active */}
          <div className={`absolute z-10 inset-0 pointer-events-none transition-opacity duration-[700ms] ${overlayActive ? 'content-dim' : ''}`} />
          <p className={`mt-8 text-slate-400 text-sm cta-subtext ${currentStage === 4 ? 'active' : ''}`}>
            No credit card required • 30-day trial
          </p>
        </div>
      </div>

      {/* Keyboard Hint (hide during exit/overlay) */}
      <p className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-sm z-50 transition-opacity duration-300 ${overlayActive || isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        Press <kbd className="px-2 py-1 bg-slate-800 rounded">Enter</kbd> to skip
      </p>

      {/* CSS Animations */}
      <style jsx>{`
        /* Hide scrollbars for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }

        /* Base states - elements start invisible */
        .reveal-line {
          display: inline-block;
          opacity: 0;
          transform: translateY(12px) translateZ(0);
          will-change: transform, opacity;
        }

        .reveal-line.active {
          animation: revealText 850ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Staggered delays for smooth cadence */
        .reveal-line.delay-0.active { animation-delay: 0s; }
        .reveal-line.delay-1.active { animation-delay: 0.18s; }
        .reveal-line.delay-2.active { animation-delay: 0.36s; }
        .reveal-line.delay-3.active { animation-delay: 0.54s; }

        /* Respect user preference for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .reveal-line,
          .logo-reveal,
          .tagline-reveal,
          .benefit-item,
          .cta-headline,
          .cta-button,
          .cta-subtext {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        .logo-reveal {
          opacity: 0;
          transform: scale(0.8);
          letter-spacing: 0.3em;
        }

        .logo-reveal.active {
          animation: logoReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .tagline-reveal {
          opacity: 0;
          transform: translateY(15px);
        }

        .tagline-reveal.active {
          animation: taglineReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        .benefit-item {
          opacity: 0;
          transform: translateX(-40px);
        }

        .benefit-item.active.delay-0 {
          animation: benefitReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0s forwards;
        }

        .benefit-item.active.delay-1 {
          animation: benefitReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }

        .benefit-item.active.delay-2 {
          animation: benefitReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        .benefit-item.active.delay-3 {
          animation: benefitReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
        }

        .cta-headline {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }

        .cta-headline.active {
          animation: ctaHeadlineReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .cta-button {
          opacity: 0;
          transform: scale(0.9);
        }

        .cta-button.active {
          animation: ctaButtonReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards,
            ctaPulse 2s ease-in-out 1.5s infinite;
        }

        .cta-subtext {
          opacity: 0;
        }

        .cta-subtext.active {
          animation: ctaSubtextReveal 0.6s ease 0.8s forwards;
        }

        /* Canvas and glow ring states */
        .canvas { opacity: 0; }
        .canvas-visible { opacity: 0.8; }
        .canvas-exit { opacity: 0; transition: opacity 600ms ease-out; }

        .glow-ring { background: radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%); transform: translate(-50%, -50%) scale(0); opacity: 0; }
        .glow-visible { transform: translate(-50%, -50%) scale(1); opacity: 0.7; transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms cubic-bezier(0.16, 1, 0.3, 1); }
        .glow-exit { transform: translate(-50%, -50%) scale(0); opacity: 0; transition: transform 200ms ease, opacity 200ms ease; }

        /* Exit overlay */
        :root {
          --exit-x: 50%;
          --exit-y: 50%;
        }

        /* Exit overlay removed - use fade only */
        .exit-overlay { display: none; }

        /* Landing peek */
        .landing-peek {
          position: fixed;
          inset: 0;
          z-index: 48;
          pointer-events: none;
          opacity: 0;
          transition: opacity 700ms ease, filter 700ms ease;
          background-image: radial-gradient(ellipse at 20% 20%, rgba(6,46,43,0.95) 0%, rgba(9,81,73,0.85) 30%, rgba(12,100,90,0.75) 60%, rgba(8,75,66,0.6) 100%),
                            repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 48px);
          background-blend-mode: overlay, normal;
          filter: blur(4px) saturate(105%);
        }

        .landing-peek.landing-peek-active {
          opacity: 0.44; /* stronger peek */
          filter: blur(2px) saturate(115%);
          transition: opacity 500ms ease, filter 500ms ease;
        }

        /* Fade overlay blends the scene into the landing palette */
        .fade-overlay {
          position: fixed;
          inset: 0;
          z-index: 49;
          pointer-events: none;
          opacity: 0;
          transition: opacity 500ms ease;
          background: linear-gradient(180deg, rgba(6,46,43,0) 0%, rgba(6,46,43,0.85) 100%);
          mix-blend-mode: multiply;
          backdrop-filter: blur(2px);
        }

        .fade-overlay.active {
          opacity: 1;
        }

        /* Dim the content so the landing peek is more visible */
        .content-dim {
          opacity: 0.18 !important;
          transform: scale(0.998);
          transition: opacity 700ms ease, transform 700ms ease;
        }

        /* Root helper */
        .intro-root {
          font-family: var(--font-inter, Inter, system-ui, -apple-system, sans-serif);
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        /* Keyframe definitions */
        @keyframes revealText {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.8);
            letter-spacing: 0.3em;
          }
          100% {
            opacity: 1;
            transform: scale(1);
            letter-spacing: -0.02em;
          }
        }

        @keyframes taglineReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes benefitReveal {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes ctaHeadlineReveal {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ctaButtonReveal {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ctaSubtextReveal {
          to {
            opacity: 1;
          }
        }

        @keyframes ctaPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
