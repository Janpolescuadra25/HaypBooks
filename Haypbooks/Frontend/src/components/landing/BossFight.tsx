"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import {
  CloudRain,
  PenLine,
  FileSpreadsheet,
  AlarmClock,
  Wand2,
  Camera,
  BarChart3,
  Lock,
  ClipboardList,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { PixelLabel } from "./Hud";

const PHASES = [
  {
    at: 0.2,
    attack: "Statement Pile-Up",
    attackDesc: "Hundreds of unmatched bank transactions pile up on your desk.",
    counter: "Auto Bank Feeds + Smart Matching",
    counterDesc: "Feeds sync, rules categorize, HaypBooks matches transactions for you.",
    AttackIcon: CloudRain,
    CounterIcon: Wand2,
    dmg: "-24%",
  },
  {
    at: 0.38,
    attack: "Manual Entry Overload",
    attackDesc: "Retyping receipts until midnight. Thumbs cramping. Patience gone.",
    counter: "Snap-and-Go Expense Capture",
    counterDesc: "Photograph the receipt — expenses land categorized and audit-ready.",
    AttackIcon: PenLine,
    CounterIcon: Camera,
    dmg: "-26%",
  },
  {
    at: 0.56,
    attack: "Spreadsheet Sprawl",
    attackDesc: "v27_FINAL_final2_REAL.xlsx. Nobody knows which total is true.",
    counter: "Live Trial Balance & Dashboards",
    counterDesc: "One source of truth. Reports refresh in real time — no version confusion.",
    AttackIcon: FileSpreadsheet,
    CounterIcon: BarChart3,
    dmg: "-28%",
  },
  {
    at: 0.74,
    attack: "Deadline Pressure",
    attackDesc: "Auditors circling. Close date tomorrow. Stress rising.",
    counter: "Guided Close Workflow",
    counterDesc: "Accounting periods, sign-offs and period locks — one click to seal it.",
    AttackIcon: AlarmClock,
    CounterIcon: Lock,
    dmg: "-22%",
  },
];

