"use client";

import { motion } from "motion/react";
import { Boxes, Network, Database, ShieldCheck } from "lucide-react";
import { useCountUp, HudFrame, PixelLabel } from "./Hud";

function Stat({
  icon: Icon,
  target,
  suffix,
  label,
  desc,
  delay,
}: {
  icon: React.ElementType;
  target: number;
  suffix: string;
  label: string;
  desc: string;
  delay: number;
}) {
  const { ref, val } = useCountUp(target, 1500 + delay * 200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <HudFrame className="rounded-2xl">
        <div className="bg-white/85 backdrop-blur border border-navy-900/10 rounded-2xl px-6 py-7 h-full text-center hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(8,22,49,0.12)] transition-all duration-300">
          <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-quest-500 to-navy-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] mb-4">
            <Icon className="w-5 h-5" />
          </span>
          <div className="font-display font-black text-3xl sm:text-4xl text-navy-800">
            <span ref={ref}>{val.toLocaleString()}</span>
            <span className="text-quest-600">{suffix}</span>
          </div>
          <div className="mt-2 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-navy-700">
            {label}
          </div>
          <p className="mt-2 font-head text-xs sm:text-sm text-navy-600/80 leading-relaxed">{desc}</p>
        </div>
      </HudFrame>
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section id="stats" className="relative z-10 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <PixelLabel className="text-navy-500">— THE PLATFORM · REAL NUMBERS FROM THE ENGINE —</PixelLabel>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Stat
            icon={Boxes}
            target={30}
            suffix="+"
            label="Core Modules"
            desc="Everything in one place — accounting, sales, banking, payroll, inventory and beyond."
            delay={0}
          />
          <Stat
            icon={Network}
            target={80}
            suffix="%"
            label="Less Manual Work"
            desc="Smart matching and auto-categorization handle the repetitive bookkeeping for you."
            delay={1}
          />
          <Stat
            icon={Database}
            target={24}
            suffix="/7"
            label="Real-time Books"
            desc="Your ledgers update the moment money moves — no waiting for month-end."
            delay={2}
          />
          <Stat
            icon={ShieldCheck}
            target={100}
            suffix="%"
            label="Bank-Grade Security"
            desc="Encryption at rest and in transit, strict access controls and a full audit trail on every move."
            delay={3}
          />
        </div>
      </div>
    </section>
  );
}
