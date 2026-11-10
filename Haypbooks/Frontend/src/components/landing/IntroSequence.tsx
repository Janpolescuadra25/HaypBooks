"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, Play } from "lucide-react";

/**
 * IntroSequence — a 3-slide cinematic advertisement intro for HaypBooks.
 *
 *   Slide 1 · navy "meet the product" ad with kinetic type + growing chart
 *   Slide 2 · white "whole business" ad with popping feature chips
 *   Slide 3 · the HAYPBOOKS wordmark finale, letter-by-letter with shine sweep
 *
 * Slides are joined by a diagonal light-streak wipe + flash. Shown once per
 * session (sessionStorage), skippable, reduced-motion aware, and replayable
 * from the footer.
 */

const SEEN_KEY = "hb-intro-seen";
const EASE = [0.22, 1, 0.36, 1] as const;

// sessionStorage is an external store — subscribe is a no-op because the flag
// never changes during a page's lifetime (replay reloads the page instead).
const subscribeNoop = () => () => {};
const wasIntroSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage unavailable → default to seen (no intro)
  }
};

export default function IntroSequence() {
  // server + first hydration render say "seen" so nothing flashes; after
  // hydration the real client value takes over and the intro may appear.
  const seen = useSyncExternalStore(subscribeNoop, wasIntroSeen, () => true);
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useReducedMotion();

  // clearStageTimer only ever touches the advance timer; finish's own timers live
  // in a separate ref so a leaving-state re-render can't cancel the exit.
  const clearStageTimer = useCallback(() => {
    if (stageTimer.current) {
      clearTimeout(stageTimer.current);
      stageTimer.current = null;
    }
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    finishTimers.current.push(setTimeout(fn, ms));
  }, []);

  // full teardown on unmount
  useEffect(
    () => () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
      finishTimers.current.forEach(clearTimeout);
      document.documentElement.style.overflow = "";
    },
    []
  );

  const finish = useCallback(() => {
    setLeaving(true);
    later(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* private mode — intro will simply replay next load */
      }
      setGone(true);
      document.documentElement.style.overflow = "";
    }, reduced ? 450 : 1050);
  }, [later, reduced]);

  // lock page scroll while the intro is playing
  useEffect(() => {
    if (seen || gone) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [seen, gone]);

  // slide auto-advance choreography
  useEffect(() => {
    if (seen || leaving || gone) return;
    const d = reduced ? 1500 : stage === 0 ? 3700 : stage === 1 ? 4100 : 4700;
    stageTimer.current = setTimeout(() => {
      stageTimer.current = null;
      if (stage < 2) setStage(stage + 1);
      else finish();
    }, d);
    return clearStageTimer;
  }, [stage, seen, leaving, gone, reduced, finish, clearStageTimer]);

  if (seen) return null;

  return (
    <AnimatePresence>
      {(!gone || leaving) && (
        <motion.div
          key="intro-root"
          className="fixed inset-0 z-[100] bg-white isolate overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="HaypBooks introduction"
          role="dialog"
        >
          {/* ===== slide stage ===== */}
          <AnimatePresence mode="sync">
            {stage === 0 && !leaving && <SlideOne key="s1" reduced={!!reduced} />}
            {stage === 1 && !leaving && <SlideTwo key="s2" reduced={!!reduced} />}
            {stage === 2 && !leaving && <SlideThree key="s3" reduced={!!reduced} />}
          </AnimatePresence>

          {/* ===== diagonal light-streak wipe between slides ===== */}
          <AnimatePresence>
            {!leaving && (
              <motion.div
                key={`wipe-${stage}`}
                className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, transition: { duration: 0.9, delay: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.01 } }}
              >
                {/* the streak */}
                <motion.div
                  className="absolute inset-y-[-20%] left-0 w-[26%] bg-gradient-to-r from-transparent via-white to-transparent"
                  style={{ skewX: -14 }}
                  initial={{ x: "-160%", opacity: 0.9 }}
                  animate={{ x: "480%", opacity: [0.9, 1, 0.9], transition: { duration: reduced ? 0.3 : 0.85, ease: "easeInOut" } }}
                />
                <motion.div
                  className="absolute inset-y-[-20%] left-0 w-[8%] bg-gradient-to-r from-transparent via-quest-300 to-transparent"
                  style={{ skewX: -14 }}
                  initial={{ x: "-160%", opacity: 0.95 }}
                  animate={{ x: "480%", transition: { duration: reduced ? 0.3 : 0.85, ease: "easeInOut" } }}
                />
                {/* flash */}
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.75, 0], transition: { duration: reduced ? 0.25 : 0.6, times: [0, 0.35, 1] } }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== exit curtains (reveal the landing page) ===== */}
          <AnimatePresence>
            {leaving && (
              <>
                <motion.div
                  key="curtain-top"
                  className="absolute inset-x-0 top-0 h-1/2 bg-navy-950 z-40"
                  initial={{ y: "0%" }}
                  animate={{ y: "-100%", transition: { duration: 0.8, delay: 0.25, ease: EASE } }}
                />
                <motion.div
                  key="curtain-bottom"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-navy-950 z-40"
                  initial={{ y: "0%" }}
                  animate={{ y: "100%", transition: { duration: 0.8, delay: 0.25, ease: EASE } }}
                />
                {/* emerald seam that splits with the curtains */}
                <motion.div
                  key="curtain-seam"
                  className="absolute inset-x-0 top-1/2 h-[3px] z-40 bg-gradient-to-r from-transparent via-quest-400 to-transparent"
                  initial={{ opacity: 0.9, scaleX: 1 }}
                  animate={{ opacity: [0.9, 1, 0], scaleX: [1, 1.15, 0.4], transition: { duration: 0.9 } }}
                />
              </>
            )}
          </AnimatePresence>

          {/* ===== chrome: skip + dots ===== */}
          {!leaving && (
            <>
              <button
                onClick={finish}
                className="absolute top-5 right-5 z-50 inline-flex items-center gap-1 rounded-lg border border-white/25 bg-navy-950/40 backdrop-blur px-4 py-2 font-pixel text-[8px] text-white/85 hover:text-white hover:border-quest-400 hover:bg-navy-950/70 transition-colors"
              >
                SKIP INTRO
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setStage(i)}
                    aria-label={`Go to intro slide ${i + 1}`}
                    className="group relative p-1.5"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-[400ms] ${
                        stage === i
                          ? "w-9 bg-quest-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                          : "w-2 bg-white/30 group-hover:bg-white/60"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="absolute bottom-6 right-5 z-50 hidden sm:flex items-center gap-2 font-pixel text-[7px] text-white/40">
                <Play className="w-3 h-3" />
                {stage === 0 ? "1 / 3" : stage === 1 ? "2 / 3" : "3 / 3"}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =============================================================
   SLIDE 1 — "Meet HaypBooks" (navy ad, kinetic type + chart)
   ============================================================= */
function SlideOne({ reduced }: { reduced: boolean }) {
  const bars = [34, 52, 44, 66, 58, 84, 100];
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-navy-950"
      initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
      animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      exit={{ scale: 1.05, opacity: 0.5, transition: { duration: 0.55 } }}
      transition={{ duration: reduced ? 0.25 : 0.7, ease: EASE }}
    >
      {/* background: panning grid + rotating glow + floating currencies */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(110,231,183,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,.6)_1px,transparent_1px)] bg-[length:52px_52px] animate-[hb-grid-pan_2.6s_linear_infinite]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-40"
        style={{
          background: "conic-gradient(from 0deg, rgba(16,185,129,0.35), rgba(8,22,49,0) 30%, rgba(43,92,150,0.4) 55%, rgba(8,22,49,0) 75%, rgba(16,185,129,0.35))",
          animation: "hb-spin-slow 14s linear infinite",
        }}
      />
      <span aria-hidden className="absolute left-[8%] top-[22%] font-display text-4xl text-quest-400/30 hb-float">₱</span>
      <span aria-hidden className="absolute right-[10%] top-[30%] font-display text-3xl text-navy-300/40 hb-float-slow">$</span>
      <span aria-hidden className="absolute left-[16%] bottom-[24%] font-display text-3xl text-quest-300/25 hb-float-slow">€</span>
      <span aria-hidden className="absolute right-[14%] bottom-[30%] font-display text-4xl text-navy-200/30 hb-float">£</span>

      <div className="relative h-full grid lg:grid-cols-2 items-center max-w-6xl mx-auto px-8 gap-10">
        {/* kinetic headline */}
        <div className="text-center lg:text-left">
          <motion.span
            className="inline-block rounded-md border border-quest-400/50 bg-quest-400/10 px-3 py-1.5 font-pixel text-[8px] text-quest-300"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.1 : 0.35, duration: 0.5 }}
          >
            INTRODUCING · ACCOUNTING, REIMAGINED
          </motion.span>

          <h1 className="mt-6 font-display font-black text-white leading-[0.95] text-5xl sm:text-6xl xl:text-7xl">
            {["YOUR", "NUMBERS,"].map((w, i) => (
              <motion.span
                key={w}
                className="block"
                initial={{ opacity: 0, y: 46, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: reduced ? 0.15 : 0.5 + i * 0.22, duration: 0.65, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-quest-300 via-quest-400 to-quest-500"
              initial={{ opacity: 0, y: 46, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: reduced ? 0.3 : 1.0, duration: 0.7, ease: EASE }}
            >
              FINALLY IN SYNC.
            </motion.span>
          </h1>

          <motion.p
            className="mt-5 font-head text-base sm:text-lg text-navy-200/80 max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.4 : 1.5, duration: 0.6 }}
          >
            One clean, real-time dashboard for your books — from first invoice
            to filed return.
          </motion.p>
        </div>

        {/* growing bar chart card */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: 80, rotateY: 18 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: reduced ? 0.2 : 0.9, duration: 0.8, ease: EASE }}
        >
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-7 shadow-[0_40px_90px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-quest-300">REAL-TIME CASH FLOW</span>
              <span className="font-head text-xs font-bold text-quest-400">+24.8%</span>
            </div>
            <div className="mt-6 flex items-end gap-3 h-44">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-navy-500 via-quest-600 to-quest-400 origin-bottom"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: reduced ? 0.25 : 1.15 + i * 0.1, duration: 0.55, ease: EASE }}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            {/* shine sweep on the card */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{ skewX: -16 }}
              initial={{ x: "-160%" }}
              animate={{ x: "420%" }}
              transition={{ delay: 2.3, duration: 0.9, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =============================================================
   SLIDE 2 — "Run your entire business" (white ad, popping chips)
   ============================================================= */
function SlideTwo({ reduced }: { reduced: boolean }) {
  const chips = ["INVOICING", "BANK RECONCILIATION", "EXPENSES", "PAYROLL", "INVENTORY", "BIR-READY REPORTS"];
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white opacity-100"
      initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
      animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      exit={{ scale: 1.05, opacity: 0.5, transition: { duration: 0.55 } }}
      transition={{ duration: reduced ? 0.25 : 0.7, ease: EASE }}
    >
      {/* aurora blobs + dot grid */}
      <motion.div
        aria-hidden
        className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-quest-200/50 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-48 -right-32 w-[620px] h-[620px] rounded-full bg-navy-200/50 blur-3xl"
        animate={{ scale: [1, 1.12, 1], x: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(rgba(12,31,66,0.10)_1px,transparent_1px)] [background-size:26px_26px]"
      />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <motion.span
          className="inline-block rounded-md border border-navy-200 bg-navy-50 px-3 py-1.5 font-pixel text-[8px] text-navy-600"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.1 : 0.3, duration: 0.5 }}
        >
          ONE SUITE · EVERY MODULE INCLUDED
        </motion.span>

        <motion.h2
          className="mt-6 font-display font-black text-navy-900 leading-[1.02] text-4xl sm:text-6xl"
          initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: reduced ? 0.15 : 0.45, duration: 0.7, ease: EASE }}
        >
          RUN YOUR ENTIRE BUSINESS
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-navy-700 via-navy-600 to-quest-600">
            FROM ONE DASHBOARD.
          </span>
        </motion.h2>

        {/* feature chips pop in */}
        <div className="mt-9 flex flex-wrap justify-center gap-3 max-w-2xl">
          {chips.map((c, i) => (
            <motion.span
              key={c}
              className="rounded-full border border-quest-300/80 bg-quest-50 px-4 py-2 font-head text-xs sm:text-sm font-bold text-quest-800 shadow-[0_6px_18px_rgba(16,185,129,0.15)]"
              initial={{ opacity: 0, scale: 0.4, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: reduced ? 0.2 : 1.0 + i * 0.13, type: "spring", stiffness: 320, damping: 18 }}
            >
              {c}
            </motion.span>
          ))}
        </div>

        {/* floating stat cards */}
        <motion.div
          className="mt-11 flex flex-wrap justify-center items-stretch gap-4"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.3 : 2.1, duration: 0.65, ease: EASE }}
        >
          <div className="hb-float rounded-2xl border border-navy-900/10 bg-white px-6 py-4 shadow-[0_18px_50px_rgba(8,22,49,0.14)]">
            <div className="font-display text-2xl font-black text-quest-600 tabular-nums">₱428,000</div>
            <div className="font-head text-[11px] font-semibold text-navy-500 mt-0.5">Monthly revenue · live</div>
          </div>
          <div className="hb-float-slow rounded-2xl border border-navy-900/10 bg-navy-950 px-6 py-4 shadow-[0_18px_50px_rgba(8,22,49,0.30)]">
            <div className="font-display text-2xl font-black text-quest-400 tabular-nums">3 DAYS</div>
            <div className="font-head text-[11px] font-semibold text-navy-300 mt-0.5">Month-end closed early</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =============================================================
   SLIDE 3 — the HAYPBOOKS wordmark finale
   ============================================================= */
function SlideThree({ reduced }: { reduced: boolean }) {
  const letters = "HAYPBOOKS".split("");
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-navy-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.4, scale: 0.97, transition: { duration: 0.4 } }}
      transition={{ duration: reduced ? 0.25 : 0.6 }}
    >
      {/* slow aurora + vignette */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent)] blur-2xl"
        animate={{ scale: [1, 1.18, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(rgba(110,231,183,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,.5)_1px,transparent_1px)] bg-[length:44px_44px] animate-[hb-grid-pan_3s_linear_infinite]"
      />

      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* pixel eyebrow */}
        <motion.span
          className="font-pixel text-[9px] text-quest-400 tracking-widest"
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ delay: reduced ? 0.1 : 0.3, duration: 0.8 }}
        >
          WELCOME TO
        </motion.span>

        {/* the wordmark — letters flip in one by one */}
        <div className="relative mt-6 overflow-hidden">
          <h2
            className="font-display font-black text-white leading-none text-[13vw] sm:text-7xl lg:text-8xl flex"
            aria-label="HaypBooks"
          >
            {letters.map((l, i) => (
              <motion.span
                key={i}
                className={i >= 4 ? "text-transparent bg-clip-text bg-gradient-to-b from-quest-300 to-quest-500" : ""}
                initial={{ opacity: 0, rotateX: -95, y: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
                transition={{ delay: reduced ? 0.15 + i * 0.05 : 0.65 + i * 0.11, duration: 0.55, ease: EASE }}
                style={{ transformOrigin: "bottom center", display: "inline-block" }}
              >
                {l}
              </motion.span>
            ))}
          </h2>

          {/* shine sweep across the finished word */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none"
            style={{ skewX: -14 }}
            initial={{ x: "-180%" }}
            animate={{ x: "520%" }}
            transition={{ delay: reduced ? 0.6 : 2.15, duration: 0.95, ease: "easeInOut" }}
          />
        </div>

        {/* underline draw */}
        <motion.div
          className="mt-5 h-1 rounded-full bg-gradient-to-r from-transparent via-quest-400 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "min(420px, 70vw)", opacity: 1 }}
          transition={{ delay: reduced ? 0.4 : 1.9, duration: 0.7, ease: EASE }}
        />

        {/* tagline */}
        <motion.p
          className="mt-7 font-head text-base sm:text-xl text-navy-200/85 text-center max-w-lg"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.5 : 2.45, duration: 0.6 }}
        >
          Take control of your books.
          <span className="block mt-1 font-pixel text-[8px] sm:text-[9px] text-quest-400/90 tracking-[0.35em]">
            LET&apos;S GET STARTED
          </span>
        </motion.p>
      </div>
    </motion.div>
  );
}
