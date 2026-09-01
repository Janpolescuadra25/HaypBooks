"use client";

import { motion } from "motion/react";
import { ShieldCheck, ScrollText, Globe2, Coins, Users, Plug2 } from "lucide-react";
import { SectionHeading, PixelLabel } from "./Hud";

const STRENGTHS = [
  {
    icon: ShieldCheck,
    name: "Bank-Grade Security",
    desc: "Bank-grade encryption at rest and in transit, with strict access controls guarding every workspace.",
    tag: "SECURITY",
  },
  {
    icon: ScrollText,
    name: "Complete Audit Trail",
    desc: "A full audit trail logs every ledger action — who did what, when, down to the cent.",
    tag: "COMPLIANCE",
  },
  {
    icon: Globe2,
    name: "Multi-Company",
    desc: "Run unlimited companies and workspaces under one account. Switch between them instantly.",
    tag: "SCALE",
  },
  {
    icon: Coins,
    name: "Multi-Currency",
    desc: "Multi-currency books with automatic exchange rates that keep FX gains honest.",
    tag: "GLOBAL",
  },
  {
    icon: Users,
    name: "Roles & Permissions",
    desc: "Granular roles and permissions — every team member sees exactly what they should. Nothing more.",
    tag: "TEAMS",
  },
  {
    icon: Plug2,
    name: "Easy Integrations",
    desc: "Connect banks, e-invoicing and the tools you already use — HaypBooks fits right into your workflow.",
    tag: "CONNECT",
  },
];

export default function Achievements() {
  return (
    <section id="achievements" className="relative z-10 py-24 sm:py-32">
      {/* subtle backdrop band */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-50/70 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="PLATFORM STRENGTHS"
          title={
            <>
              Security &amp; scale,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-600 to-navy-600">built in</span>
            </>
          }
          sub="The critical features accountants ask for first — engineered in from day one, not bolted on later."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STRENGTHS.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 36, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="hb-shine group relative bg-white/92 backdrop-blur border border-navy-900/10 rounded-3xl p-6 overflow-hidden hover:border-quest-400/60 hover:shadow-[0_20px_50px_rgba(8,22,49,0.13)] transition-colors duration-300"
            >
              {/* trophy chip */}
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-13 h-13 rounded-2xl bg-gradient-to-br from-quest-500 to-navy-700 text-white shadow-[0_10px_24px_rgba(16,185,129,0.32)] group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 p-3">
                  <a.icon className="w-7 h-7" />
                </span>
                <span className="inline-flex items-center gap-1.5 bg-navy-800 text-quest-300 font-pixel text-[8px] px-2.5 py-1.5 rounded-md">
                  <span className="w-1.5 h-1.5 bg-quest-400 rounded-full hb-blink" />
                  INCLUDED
                </span>
              </div>

              <div className="mt-5">
                <PixelLabel className="text-navy-400">{a.tag}</PixelLabel>
                <h3 className="mt-1.5 font-display font-extrabold text-xl text-navy-800">
                  {a.name}
                </h3>
                <p className="mt-2 font-head text-sm leading-relaxed text-navy-600/90">{a.desc}</p>
              </div>

              {/* progress ghost */}
              <div className="mt-5 h-1.5 rounded-full bg-navy-900/8 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-quest-500 to-quest-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.3 + (i % 3) * 0.12 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
