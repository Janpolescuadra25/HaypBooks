"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { BarChart3, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  peekAuthTransitionArmed,
  disarmAuthTransition,
} from "../../lib/authEntrance";
import BrandCanvas from "./BrandCanvas";

/**
 * AuthShell — split-screen auth layout, mirroring the real HaypBooks app:
 * left brand/story panel with a calm, non-interactive living background
 * ("Minimal Constellation": sparse drifting dots + faint links + breathing
 * grid), right white form panel (the only scrollable side).
 */

const STORY = [
  {
    icon: BarChart3,
    title: "Crystal Clear Insights",
    desc: "Visualize your financial health with real-time analytics and beautiful reports that tell the story of your growth.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    desc: "Your data is protected with industry-leading encryption. We keep your ledgers safe so you can focus on your business.",
  },
  {
    icon: Zap,
    title: "Automated Magic",
    desc: "Say goodbye to manual entry. HaypBooks automates your bookkeeping, saving you hours of tedious work every week.",
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const reduced = useReducedMotion();
  // Cinematic entrance plays ONLY when arriving from the landing page
  // (or a fresh direct load). Auth <-> auth switches render instantly.
  const [play] = useState(peekAuthTransitionArmed);
  useEffect(() => {
    disarmAuthTransition();
  }, []);
  const cine = play && !reduced;
  return (
    <div className="h-dvh max-h-dvh w-full flex bg-white overflow-hidden">
      {/* ---------- LEFT BRAND PANEL (desktop, FIXED — never scrolls) ---------- */}
      <motion.aside
        initial={cine ? { clipPath: "inset(0 100% 0 0)" } : false}
        animate={cine ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 0% 0 0)" }}
        transition={cine ? { duration: 0.75, ease: EASE } : { duration: 0 }}
        className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative shrink-0 flex-col justify-between overflow-hidden bg-navy-950 text-white p-12 xl:p-16">
        {/* layered CALM background — slow, non-interactive */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-[#06281f]" />
          <div className="absolute inset-0 opacity-[0.12] hb-dots" />

          {/* minimal constellation canvas — sparse slow dots + faint links (no mouse interaction) */}
          <BrandCanvas />

          {/* one soft grounding glow — very slow drift */}
          <motion.div
            className="absolute -bottom-40 right-0 w-[520px] h-[520px] rounded-full bg-quest-400/10 blur-[130px]"
            animate={{ x: [0, -36, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* faint grid floor — gently breathing */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-2/5 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px] [transform:perspective(500px)_rotateX(28deg)] [transform-origin:bottom]"
            animate={reduced ? undefined : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* one-time entrance sheen — a soft emerald light sweeps across as the panel lands */}
          {cine && (
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-1/3 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 0%, rgba(52,211,153,0.08) 40%, rgba(255,255,255,0.13) 50%, rgba(52,211,153,0.08) 60%, transparent 100%)",
              }}
              initial={{ x: "-150%", opacity: 0 }}
              animate={{ x: "380%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, delay: 0.55, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* logo — drops in once the wipe passes it */}
        <motion.div
          initial={cine ? { opacity: 0, y: -14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={cine ? { delay: 0.35, duration: 0.55, ease: EASE } : { duration: 0 }}
          className="relative z-10 w-fit"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 grid place-items-center p-1.5 backdrop-blur group-hover:scale-105 transition-transform">
              <Image src="/hb-logo.png" alt="HaypBooks logo" width={44} height={44} className="w-full h-full object-contain" />
            </span>
            <span className="font-display font-extrabold text-xl tracking-widest">
              HAYP<span className="text-quest-400">BOOKS</span>
            </span>
          </Link>
        </motion.div>

        {/* story items */}
        <div className="relative z-10 max-w-md space-y-9">
          {STORY.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={cine ? { opacity: 0, x: -24 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={cine ? { delay: 0.5 + i * 0.16, duration: 0.6, ease: EASE } : { duration: 0 }}
                className="flex gap-5"
              >
                <motion.div
                  className="shrink-0 w-12 h-12 rounded-full bg-quest-500/10 border border-quest-400/25 grid place-items-center"
                  animate={reduced ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 4.2 + i * 0.55, repeat: Infinity, ease: "easeInOut", delay: 0.9 + i * 0.7 }}
                >
                  <Icon className="w-5 h-5 text-quest-400" />
                </motion.div>
                <div>
                  <h3 className="font-head font-bold text-lg text-white">{s.title}</h3>
                  <p className="mt-1 font-head text-sm leading-relaxed text-navy-100/60">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* footer line */}
        <motion.p
          initial={cine ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={cine ? { delay: 1.05, duration: 0.8 } : { duration: 0 }}
          className="relative z-10 flex items-center gap-2 font-pixel text-[8px] text-navy-300/60 tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-quest-400 hb-blink" />
          TRUSTED BY MODERN ACCOUNTANTS
        </motion.p>
      </motion.aside>

      {/* ---------- RIGHT FORM PANEL (ONLY this side scrolls) ---------- */}
      <main className="flex-1 min-w-0 h-full flex flex-col relative overflow-y-auto overscroll-contain">
        {/* soft top glow — pinned to the top of the scroll area */}
        <div aria-hidden className="pointer-events-none sticky top-0 z-0 h-0">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-quest-50/70 to-transparent" />
        </div>

        {/* mobile logo */}
        <div className="lg:hidden relative z-10 flex items-center justify-center pt-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-white border border-navy-900/10 shadow-sm grid place-items-center p-1">
              <Image src="/hb-logo.png" alt="HaypBooks logo" width={36} height={36} className="w-full h-full object-contain" />
            </span>
            <span className="font-display font-extrabold tracking-widest text-navy-800">
              HAYP<span className="text-quest-600">BOOKS</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto my-auto px-6 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <motion.div
            initial={cine ? { opacity: 0, y: 26 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={cine ? { duration: 0.65, delay: 0.3, ease: EASE } : { duration: 0 }}
          >
            <h1 className="font-display font-extrabold text-3xl text-navy-900 tracking-tight">{title}</h1>
            <p className="mt-2 font-head text-[15px] text-navy-500 leading-relaxed">{subtitle}</p>
          </motion.div>
          <motion.div
            initial={cine ? { opacity: 0, y: 26 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={cine ? { duration: 0.65, delay: 0.45, ease: EASE } : { duration: 0 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
