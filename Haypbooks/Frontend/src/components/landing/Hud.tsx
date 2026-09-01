"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

/* ---------------- HUD corner brackets ---------------- */
export function HudCorners({
  className = "border-quest-500/50",
  size = 14,
  width = 2,
}: {
  className?: string;
  size?: number;
  width?: number;
}) {
  const base = "absolute pointer-events-none";
  const style = { width: size, height: size };
  return (
    <>
      <span aria-hidden className={`${base} top-0 left-0 ${className}`} style={{ ...style, borderTopWidth: width, borderLeftWidth: width }} />
      <span aria-hidden className={`${base} top-0 right-0 ${className}`} style={{ ...style, borderTopWidth: width, borderRightWidth: width }} />
      <span aria-hidden className={`${base} bottom-0 left-0 ${className}`} style={{ ...style, borderBottomWidth: width, borderLeftWidth: width }} />
      <span aria-hidden className={`${base} bottom-0 right-0 ${className}`} style={{ ...style, borderBottomWidth: width, borderRightWidth: width }} />
    </>
  );
}

/* Wrapper that draws corner brackets around children */
export function HudFrame({
  children,
  className = "",
  corners = "border-quest-500/60",
}: {
  children: ReactNode;
  className?: string;
  corners?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <HudCorners className={corners} />
      {children}
    </div>
  );
}

/* ---------------- Pixel label (tiny press-start text) ---------------- */
export function PixelLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-pixel text-[10px] leading-relaxed tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------- XP bar ---------------- */
export function XPBar({
  value,
  max = 100,
  className = "",
  barClassName = "bg-gradient-to-r from-quest-500 to-quest-400",
  height = "h-2",
  animated = true,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  height?: string;
  animated?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`w-full ${height} rounded-full bg-navy-900/10 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={animated ? { width: 0 } : false}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/* ---------------- Level / rarity badge ---------------- */
const RARITY: Record<string, string> = {
  legendary: "bg-quest-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)]",
  epic: "bg-navy-700 text-quest-200 shadow-[0_0_16px_rgba(18,48,88,0.45)]",
  rare: "bg-navy-500 text-white",
  uncommon: "bg-quest-600 text-white",
};

export function RarityBadge({ rarity }: { rarity: keyof typeof RARITY | string }) {
  const cls = RARITY[rarity.toLowerCase()] ?? RARITY.uncommon;
  return (
    <span className={`inline-block font-display text-[10px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-md ${cls}`}>
      {rarity}
    </span>
  );
}

/* ---------------- Section heading kit ---------------- */
export function SectionHeading({
  kicker,
  title,
  sub,
  align = "center",
  dark = false,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-4 ${alignCls}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <HudFrame className={`inline-flex items-center gap-2 px-4 py-2 ${dark ? "bg-white/5" : "bg-white/70"} border ${dark ? "border-white/15" : "border-navy-900/10"} rounded-lg`}>
          <span className="w-1.5 h-1.5 rounded-full bg-quest-500 hb-blink" />
          <PixelLabel className={dark ? "text-quest-300" : "text-navy-700"}>
            {kicker}
          </PixelLabel>
        </HudFrame>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`font-display font-extrabold uppercase leading-[1.08] text-3xl sm:text-4xl lg:text-5xl ${
          dark ? "text-white" : "text-navy-800"
        }`}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`max-w-2xl text-base sm:text-lg leading-relaxed ${
            dark ? "text-navy-100/80" : "text-navy-700/80"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

/* ---------------- Count-up hook ---------------- */
export function useCountUp(target: number, duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return { ref, val };
}

/* ---------------- Damage / XP floater ---------------- */
export function Floater({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      whileInView={{ opacity: 1, y: -6, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: "spring", bounce: 0.5 }}
      className={`font-display font-bold ${className}`}
    >
      {children}
    </motion.div>
  );
}
