"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { PixelLabel } from "./Hud";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Modules",
    links: [
      { label: "Core Accounting", href: "#worlds" },
      { label: "Sales & Invoicing", href: "#worlds" },
      { label: "Expenses & Payables", href: "#worlds" },
      { label: "Banking", href: "#worlds" },
      { label: "Payroll", href: "#worlds" },
      { label: "Inventory", href: "#worlds" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Practice Hub", href: "/accountants" },
      { label: "For Accountants", href: "/accountants" },
      { label: "For Business Owners", href: "#worlds" },
      { label: "Pricing", href: "#pricing" },
      { label: "Start Free Trial", href: "/signup" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/learn-support" },
      { label: "Getting Started Guide", href: "/learn-support" },
      { label: "Video Tutorials", href: "/learn-support" },
      { label: "Contact Us", href: "/learn-support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#top" },
      { label: "Terms of Service", href: "#top" },
      { label: "Security", href: "#achievements" },
      { label: "Compliance", href: "#achievements" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const resolve = (href: string) => (href.startsWith("#") && !isHome ? `/${href}` : href);

  const replayIntro = () => {
    try {
      sessionStorage.removeItem("hb-intro-seen");
    } catch {
      /* storage unavailable — reload anyway */
    }
    window.location.href = "/";
  };

  return (
    <footer className="relative z-10 bg-navy-950 text-navy-100 mt-auto">
      <div className="border-t-4 border-quest-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 grid place-items-center p-1.5">
                <Image src="/hb-logo.png" alt="HaypBooks logo" width={44} height={44} className="w-full h-full object-contain" />
              </span>
              <div>
                <div className="font-display font-extrabold text-lg tracking-widest text-white">
                  HAYP<span className="text-quest-400">BOOKS</span>
                </div>
                <PixelLabel className="text-navy-300/80 text-[7px]">MODERN ACCOUNTING REIMAGINED</PixelLabel>
              </div>
            </div>
            <p className="mt-5 font-head text-sm text-navy-200/70 leading-relaxed max-w-xs">
              The accounting & practice management suite that keeps your books clean,
              your team in sync and your month-end stress-free.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-quest-400 hb-blink" />
              <span className="font-pixel text-[8px] text-quest-300">ALL SYSTEMS ONLINE</span>
            </div>
          </div>

          {COLS.map((c) => (
            <nav key={c.title} aria-label={`${c.title} links`}>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-quest-400">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={resolve(l.href)}
                      className="font-head text-sm text-navy-200/75 hover:text-quest-300 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-head text-xs text-navy-300/70">
            © 2026 HaypBooks · haypbooks.com · All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={replayIntro}
              className="inline-flex items-center gap-1.5 font-head text-xs font-semibold text-navy-200/70 hover:text-quest-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay intro
            </button>
            <p className="font-pixel text-[8px] text-navy-300/60">
              MADE FOR MODERN ACCOUNTANTS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
