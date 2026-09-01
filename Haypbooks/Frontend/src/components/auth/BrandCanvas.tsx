"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * BrandCanvas — "Minimal Constellation" background for the auth brand panel.
 * A sparse field of soft emerald dots drifting very slowly, linked by faint
 * lines when close. Fully NON-INTERACTIVE: no pointer listeners, no parallax,
 * no streaks, no glyphs. Container-sized (ResizeObserver), DPR-capped,
 * pauses when the tab is hidden, single static frame for reduced motion.
 *
 * The particle field PERSISTS across auth page navigations (module scope):
 * login -> signup -> verify-otp remount this canvas, and without persistence
 * the starfield would visibly jump to a fresh random layout (flicker).
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  depth: number;
  rgb: string;
  alpha: number;
  tw: number;
  twSpeed: number;
};

const DOT_COLORS = ["16, 185, 129", "52, 211, 153", "110, 231, 183"];

const LINK_DIST = 100;

const NOMINAL_FRAME = 16.7; // ms — used to dead-reckon drift while unmounted

/** Field saved by the last unmounted instance (same panel size => seamless restore). */
let savedField: { particles: Particle[]; at: number; w: number; h: number } | null = null;

/** Keep a drifted coordinate inside the particle torus [-20, max + 20]. */
const wrapCoord = (v: number, max: number) => {
  const span = max + 40;
  return ((((v + 20) % span) + span) % span) - 20;
};

// Paint the first frame BEFORE the browser paints so a fresh canvas never
// flashes empty during auth <-> auth navigation.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function BrandCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useIsoLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement;
    if (!host) return;

    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      // Seamless hand-off: reuse the previous instance's field at the same size
      if (savedField && savedField.w === W && savedField.h === H) {
        const elapsed = Math.min(Math.max(performance.now() - savedField.at, 0), 5000);
        particles = savedField.particles.map((p) => ({
          ...p,
          x: wrapCoord(p.x + (p.vx * elapsed) / NOMINAL_FRAME, W),
          y: wrapCoord(p.y + (p.vy * elapsed) / NOMINAL_FRAME, H),
          tw: p.tw + (p.twSpeed * elapsed) / NOMINAL_FRAME,
        }));
        savedField = null;
        return;
      }
      // sparse on purpose — roughly 20-34 dots for the panel size
      const count = Math.min(34, Math.max(20, Math.floor((W * H) / 26000)));
      particles = Array.from({ length: count }, () => {
        const depth = 0.4 + Math.random() * 0.6;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16 * depth, // very slow drift
          vy: (Math.random() - 0.5) * 0.16 * depth,
          r: 0.9 + Math.random() * 1.6,
          depth,
          rgb: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
          alpha: 0.16 + Math.random() * 0.26,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.006 + Math.random() * 0.012, // twinkle cycle ~9-17s
        };
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (W < 60 || H < 60) {
        // panel hidden (mobile / display:none) — keep it empty and cheap
        particles = [];
        ctx.clearRect(0, 0, W, H);
        return;
      }
      build();
    };

    const draw = () => {
      if (W < 60 || H < 60) return;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.tw += p.twSpeed;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // faint link lines to nearby dots
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const a = (1 - d / LINK_DIST) * 0.13 * Math.min(p.depth, q.depth);
            const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            grad.addColorStop(0, `rgba(16, 185, 129, ${a.toFixed(3)})`);
            grad.addColorStop(1, `rgba(45, 212, 191, ${a.toFixed(3)})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // soft dot with gentle twinkle
        const twinkle = 0.85 + 0.15 * Math.sin(p.tw);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb}, ${(p.alpha * twinkle).toFixed(3)})`;
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      // hand the live field to the next mount so the starfield never restarts
      if (W >= 60 && H >= 60 && particles.length) {
        savedField = { particles, at: performance.now(), w: W, h: H };
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}
