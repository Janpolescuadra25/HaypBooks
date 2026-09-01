"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  BookOpenCheck,
  ReceiptText,
  Wallet,
  Landmark,
  BadgeDollarSign,
  Package,
  Timer,
  Building2,
  Check,
  MoveHorizontal,
} from "lucide-react";
import { SectionHeading, PixelLabel } from "./Hud";

type World = {
  icon: React.ElementType;
  tag: string;
  title: string;
  tagline: string;
  features: string[];
  glow: string;
};

const WORLDS: World[] = [
  {
    icon: BookOpenCheck,
    tag: "Accounting",
    title: "Core Accounting",
    tagline: "Full double-entry bookkeeping at the heart of the platform.",
    features: ["Chart of Accounts", "Journal Entries", "General Ledger", "Trial Balance", "Period Close Workflow"],
    glow: "shadow-[0_0_50px_rgba(16,185,129,0.22)]",
  },
  {
    icon: ReceiptText,
    tag: "Revenue",
    title: "Sales & Invoicing",
    tagline: "Quote-to-cash at the speed of your business.",
    features: ["Invoices & Credit Notes", "Quotes & Estimates", "Customer Payments", "Recurring Billing", "Sales Reports"],
    glow: "shadow-[0_0_50px_rgba(27,66,116,0.2)]",
  },
  {
    icon: Wallet,
    tag: "Spend",
    title: "Expenses & Payables",
    tagline: "Every bill captured, every payment under control.",
    features: ["Bills & Vendors", "Receipt Capture", "Mileage Tracking", "Bill Payments", "Approval Flows"],
    glow: "shadow-[0_0_50px_rgba(27,66,116,0.2)]",
  },
  {
    icon: Landmark,
    tag: "Cash",
    title: "Banking",
    tagline: "Live bank feeds with smart auto-reconciliation.",
    features: ["Bank Feeds", "Reconciliation", "Deposits & Transfers", "Categorization Rules", "Undeposited Funds"],
    glow: "shadow-[0_0_40px_rgba(43,92,150,0.18)]",
  },
  {
    icon: BadgeDollarSign,
    tag: "People",
    title: "Payroll",
    tagline: "Pay your team accurately — on time, every time.",
    features: ["Payroll Runs", "Employee Expenses", "Reimbursements", "Pay Schedules"],
    glow: "shadow-[0_0_40px_rgba(43,92,150,0.18)]",
  },
  {
    icon: Package,
    tag: "Stock",
    title: "Inventory",
    tagline: "Stock levels, valuations and costs — always up to date.",
    features: ["Items & Stock", "Valuations", "Cost Tracking", "Stock Alerts"],
    glow: "shadow-[0_0_40px_rgba(43,92,150,0.18)]",
  },
  {
    icon: Timer,
    tag: "Time",
    title: "Projects & Time",
    tagline: "Track every billable hour and invoice it in one click.",
    features: ["Time Tracking", "Unbilled Charges", "Project Billing", "Tasks & Attachments"],
    glow: "shadow-[0_0_40px_rgba(5,150,105,0.18)]",
  },
  {
    icon: Building2,
    tag: "Firms",
    title: "Practice Hub",
    tagline: "Run your entire accounting firm from one dashboard.",
    features: ["Client Management", "Multi-Company Views", "Roles & Permissions", "Client Invites", "Audit Trail"],
    glow: "shadow-[0_0_50px_rgba(16,185,129,0.22)]",
  },
];

