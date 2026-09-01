"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { armAuthTransition } from "@/lib/authEntrance";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { Play, ChevronDown, Sparkles, TrendingUp, Zap, Trophy, Coins } from "lucide-react";
import { HudFrame, PixelLabel } from "./Hud";

const headlineWords = ["TAKE", "CONTROL", "OF"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scaleContent = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 140, damping: 18 });

  const onTilt = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const resetTilt = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-24"
      onPointerMove={onTilt}
      onPointerLeave={resetTilt}
    >
      <div className="absolute bottom-0 left-0 right-0 h-72 overflow-hidden pointer-events-none" aria-hidden>
        <div className="hb-grid-floor absolute inset-0" />
      </div>

      <motion.div style={{ y: yBg, opacity: opacityContent }} className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
          <motion.div style={{ y: yContent, scale: scaleContent }} className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="inline-flex justify-center"
            >
              <HudFrame className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur border border-navy-900/10 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-quest-500" />
                <PixelLabel className="text-navy-700">NEW ERA OF ACCOUNTING • EST. 2026</PixelLabel>
                <span className="w-1.5 h-1.5 rounded-full bg-quest-500 hb-blink" />
              </HudFrame>
            </motion.div>

            <h1 className="mt-7 font-display font-black uppercase text-navy-800 text-[2.6rem] sm:text-6xl xl:text-7xl leading-[1.04] tracking-tight">
              {headlineWords.map((w, i) => (
                <motion.span
                  key={w}
                  className="inline-block mr-[0.28em]"
                  initial={{ opacity: 0, y: 40, rotateX: -60, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-quest-600 via-quest-500 to-navy-600 hb-glow"
                initial={{ opacity: 0, y: 40, rotateX: -60, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.64, ease: [0.22, 1, 0.36, 1] }}
              >
                YOUR BOOKS.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 text-base sm:text-lg leading-relaxed text-navy-700/85 max-w-xl mx-auto lg:mx-0"
            >
              HaypBooks brings your entire accounting into one clean, real-time dashboard — double-entry precision, bank reconciliation, invoicing, payroll, inventory and tax-ready reports.{' '}
              <span className="font-semibold text-navy-800">All the power, none of the spreadsheet chaos.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
              className="mt-9 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                onClick={armAuthTransition}
                className="group relative inline-flex items-center gap-3 bg-quest-500 hover:bg-quest-600 text-white font-display font-bold tracking-wider uppercase text-sm px-8 py-4 rounded-2xl hb-pulse-glow hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Free — 14 Days
                <span className="absolute inset-0 rounded-2xl border border-white/25 pointer-events-none" />
              </Link>
              <a
                href="#worlds"
                className="inline-flex items-center gap-3 bg-white/85 backdrop-blur border-2 border-navy-800 text-navy-800 font-display font-bold tracking-wider uppercase text-sm px-8 py-[14px] rounded-2xl hb-pixel-shadow"
              >
                <span className="font-pixel text-[9px]">▶ EXPLORE THE PLATFORM</span>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-2 font-head text-xs sm:text-sm text-navy-600"
            >
              <span className="px-2.5 py-1 rounded-md bg-quest-50 border border-quest-200 text-quest-700 font-semibold">Create account</span>
              <span className="text-navy-300">→</span>
              <span className="px-2.5 py-1 rounded-md bg-navy-50 border border-navy-200 text-navy-700 font-semibold">Send your first invoice</span>
              <span className="text-navy-300">→</span>
              <span className="px-2.5 py-1 rounded-md bg-navy-800 text-quest-300 font-semibold">Close month-end with confidence</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ perspective: 1200 }}
          >
            <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
              <HudFrame corners="border-quest-500/70" className="rounded-3xl">
                <div className="relative bg-white/90 backdrop-blur-xl border border-navy-900/10 rounded-3xl p-6 shadow-[0_30px_80px_rgba(8,22,49,0.14)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-quest-500 hb-blink" />
                      <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-navy-700">
                        Real-Time Cash Flow
                      </span>
                    </div>
                    <span className="font-pixel text-[8px] text-quest-600">LIVE</span>
                  </div>

                  <div className="mt-4 relative">
                    <svg viewBox="0 0 400 150" className="w-full h-40" role="img" aria-label="Cash flow chart trending upward">
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#1b4274" />
                        </linearGradient>
                      </defs>
                      {[30, 70, 110].map((y) => (
                        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#0c1f42" strokeOpacity="0.06" />
                      ))}
                      <motion.path
                        d="M0,110 C40,100 60,70 100,78 C140,86 160,50 200,58 C240,66 260,34 300,42 C340,50 370,20 400,26 L400,150 L0,150 Z"
                        fill="url(#heroGrad)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.4, delay: 1.2 }}
                      />
                      <motion.path
                        d="M0,110 C40,100 60,70 100,78 C140,86 160,50 200,58 C240,66 260,34 300,42 C340,50 370,20 400,26"
                        fill="none"
                        stroke="url(#heroLine)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, delay: 1.1, ease: 'easeOut' }}
                      />
                      <motion.circle
                        cx="400"
                        cy="26"
                        r="5"
                        fill="#10b981"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.6, type: 'spring', bounce: 0.6 }}
                      />
                    </svg>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.2, type: 'spring', bounce: 0.5 }}
                      className="absolute right-3 top-0 font-display font-black text-quest-600 text-lg"
                    >
                      +24.8%
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Revenue', value: '₱428,000', icon: TrendingUp, cls: 'text-quest-600 bg-quest-50 border-quest-200' },
                      { label: 'Expenses', value: '₱118,350', icon: Coins, cls: 'text-navy-700 bg-navy-50 border-navy-200' },
                      { label: 'Runway', value: '18 mo', icon: Zap, cls: 'text-quest-700 bg-quest-50 border-quest-200' },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl border px-3 py-2.5 ${s.cls}`}>
                        <s.icon className="w-3.5 h-3.5" />
                        <div className="mt-1 font-display text-[11px] font-bold text-navy-800">{s.value}</div>
                        <div className="font-head text-[10px] text-navy-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </HudFrame>

              <motion.div
                className="absolute -left-6 -top-7 sm:-left-10 bg-white border border-navy-900/10 rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(8,22,49,0.14)] flex items-center gap-2.5"
                style={{ transform: 'translateZ(60px)' }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-9 h-9 rounded-xl bg-quest-500 text-white grid place-items-center shadow-[0_6px_16px_rgba(16,185,129,0.4)]">
                  <TrendingUp className="w-4.5 h-4.5" />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-navy-800">SMART MATCH</span>
                  <span className="block font-head text-[11px] text-navy-500">auto-reconciliations this week</span>
                </span>
              </motion.div>

              <motion.div
                className="absolute -right-4 sm:-right-8 top-1/3 bg-navy-800 text-white rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(8,22,49,0.3)] flex items-center gap-2.5"
                style={{ transform: 'translateZ(80px)' }}
                animate={{ y: [0, 14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              >
                <Trophy className="w-5 h-5 text-quest-400" />
                <span>
                  <span className="block font-display text-sm font-bold">MILESTONE</span>
                  <span className="block font-head text-[11px] text-quest-300">30-day reconciliation streak</span>
                </span>
              </motion.div>

              <motion.div
                className="absolute -bottom-7 left-8 bg-white border border-navy-900/10 rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(8,22,49,0.14)]"
                style={{ transform: 'translateZ(50px)' }}
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <span className="flex items-center gap-2">
                  <Image src="/hb-logo.png" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
                  <span className="font-pixel text-[9px] text-quest-600">MONTH CLOSED</span>
                  <span className="font-head text-[11px] text-navy-500">3 days early</span>
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-navy-600 hover:text-quest-600 transition-colors"
        aria-label="Scroll to explore"
      >
        <PixelLabel className="text-[8px]">SCROLL TO EXPLORE</PixelLabel>
        <span className="w-6 h-10 rounded-full border-2 border-current grid place-items-start p-1.5">
          <span className="w-2 h-2 rounded-full bg-current hb-scroll-dot" />
        </span>
        <ChevronDown className="w-4 h-4 hb-blink" />
      </motion.a>
    </section>
  );
}
