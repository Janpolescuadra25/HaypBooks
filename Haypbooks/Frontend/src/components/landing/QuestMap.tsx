"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Camera, Landmark, BookOpenCheck, BarChart3, Scale } from "lucide-react";
import { SectionHeading, PixelLabel } from "./Hud";

const STEPS = [
  {
    icon: Camera,
    name: "Capture Every Expense",
    desc: "Snap receipts, log expenses and mileage on the go — every peso of spend lands in the right account, audit-ready.",
    chip: "MOBILE-FIRST",
    side: "left" as const,
  },
  {
    icon: Landmark,
    name: "Tame the Bank Feeds",
    desc: "Connect accounts, import statements and let smart rules match transactions. Reconciliation takes minutes, not evenings.",
    chip: "SMART RULES",
    side: "right" as const,
  },
  {
    icon: BookOpenCheck,
    name: "Post the Journals",
    desc: "Double-entry precision with one-click posting and void — the general ledger stays balanced by construction.",
    chip: "ONE CLICK",
    side: "left" as const,
  },
  {
    icon: BarChart3,
    name: "Build the Reports",
    desc: "P&L, balance sheet and cash flow, refreshed live. Standard reports with drill-downs and one-click exports.",
    chip: "REAL-TIME",
    side: "right" as const,
  },
  {
    icon: Scale,
    name: "Own Tax Season",
    desc: "Tax-ready report templates, period locks and a full audit trail — filing season becomes a formality.",
    chip: "AUDIT-READY",
    side: "left" as const,
  },
];

export default function QuestMap() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const pathLength = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <section id="quests" className="relative z-10 py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="HOW IT WORKS"
          title={
            <>
              From receipts to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-600 to-navy-600">reports</span>
            </>
          }
          sub="Five steps stand between chaos and a clean set of books. HaypBooks walks the whole path with you — and shows your progress in real time."
        />

        <div ref={ref} className="relative mt-16">
          {/* the path */}
          <svg
            className="absolute left-[26px] sm:left-1/2 top-0 h-full w-8 sm:w-14 -translate-x-0 sm:-translate-x-1/2 overflow-visible pointer-events-none"
            viewBox="0 0 40 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="questPath" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#1b4274" />
              </linearGradient>
            </defs>
            {/* faint full path */}
            <path
              d="M20,0 C60,120 -20,240 20,360 C60,480 -20,600 20,720 C60,840 -20,920 20,1000"
              fill="none"
              stroke="#0c1f42"
              strokeOpacity="0.1"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* animated draw */}
            <motion.path
              d="M20,0 C60,120 -20,240 20,360 C60,480 -20,600 20,720 C60,840 -20,920 20,1000"
              fill="none"
              stroke="url(#questPath)"
              strokeWidth="5"
              strokeLinecap="round"
              style={{ pathLength }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative space-y-10 sm:space-y-16">
            {STEPS.map((q, i) => (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-start gap-5 sm:gap-0 ${
                  q.side === "right" ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* node */}
                <div className="relative z-10 shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                  <span className="relative grid place-items-center w-[54px] h-[54px] rounded-2xl bg-white border-2 border-quest-500 shadow-[0_10px_28px_rgba(16,185,129,0.3)]">
                    <q.icon className="w-6 h-6 text-quest-600" />
                    <span className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full bg-navy-800 text-white font-display text-[10px] font-bold border-2 border-white">
                      {i + 1}
                    </span>
                  </span>
                </div>

                {/* card */}
                <div className={`sm:w-1/2 ${q.side === "right" ? "sm:pr-16" : "sm:pl-16"} sm:py-2`}>
                  <div className="group bg-white/90 backdrop-blur border border-navy-900/10 rounded-2xl p-5 sm:p-6 hover:border-quest-400/60 hover:shadow-[0_18px_44px_rgba(8,22,49,0.12)] hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display font-extrabold text-navy-800 uppercase tracking-wide text-base sm:text-lg">
                        {q.name}
                      </h3>
                      <PixelLabel className="text-quest-600 shrink-0">{q.chip}</PixelLabel>
                    </div>
                    <p className="mt-2 font-head text-sm leading-relaxed text-navy-600/90">{q.desc}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-pixel text-[8px] text-navy-400">STEP {String(i + 1).padStart(2, "0")}</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-quest-300 to-transparent" />
                      <span className="font-pixel text-[8px] text-quest-600">DONE</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
