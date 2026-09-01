"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { armAuthTransition } from "../../lib/authEntrance";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Hourglass,
  Route,
  ShieldCheck,
  Users,
  Building2,
  Tag,
  LifeBuoy,
} from "lucide-react";

/**
 * Decluttered navbar:
 *  - 5 anchor links merged into a single "Product" dropdown
 *  - "Accountants & Bookkeepers" lives in a "Solutions" dropdown
 *  - Plain links: Pricing · Learn & Support
 *  - Right side: Sign In (→ /login) + Start Free (→ /signup)
 */

const PRODUCT_ITEMS = [
  {
    label: "Modules",
    desc: "Eight modules, one suite",
    href: "#worlds",
    icon: LayoutGrid,
  },
  {
    label: "Month-End",
    desc: "Close books without the chaos",
    href: "#boss",
    icon: Hourglass,
  },
  {
    label: "How It Works",
    desc: "From receipts to reports",
    href: "#quests",
    icon: Route,
  },
  {
    label: "Platform & Security",
    desc: "Audit trail, roles, uptime",
    href: "#achievements",
    icon: ShieldCheck,
  },
];

const SOLUTION_ITEMS = [
  {
    label: "Accountants & Bookkeepers",
    desc: "Practice Hub for client work",
    href: "/accountants",
    icon: Users,
  },
  {
    label: "Business Owners",
    desc: "Run your books in one place",
    href: "#worlds",
    icon: Building2,
  },
  {
    label: "Pricing",
    desc: "Free to start, scale later",
    href: "#pricing",
    icon: Tag,
  },
];

function Dropdown({
  label,
  items,
  open,
  onOpen,
  onClose,
}: {
  label: string;
  items: typeof PRODUCT_ITEMS;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const isHome = usePathname() === "/";
  const resolve = (href: string) => (href.startsWith("#") && !isHome ? `/${href}` : href);

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-head font-medium text-sm transition-colors ${
          open ? "text-navy-900 bg-quest-50" : "text-navy-700 hover:text-navy-900 hover:bg-quest-50"
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
          >
            <div className="w-72 rounded-2xl bg-white border border-navy-900/10 shadow-[0_20px_50px_rgba(8,22,49,0.14)] p-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={resolve(item.href)}
                    onClick={onClose}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-quest-50 transition-colors"
                  >
                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-navy-50 border border-navy-900/5 grid place-items-center group-hover:bg-white group-hover:border-quest-200 transition-colors">
                      <Icon className="w-[18px] h-[18px] text-quest-600" />
                    </span>
                    <span>
                      <span className="block font-head font-semibold text-sm text-navy-800 group-hover:text-navy-900">
                        {item.label}
                      </span>
                      <span className="block font-head text-xs text-navy-500 mt-0.5">
                        {item.desc}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // hash links must bounce back to the home page from sub-pages
  const resolve = (href: string) => (href.startsWith("#") && !isHome ? `/${href}` : href);

  const hoverOpen = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll, { passive: true } as never);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-navy-900/10 shadow-[0_8px_30px_rgba(8,22,49,0.06)]"
            : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a href={resolve("#top")} className="flex items-center gap-3 group">
            <span className="relative w-10 h-10 rounded-xl bg-white border border-navy-900/10 shadow-sm grid place-items-center overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/hb-logo.png"
                alt="HaypBooks logo"
                width={40}
                height={40}
                className="w-8 h-8 object-contain"
                priority
              />
            </span>
            <span className="font-display font-extrabold text-lg tracking-widest text-navy-800">
              HAYP<span className="text-quest-600">BOOKS</span>
            </span>
          </a>

          {/* Desktop links — 4 tidy items */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Dropdown
              label="Product"
              items={PRODUCT_ITEMS}
              open={openMenu === "product"}
              onOpen={() => hoverOpen("product")}
              onClose={hoverClose}
            />
            <Dropdown
              label="Solutions"
              items={SOLUTION_ITEMS}
              open={openMenu === "solutions"}
              onOpen={() => hoverOpen("solutions")}
              onClose={hoverClose}
            />
            <a
              href={resolve("#pricing")}
              className="px-4 py-2 rounded-lg font-head font-medium text-sm text-navy-700 hover:text-navy-900 hover:bg-quest-50 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/learn-support"
              className={`px-4 py-2 rounded-lg font-head font-medium text-sm transition-colors ${
                pathname === "/learn-support"
                  ? "text-quest-700 bg-quest-50"
                  : "text-navy-700 hover:text-navy-900 hover:bg-quest-50"
              }`}
            >
              Learn &amp; Support
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              onClick={armAuthTransition}
              className={`font-head text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                pathname === "/login"
                  ? "text-quest-700 bg-quest-50"
                  : "text-navy-700 hover:text-quest-700 hover:bg-quest-50"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={armAuthTransition}
              className="inline-flex items-center gap-2 bg-quest-500 hover:bg-quest-600 text-white font-head font-semibold text-sm px-5 py-2.5 rounded-xl shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_28px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-navy-800 hover:bg-quest-50 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-navy-900/10"
            >
              <div className="px-4 py-4 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <p className="px-4 pt-2 pb-1 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-navy-400">
                  Product
                </p>
                {PRODUCT_ITEMS.map((l) => {
                  const Icon = l.icon;
                  return (
                    <a
                      key={l.label}
                      href={resolve(l.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-head font-medium text-navy-700 hover:bg-quest-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-quest-600" />
                      {l.label}
                    </a>
                  );
                })}

                <p className="px-4 pt-3 pb-1 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-navy-400">
                  Solutions
                </p>
                {SOLUTION_ITEMS.map((l) => {
                  const Icon = l.icon;
                  return (
                    <a
                      key={l.label}
                      href={resolve(l.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-head font-medium text-navy-700 hover:bg-quest-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-quest-600" />
                      {l.label}
                    </a>
                  );
                })}

                <p className="px-4 pt-3 pb-1 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-navy-400">
                  Resources
                </p>
                <a
                  href="/learn-support"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-head font-medium text-navy-700 hover:bg-quest-50 transition-colors"
                >
                  <LifeBuoy className="w-4 h-4 text-quest-600" />
                  Learn &amp; Support
                </a>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-navy-900/10">
                  <Link
                    href="/login"
                    onClick={() => {
                      setOpen(false);
                      armAuthTransition();
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-navy-900/15 bg-white text-navy-800 font-head font-semibold text-sm px-4 py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => {
                      setOpen(false);
                      armAuthTransition();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-quest-500 text-white font-head font-semibold text-sm px-4 py-3 rounded-xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