function WorldCard({ w, index }: { w: World; index: number }) {
  return (
    <div
      className={`group relative bg-white/92 backdrop-blur border border-navy-900/10 rounded-3xl p-6 sm:p-7 w-[300px] sm:w-[340px] shrink-0 hover:-translate-y-2 hover:border-quest-400/60 transition-all duration-300 ${w.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-block font-display text-[10px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-md bg-quest-50 text-quest-700 border border-quest-200">
          {w.tag}
        </span>
        <span className="font-pixel text-[8px] text-navy-400">{String(index + 1).padStart(2, "0")}/08</span>
      </div>

      <span className="mt-6 inline-grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-quest-500 to-navy-700 text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        <w.icon className="w-7 h-7" />
      </span>

      <h3 className="mt-5 font-display font-extrabold text-xl text-navy-800 uppercase tracking-wide">
        {w.title}
      </h3>
      <p className="mt-2 font-head text-sm text-navy-600/85 leading-relaxed min-h-[3.4rem]">{w.tagline}</p>

      <ul className="mt-4 space-y-2">
        {w.features.map((s) => (
          <li key={s} className="flex items-center gap-2 font-head text-[13px] text-navy-700">
            <span className="grid place-items-center w-4 h-4 rounded bg-quest-100 text-quest-700 shrink-0">
              <Check className="w-3 h-3" />
            </span>
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-navy-900/8 pt-4">
        <PixelLabel className="text-quest-600">FULLY INCLUDED</PixelLabel>
        <span className="font-head text-xs font-semibold text-navy-500 group-hover:text-quest-600 transition-colors">
          EXPLORE →
        </span>
      </div>
    </div>
  );
}

export default function Classes() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // measure how far the track must travel
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const track = trackRef.current.scrollWidth;
      const viewport = window.innerWidth;
      setShift(Math.max(0, track - viewport + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = useTransform(scrollYProgress, [0.06, 0.94], [0, -shift]);
  const barScale = useTransform(scrollYProgress, [0.06, 0.94], [0.04, 1]);

  return (
    <section id="worlds" ref={sectionRef} className="relative z-10">
      {/* ---- Desktop: pinned horizontal scroll ---- */}
      <div className="hidden lg:block" style={{ height: "340vh" }}>
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full px-8 mb-8">
            <SectionHeading
              kicker="PLATFORM MODULES"
              title={
                <>
                  Eight modules,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-600 to-navy-600">one suite</span>
                </>
              }
              sub="Every HaypBooks module is fully wired into the same ledger. Turn on what you need today — everything else is ready when you are."
            />
          </div>

          <motion.div ref={trackRef} style={{ x }} className="flex gap-6 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-16 items-stretch">
            {WORLDS.map((w, i) => (
              <WorldCard key={w.title} w={w} index={i} />
            ))}
            {/* end card */}
            <div className="shrink-0 w-[340px] grid place-items-center">
              <div className="text-center">
                <PixelLabel className="text-quest-600">AND MORE</PixelLabel>
                <p className="mt-3 font-head text-navy-600">Tax & Compliance · Reports · Automation · API</p>
                <a href="#pricing" className="mt-5 inline-flex bg-navy-800 text-white font-display font-bold uppercase text-xs tracking-widest px-6 py-3 rounded-xl hover:bg-navy-700 transition-colors">
                  See All Plans
                </a>
              </div>
            </div>
          </motion.div>

          {/* progress + hint */}
          <div className="max-w-7xl mx-auto w-full px-8 mt-10 flex items-center gap-5">
            <div className="flex-1 h-1.5 rounded-full bg-navy-900/10 overflow-hidden">
              <motion.div className="h-full w-full origin-left bg-gradient-to-r from-quest-500 to-navy-500" style={{ scaleX: barScale }} />
            </div>
            <span className="flex items-center gap-2 text-navy-500">
              <MoveHorizontal className="w-4 h-4" />
              <PixelLabel className="text-[8px]">KEEP SCROLLING</PixelLabel>
            </span>
          </div>
        </div>
      </div>

      {/* ---- Mobile / tablet: stacked grid ---- */}
      <div className="lg:hidden py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-10">
          <SectionHeading
            kicker="PLATFORM MODULES"
            title={
              <>
                Eight modules,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-600 to-navy-600">one suite</span>
              </>
            }
            sub="Every HaypBooks module is fully wired into the same ledger."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto px-4 sm:px-6 justify-items-center">
          {WORLDS.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
            >
              <WorldCard w={w} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