export default function BossFight() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const hpScale = useTransform(scrollYProgress, [0.12, 0.85], [1, 0]);
  const [hpPct, setHpPct] = useState(100);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hit, setHit] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const pct = Math.round(Math.max(0, Math.min(1, (v - 0.12) / 0.73)) * 100);
    setHpPct(pct);
    let idx = -1;
    PHASES.forEach((p, i) => {
      if (v >= p.at) idx = i;
    });
    if (idx !== activeIdx) {
      setActiveIdx(idx);
      if (idx >= 0) {
        setHit(true);
        window.setTimeout(() => setHit(false), 320);
      }
    }
  });

  const victoryOpacity = useTransform(scrollYProgress, [0.86, 0.94], [0, 1]);
  const victoryScale = useTransform(scrollYProgress, [0.86, 0.94], [0.8, 1]);
  const bossOpacity = useTransform(scrollYProgress, [0.86, 0.94], [1, 0.06]);
  const bossHurtX = hit ? [0, -10, 10, -6, 6, 0] : 0;

  return (
    <section id="boss" ref={ref} className="relative z-10" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* ambient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-quest-50/60 to-white pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full bg-quest-100/40 blur-[130px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          {/* nameplate */}
          <div className="text-center">
            <PixelLabel className="text-quest-600">— EVERY BUSINESS KNOWS THIS WEEK —</PixelLabel>
            <h2 className="mt-4 font-display font-black uppercase text-navy-800 text-3xl sm:text-5xl leading-tight">
              The Month-End{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-700 to-navy-500">Close</span>
            </h2>
            <p className="mt-3 font-head text-navy-700/80 max-w-2xl mx-auto text-sm sm:text-base">
              The hardest week of every month — spreadsheet chaos, endless matching,
              deadline stress. Scroll and watch HaypBooks clear every obstacle.
            </p>
          </div>

          {/* workload bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-navy-700">
                <ClipboardList className="w-4 h-4 text-navy-600" />
                Manual Workload
              </span>
              <span className="font-display text-sm font-black text-navy-800">{hpPct}%</span>
            </div>
            <div className="relative h-5 rounded-lg bg-navy-900/10 border border-navy-900/15 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-navy-700 via-navy-600 to-navy-500"
                style={{ scaleX: hpScale }}
              />
              <div className="absolute inset-0 flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className="flex-1 border-r border-white/10 last:border-0" />
                ))}
              </div>
            </div>
          </div>

          {/* battle stage */}
          <div className="relative mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
            {/* boss sprite */}
            <motion.div style={{ opacity: bossOpacity }} className="relative mx-auto">
              <motion.div animate={{ x: bossHurtX }} transition={{ duration: 0.32 }}>
                <div className="relative w-56 h-56 sm:w-72 sm:h-72">
                  {/* aggro rings */}
                  <span className="absolute -inset-6 rounded-full border-2 border-dashed border-navy-300/50 hb-spin-slow" />
                  <span className="absolute -inset-12 rounded-full border border-quest-300/40 hb-spin-slow" style={{ animationDirection: "reverse" }} />

                  {/* spreadsheet chaos */}
                  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_18px_36px_rgba(8,22,49,0.25)]" role="img" aria-label="The month-end close — a spreadsheet monster">
                    <defs>
                      <linearGradient id="bossBody" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1b4274" />
                        <stop offset="100%" stopColor="#0c1f42" />
                      </linearGradient>
                      <linearGradient id="bossGrid" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    {/* horns */}
                    <path d="M40,58 L28,18 L62,42 Z" fill="#123058" />
                    <path d="M160,58 L172,18 L138,42 Z" fill="#123058" />
                    {/* body */}
                    <rect x="30" y="42" width="140" height="120" rx="18" fill="url(#bossBody)" />
                    {/* grid face */}
                    <rect x="46" y="58" width="108" height="88" rx="8" fill="#ffffff" opacity="0.94" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line key={`h${i}`} x1="46" y1={58 + (i + 1) * (88 / 6)} x2="154" y2={58 + (i + 1) * (88 / 6)} stroke="#0c1f42" strokeOpacity="0.14" strokeWidth="2" />
                    ))}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line key={`v${i}`} x1={46 + (i + 1) * (108 / 6)} y1="58" x2={46 + (i + 1) * (108 / 6)} y2="146" stroke="#0c1f42" strokeOpacity="0.14" strokeWidth="2" />
                    ))}
                    {/* angry eyes */}
                    <g>
                      <circle cx="82" cy="92" r="10" fill="url(#bossGrid)" />
                      <circle cx="118" cy="92" r="10" fill="url(#bossGrid)" />
                      <circle cx="82" cy="92" r="4" fill="#050f24" />
                      <circle cx="118" cy="92" r="4" fill="#050f24" />
                      <line x1="68" y1="76" x2="92" y2="84" stroke="#050f24" strokeWidth="5" strokeLinecap="round" />
                      <line x1="132" y1="76" x2="108" y2="84" stroke="#050f24" strokeWidth="5" strokeLinecap="round" />
                    </g>
                    {/* frown */}
                    <path d="M76,126 Q100,114 124,126" stroke="#050f24" strokeWidth="5" fill="none" strokeLinecap="round" />
                    {/* error cell */}
                    <rect x="128" y="120" width="20" height="14" rx="3" fill="#f87171" opacity="0.85" />
                    <text x="138" y="131" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">#ERR</text>
                  </svg>
                </div>
              </motion.div>

              {/* damage number */}
              {activeIdx >= 0 && !hit && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -46, scale: 1 }}
                  transition={{ duration: 1.1 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 font-display font-black text-2xl text-quest-600 drop-shadow"
                >
                  {PHASES[activeIdx].dmg}
                </motion.div>
              )}
            </motion.div>

            {/* phase cards */}
            <div className="grid gap-3 sm:gap-4">
              {PHASES.map((p, i) => {
                const active = i === activeIdx;
                const done = i < activeIdx;
                return (
                  <motion.div
                    key={p.attack}
                    initial={false}
                    animate={{
                      opacity: active || done ? 1 : 0.3,
                      scale: active ? 1.02 : 1,
                      x: active ? 10 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`relative rounded-2xl border p-4 sm:p-5 backdrop-blur transition-colors duration-300 ${
                      active
                        ? "bg-white border-quest-400 shadow-[0_16px_40px_rgba(16,185,129,0.22)]"
                        : done
                          ? "bg-quest-50/80 border-quest-200"
                          : "bg-white/60 border-navy-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-colors ${
                        done ? "bg-quest-500 text-white" : active ? "bg-navy-800 text-quest-300" : "bg-navy-900/10 text-navy-500"
                      }`}>
                        {done ? <p.CounterIcon className="w-5 h-5" /> : <p.AttackIcon className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-pixel text-[8px] text-navy-400">STEP {i + 1}</span>
                          <span className="font-display text-sm font-extrabold uppercase tracking-wide text-navy-800">
                            {done ? p.counter : p.attack}
                          </span>
                        </div>
                        <p className="mt-1 font-head text-[13px] leading-relaxed text-navy-600/90">
                          {done ? p.counterDesc : (
                            <>
                              <span className="flex items-center gap-1.5 text-navy-700 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 text-navy-500" /> {p.attackDesc}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5 text-quest-700 font-semibold">
                                <p.CounterIcon className="w-3.5 h-3.5" /> HaypBooks: {p.counter}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      {done && (
                        <span className="ml-auto font-pixel text-[8px] text-quest-600 shrink-0">SOLVED</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* victory banner */}
          <motion.div
            style={{ opacity: victoryOpacity, scale: victoryScale }}
            className="absolute inset-x-4 sm:inset-x-8 lg:inset-x-0 lg:left-1/2 lg:-translate-x-1/2 bottom-6 lg:bottom-10 lg:max-w-3xl lg:w-full pointer-events-none"
          >
            <div className="relative bg-navy-800 border-2 border-quest-400 rounded-3xl px-6 sm:px-10 py-7 text-center shadow-[0_30px_80px_rgba(8,22,49,0.45)] overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-quest-500/25 blur-3xl" />
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-6 h-6 text-quest-400" />
                <span className="font-display font-black uppercase text-2xl sm:text-3xl text-white tracking-wider">
                  Month-End, Conquered
                </span>
              </div>
              <p className="mt-2 font-head text-quest-200 text-sm sm:text-base">
                Month-end closed in hours, not weeks.
              </p>
              <p className="mt-3 font-pixel text-[10px] text-quest-400">YOUR WEEKENDS — RESTORED</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
