"use client";

import { useEffect, useRef } from "react";

/*
 * Hero Earth that turns on its axis (not like a wheel).
 * - Static layer: the original Earth cut from the banner (exact resting frame).
 * - Canvas layer: NASA Black Marble 2012 night-lights texture (public domain, NASA Earth
 *   Observatory) orthographically projected onto the same disc; the texture scrolls in
 *   longitude while the lighting/limb glow is fixed, so the terminator and flare stay put.
 * Loop: fade canvas in over 1.5s, turn 180deg over 90s, fade back to the original over the
 * last 1.5s, repeat. prefers-reduced-motion: canvas never starts (still original frame).
 */

// Geometry from layout.json, in banner source pixels (1984x793).
const SRC_W = 1984;
const SRC_H = 793;
const CX = 1997.9;
const CY = 1651.8;
const R = 1296.4;
const TILT = (22 * Math.PI) / 180; // pole tilted toward viewer
const CYCLE = 90; // seconds for 180deg
const FADE = 1.5; // seconds

export default function HeroEarth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let stopped = false;
    const img = new Image();
    img.src = "/earth-night-2048.jpg";
    img.onload = () => {
      if (stopped) return;
      const TW = img.naturalWidth;
      const TH = img.naturalHeight;
      const tc = document.createElement("canvas");
      tc.width = TW;
      tc.height = TH;
      const tctx = tc.getContext("2d");
      if (!tctx) return;
      tctx.drawImage(img, 0, 0);
      const tex = tctx.getImageData(0, 0, TW, TH).data;

      // Only the part of the banner the disc (plus glow) can touch.
      const x0 = Math.max(0, Math.floor(CX - R * 1.04));
      const y0 = Math.max(0, Math.floor(CY - R * 1.04));
      const W = SRC_W - x0;
      const H = SRC_H - y0;
      canvas.width = W;
      canvas.height = H;
      canvas.style.left = `${(x0 / SRC_W) * 100}%`;
      canvas.style.top = `${(y0 / SRC_H) * 100}%`;
      canvas.style.width = `${(W / SRC_W) * 100}%`;
      canvas.style.height = `${(H / SRC_H) * 100}%`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const out = ctx.createImageData(W, H);
      const o = out.data;

      // Precompute per-pixel texture coords + fixed lighting.
      const n = W * H;
      const uBase = new Float32Array(n);
      const vRow = new Int32Array(n);
      const lit = new Float32Array(n); // multiplier for night lights
      const rimR = new Float32Array(n);
      const rimG = new Float32Array(n);
      const rimB = new Float32Array(n);
      const alpha = new Uint8ClampedArray(n);
      const inside = new Uint8Array(n);
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      // Sun direction: upper right, slightly behind the limb (matches the flare).
      const sx = 0.35, sy = 0.9, sz = -0.25;
      const sl = Math.hypot(sx, sy, sz);
      for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
          const k = j * W + i;
          const dx = (x0 + i + 0.5 - CX) / R;
          const dy = -(y0 + j + 0.5 - CY) / R;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            const z = Math.sqrt(1 - d2);
            const y2 = dy * cosT + z * sinT;
            const z2 = -dy * sinT + z * cosT;
            const lat = Math.asin(Math.max(-1, Math.min(1, y2)));
            const lon = Math.atan2(dx, z2);
            uBase[k] = ((lon / (2 * Math.PI)) + 0.5) * TW;
            vRow[k] = Math.min(TH - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * TH))) * TW;
            const sun = Math.max(0, (dx * sx + dy * sy + z * sz) / sl);
            const limb = Math.pow(1 - z, 3);
            lit[k] = 1.5 * (0.7 + 0.3 * z);
            const glow = limb * (0.3 + 1.3 * sun) + 0.06 * sun;
            rimR[k] = 40 * glow;
            rimG[k] = 120 * glow;
            rimB[k] = 255 * glow;
            alpha[k] = 255;
            inside[k] = 1;
          } else {
            const d = Math.sqrt(d2);
            const t = (d - 1) / 0.035;
            if (t < 1) {
              const sun = Math.max(0, (dx * sx + dy * sy) / d / sl);
              const a = Math.pow(1 - t, 2.5) * (0.35 + 0.65 * sun);
              rimR[k] = 60;
              rimG[k] = 150;
              rimB[k] = 255;
              alpha[k] = Math.round(255 * a);
            }
          }
        }
      }
      for (let k = 0; k < n; k++) {
        if (!inside[k] && alpha[k]) {
          o[k * 4] = rimR[k];
          o[k * 4 + 1] = rimG[k];
          o[k * 4 + 2] = rimB[k];
          o[k * 4 + 3] = alpha[k];
        }
      }

      const start = performance.now();
      let last = -1;
      const frame = (now: number) => {
        if (stopped) return;
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return; // ~30fps is plenty for this speed
        last = now;
        const t = ((now - start) / 1000) % CYCLE;
        const shift = (t / CYCLE) * (TW / 2); // 180deg over the cycle
        for (let k = 0; k < n; k++) {
          if (!inside[k]) continue;
          let u = Math.floor(uBase[k] - shift) % TW;
          if (u < 0) u += TW;
          const p = (vRow[k] + u) * 4;
          const L = lit[k];
          const q = k * 4;
          // Keep only the city lights (red channel is ~0 over the blue-tinted oceans), warm them.
          const v = Math.max(0, tex[p] - 18) * L;
          o[q] = 6 + v * 1.25 + rimR[k];
          o[q + 1] = 12 + v * 1.0 + rimG[k];
          o[q + 2] = 28 + v * 0.6 + rimB[k];
          o[q + 3] = 255;
        }
        ctx.putImageData(out, 0, 0);
        const fadeIn = Math.min(1, t / FADE);
        const fadeOut = Math.min(1, (CYCLE - t) / FADE);
        canvas.style.opacity = String(Math.min(fadeIn, fadeOut));
      };
      raf = requestAnimationFrame(frame);
    };
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-earth.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute select-none"
        style={{ maxWidth: "none", left: "33.972%", top: "41.362%", width: "133.518%", height: "334.048%" }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ opacity: 0 }}
      />
    </>
  );
}
