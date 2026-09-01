"use client";

import { motion } from "motion/react";
import { PixelLabel, HudFrame } from "./Hud";
import Link from "next/link";
import { armAuthTransition } from "../../lib/authEntrance";
import { Coins } from "lucide-react";

export default function FinalCTA() {
  return (
    <section id="start" className="relative z-10 py-24 sm:py-36 overflow-hidden">
      {/* dark navy finale panel */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <HudFrame corners="border-quest-400" className="rounded-[2rem]">
            <div className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 rounded-[2rem] px-6 sm:px-14 py-16 sm:py-24 text-center overflow-hidden">
              {/* décor */}
              <div className="hb-dots absolute inset-0 opacity-20 pointer-events-none" />
              <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-quest-500/15 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-navy-500/25 blur-[100px] pointer-events-none" />

              {/* floating coins */}
              <motion.span
                className="absolute top-10 left-[12%] text-quest-400/60 hidden sm:block"
                animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coins className="w-8 h-8" />
              </motion.span>
              <motion.span
                className="absolute bottom-12 right-[14%] text-quest-400/40 hidden sm:block"
                animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Coins className="w-6 h-6" />
              </motion.span>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <PixelLabel className="text-quest-400">START TODAY · FREE 14-DAY TRIAL</PixelLabel>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative mt-6 font-display font-black uppercase text-white text-4xl sm:text-6xl leading-tight"
              >
                Your books,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest-400 to-quest-200 hb-glow">
                  effortless.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="relative mt-5 font-head text-navy-100/85 max-w-xl mx-auto text-base sm:text-lg"
              >
                Start with full access to every module, free for 14 days —
                no credit card required.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-5"
              >
                <Link
                  href="/signup"
                  onClick={armAuthTransition}
                  className="hb-pulse-glow inline-flex items-center gap-3 bg-quest-500 hover:bg-quest-400 text-white font-display font-bold uppercase tracking-widest text-sm px-9 py-5 rounded-xl transition-all"
                >
                  Start Your Free Trial
                  <Coins className="w-4 h-4" />
                </Link>
                <span className="flex items-center gap-2 text-navy-200/70 font-head text-sm">
                  <span className="px-2 py-1 rounded-md border border-white/20 font-display text-[10px] font-bold">14 DAYS</span>
                  <span>full access. Nothing to lose.</span>
                </span>
              </motion.div>

              {/* save-point stats */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="relative mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-head text-xs sm:text-sm text-navy-100/70"
              >
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-quest-400 rounded-full hb-blink" /> Setup in minutes</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-quest-400 rounded-full hb-blink" /> Cancel anytime</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-quest-400 rounded-full hb-blink" /> Bank-grade security</span>
              </motion.div>
            </div>
          </HudFrame>
        </motion.div>
      </div>
    </section>
  );
}
