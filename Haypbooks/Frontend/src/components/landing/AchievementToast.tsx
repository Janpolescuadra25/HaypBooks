"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

/**
 * WelcomeToast — pops once shortly after load.
 * Purely celebratory. Auto-dismisses after 4.5s.
 */
export default function AchievementToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(false), 4500);
    return () => window.clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 90, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed bottom-5 right-5 z-[70] max-w-[calc(100vw-2.5rem)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3.5 bg-navy-800 border border-quest-400/60 rounded-2xl px-5 py-4 shadow-[0_20px_50px_rgba(8,22,49,0.45)]">
            <span className="relative grid place-items-center w-11 h-11 rounded-xl bg-quest-500/20 shrink-0">
              <Sparkles className="w-5.5 h-5.5 text-quest-400" />
              <span className="absolute inset-0 rounded-xl border border-quest-400/50 animate-ping opacity-30" />
            </span>
            <div>
              <div className="font-pixel text-[8px] text-quest-400">WELCOME TO HAYPBOOKS</div>
              <div className="mt-1 font-display text-sm font-bold text-white">Glad to have you here</div>
              <div className="font-head text-xs text-navy-200/80">Scroll to explore the platform</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
