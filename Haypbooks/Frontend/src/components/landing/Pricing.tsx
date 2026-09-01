"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { armAuthTransition } from "../../lib/authEntrance";
import { Check, Crown, Flame, Gem } from "lucide-react";
import { SectionHeading, PixelLabel, HudFrame } from "./Hud";

/* Real plan data from the HaypBooks codebase (Frontend/src/lib/pricing.ts) */
const PLANS = [
  {
    icon: Flame,
    edition: "SOLO",
    name: "Starter",
    price: "Free",
    period: "",
    blurb: "For solo entrepreneurs just getting started.",
    cta: "Start Free",
    highlight: false,
    badge: "FREE FOREVER",
    features: [
      "1 company",
      "Up to 50 transactions / month",
      "Invoicing & billing",
      "Basic financial reports",
      "Bank account tracking",
      "Email support",
    ],
  },
  {
    icon: Crown,
    edition: "SMALL BUSINESS",
    name: "Business",
    price: "$29",
    period: "/mo",
    blurb: "For growing businesses that need full bookkeeping.",
    cta: "Start 14-Day Trial",
    highlight: true,
    badge: "14-DAY TRIAL",
    features: [
      "Unlimited companies",
      "Unlimited transactions",
      "Full double-entry accounting",
      "AR & AP management",
      "Bank reconciliation",
      "Payroll basics",
      "Inventory tracking",
      "Custom reports & dashboards",
      "Multi-user access (up to 5)",
      "Priority email & chat support",
    ],
  },
  {
    icon: Gem,
    edition: "FIRMS & ACCOUNTANTS",
    name: "Professional",
    price: "$79",
    period: "/mo",
    blurb: "For accountants and firms managing multiple clients.",
    cta: "Contact Sales",
    highlight: false,
    badge: "FULL SUITE",
    features: [
      "Everything in Business",
      "Practice Hub for accountants",
      "Unlimited users & roles",
      "Client management & onboarding",
      "Advanced permissions & audit trail",
      "Bank feeds & app integrations",
      "Tax-ready reporting templates",
      "Dedicated account manager",
      "Phone & video support",
      "Custom training sessions",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative z-10 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="PRICING · SIMPLE & TRANSPARENT"
          title={
            <>
              Plans that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-600 to-navy-600">scale with you</span>
            </>
          }
          sub="Start free. Upgrade when you need more. All plans include automatic updates and tax compliance tools."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-7 lg:items-stretch">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              className={p.highlight ? "lg:-mt-5 lg:mb-[-1.25rem]" : ""}
            >
              <HudFrame
                className={`h-full rounded-3xl ${p.highlight ? "corners-strong" : ""}`}
                corners={p.highlight ? "border-quest-500" : "border-navy-300/60"}
              >
                <div
                  className={`relative h-full rounded-3xl p-7 sm:p-8 border transition-all duration-300 hover:-translate-y-2 ${
                    p.highlight
                      ? "bg-gradient-to-b from-navy-800 to-navy-900 border-quest-400 shadow-[0_24px_70px_rgba(8,22,49,0.4)] text-white"
                      : "bg-white/92 border-navy-900/10 hover:border-quest-400/60 hover:shadow-[0_20px_50px_rgba(8,22,49,0.12)] text-navy-800"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-quest-500 text-white font-pixel text-[9px] px-4 py-2 rounded-md shadow-[0_8px_20px_rgba(16,185,129,0.45)] whitespace-nowrap">
                      ★ MOST POPULAR
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <PixelLabel className={p.highlight ? "text-quest-300" : "text-navy-400"}>{p.edition}</PixelLabel>
                    <span
                      className={`font-display text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded ${
                        p.highlight ? "bg-quest-500/20 text-quest-300" : "bg-navy-50 text-navy-600"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className={`grid place-items-center w-12 h-12 rounded-xl ${
                        p.highlight
                          ? "bg-quest-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.4)]"
                          : "bg-navy-800 text-quest-300"
                      }`}
                    >
                      <p.icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide">{p.name}</h3>
                      <p className={`font-head text-xs ${p.highlight ? "text-navy-100/75" : "text-navy-500"}`}>{p.blurb}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end gap-1">
                    <span className="font-display font-black text-5xl leading-none">{p.price}</span>
                    {p.period && (
                      <span className={`font-head font-semibold text-lg pb-0.5 ${p.highlight ? "text-quest-300" : "text-navy-500"}`}>
                        {p.period}
                      </span>
                    )}
                  </div>

                  <ul className={`mt-7 space-y-3 border-t pt-6 ${p.highlight ? "border-white/10" : "border-navy-900/8"}`}>
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 font-head text-sm">
                        <span
                          className={`mt-0.5 grid place-items-center w-4.5 h-4.5 rounded shrink-0 ${
                            p.highlight ? "bg-quest-500/25 text-quest-300" : "bg-quest-100 text-quest-700"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                        <span className={p.highlight ? "text-navy-50/90" : "text-navy-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    onClick={armAuthTransition}
                    className={`mt-8 block text-center font-display font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-xl transition-all ${
                      p.highlight
                        ? "bg-quest-500 text-white hover:bg-quest-400 shadow-[0_12px_30px_rgba(16,185,129,0.45)]"
                        : "bg-navy-800 text-white hover:bg-navy-700"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </HudFrame>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 text-center font-head text-sm text-navy-600/80"
        >
          No credit card required to start · Switch plans anytime · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
