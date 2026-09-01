"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleField — the mindblowing living background.
 * A full-viewport canvas with drifting emerald/navy particles,
 * connective neural lines, floating currency glyphs (+, ₱, $, %, ¢)
 * and mouse-parallax depth. White-dominant, so everything is drawn
 * with soft alpha to keep the page bright and premium.
 */
const GLYPHS = ["₱", "$", "€", "¥", "%", "+", "¢", "£"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  depth: number;
  color: string;
  alpha: number;
};

type Glyph = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  char: string;
  alpha: number;
  rot: number;
  vr: number;
  depth: number;
};

const DOT_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#1b4274", "#2b5c96", "#059669"];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let glyphs: Glyph[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      const area = W * H;
      const count = Math.min(96, Math.max(38, Math.floor(area / 22000)));
      particles = Array.from({ length: count }, () => {
        const depth = 0.35 + Math.random() * 0.65; // 0..1 depth for parallax
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35 * depth,
          vy: (Math.random() - 0.5) * 0.35 * depth,
          r: 1.2 + Math.random() * 2.6,
          depth,
          color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
          alpha: 0.14 + Math.random() * 0.3,
        };
      });
      const gCount = Math.min(14, Math.max(6, Math.floor(area / 190000)));
      glyphs = Array.from({ length: gCount }, () => {
        const depth = 0.3 + Math.random() * 0.7;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(0.1 + Math.random() * 0.22) * depth,
          size: 26 + Math.random() * 44,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          alpha: 0.05 + Math.random() * 0.07,
          rot: (Math.random() - 0.5) * 0.6,
          vr: (Math.random() - 0.5) * 0.0016,
          depth,
        };
      });
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const LINK_DIST = 120;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // soft drifting glyphs
      for (const g of glyphs) {
        g.x += g.vx + (mouse.x !== -9999 ? ((W / 2 - mouse.x) / W) * 0.25 * g.depth : 0);
        g.y += g.vy;
        g.rot += g.vr;
        if (g.y < -80) g.y = H + 80;
        if (g.x < -80) g.x = W + 80;
        if (g.x > W + 80) g.x = -80;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.font = `600 ${g.size}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = `rgba(16, 185, 129, ${g.alpha})`;
        if (g.char === "%" || g.char === "+") {
          ctx.fillStyle = `rgba(27, 66, 116, ${g.alpha})`;
        }
        ctx.textAlign = "center";
        ctx.fillText(g.char, 0, 0);
        ctx.restore();
      }

      // particles + link lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // mouse parallax repel — gentle
        if (mouse.x !== -9999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = ((140 - d) / 140) * 0.06 * p.depth;
            p.x += (dx / d) * f;
            p.y += (dy / d) * f;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // links
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const a = (1 - d / LINK_DIST) * 0.1 * Math.min(p.depth, q.depth);
            const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            grad.addColorStop(0, `rgba(16, 185, 129, ${a})`);
            grad.addColorStop(1, `rgba(27, 66, 116, ${a})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const loop = () => {
      if (!running) return;
      // ease mouse
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (mouse.x === -9999) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
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
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* soft ambient glows */}
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-quest-200/30 blur-[120px]" />
      <div className="absolute top-1/3 -right-48 w-[40rem] h-[40rem] rounded-full bg-navy-200/25 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] rounded-full bg-quest-100/40 blur-[110px]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
