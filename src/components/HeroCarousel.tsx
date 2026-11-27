"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./HeroCarousel.css";

const CLASSROOM = "https://www.skool.com/aiworkforce/classroom";
const JOIN = "https://www.skool.com/aiworkforce";
const INTERVAL = 6500;

const COURSES = [
  { title: "Build Your First AI Agent", description: "Get your first AI employee working and pick one real problem to solve.", src: "/hero-carousel/month-01.webp" },
  { title: "Build Your AI Helpers", description: "Turn the problems you found into a small personal AI team doing real work for you.", src: "/hero-carousel/month-02.webp", stat: "Workers are interrupted every 2 minutes, 275 times a day.", source: "Microsoft Work Trend Index 2025" },
  { title: "Turn a Problem Into a Business", description: "Explore a problem worth solving, a likely customer, and a simple offer.", src: "/hero-carousel/month-03.webp", stat: "The cost of GPT-3.5-level AI dropped over 280-fold in two years.", source: "Stanford AI Index 2025" },
  { title: "Find Your First Customers", description: "Move from building to real conversations and work toward your first paying customer.", src: "/hero-carousel/month-04.webp", stat: "Frontier firms use AI for customer success 66% of the time vs. 44% globally.", source: "Microsoft Work Trend Index 2025" },
  { title: "Let AI Help Run the Business", description: "Let AI employees handle real business work, with you approving what matters.", src: "/hero-carousel/month-05.webp", stat: "By 2028, at least 15% of day-to-day work decisions will be made autonomously by agentic AI.", source: "Gartner" },
  { title: "Build Your AI Workforce", description: "Connect your separate helpers into one organized system and see what AI now handles for you.", src: "/hero-carousel/month-06.webp", stat: "78% of organizations used AI in 2024, up from 55% the year before.", source: "Stanford AI Index 2025" },
];
const N = COURSES.length;

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
type Course = { title: string; description: string; src: string; stat?: string; source?: string };

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tick, setTick] = useState(0); // restarts the timer after manual navigation
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const autoplay = playing ?? !reduceMotion;

  const show = useCallback((i: number) => {
    setCurrent(((i % N) + N) % N);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!autoplay || hovered || focused || hidden) return;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % N), INTERVAL);
    return () => window.clearInterval(id);
  }, [autoplay, hovered, focused, hidden, tick]);

  const course: Course = COURSES[current];

  return (
    <div className="pragvance-workforce-hero">
      <div className="pwh-intro">
        <div className="pwh-brand">
          <h1 className="pwh-sr">Your first agent. Your own AI workforce.</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/pragvance-banner-1916.webp"
            srcSet="/brand/pragvance-banner-640.webp 640w, /brand/pragvance-banner-1280.webp 1280w, /brand/pragvance-banner-1916.webp 1916w"
            sizes="(max-width: 760px) 92vw, (max-width: 1100px) 54vw, 880px"
            alt="Pragvance.ai — Practical AI. Built to advance your business."
            width={1916}
            height={821}
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <p className="pwh-lede">
          Build AI helpers (AI agents) that solve real problems in your life and business.
        </p>
      </div>
      <section aria-label="Six months of AI Workforce learning">
        <div
          ref={rootRef}
          className="pwh-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="AI Workforce monthly courses"
          tabIndex={0}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => setFocused(!!rootRef.current?.contains(e.relatedTarget as Node | null))}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
          }}
        >
          <div
            className="pwh-stage"
            onTouchStart={(e) => { touchStart.current = e.changedTouches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStart.current == null) return;
              const d = e.changedTouches[0].clientX - touchStart.current;
              touchStart.current = null;
              if (Math.abs(d) > 45) show(current + (d < 0 ? 1 : -1));
            }}
          >
            {COURSES.map((c, i) => (
              <div
                key={c.src}
                className={`pwh-slide${i === current ? " active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${N}: ${c.title}`}
                aria-hidden={i !== current}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.src}
                  alt={`Month ${i + 1}: ${c.title} — AI Workforce by Pragvance`}
                  width={1747}
                  height={900}
                  decoding="async"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </div>
            ))}
            <button type="button" className="pwh-arrow pwh-prev" aria-label="Previous month" onClick={() => show(current - 1)}>‹</button>
            <button type="button" className="pwh-arrow pwh-next" aria-label="Next month" onClick={() => show(current + 1)}>›</button>
          </div>
          <p className="pwh-stat" aria-live="polite">
            {course.stat ? (
              <>
                {course.stat} <span className="pwh-src">Source: {course.source}</span>
              </>
            ) : (
              "\u00a0"
            )}
          </p>
          <div className="pwh-controls">
            <div className="pwh-months" aria-label="Choose month">
              {COURSES.map((c, i) => (
                <button
                  type="button"
                  key={c.src}
                  className="pwh-month"
                  aria-current={i === current}
                  aria-label={`Show Month ${i + 1}: ${c.title}`}
                  onClick={() => show(i)}
                >
                  MONTH {i + 1}
                </button>
              ))}
            </div>
            <span className="pwh-count" aria-live="polite">0{current + 1} / 0{N}</span>
            <button
              type="button"
              className="pwh-pause"
              aria-label={autoplay ? "Pause automatic rotation" : "Start automatic rotation"}
              onClick={() => setPlaying(!autoplay)}
            >
              {autoplay ? "❚❚ Pause" : "▶ Play"}
            </button>
          </div>
        </div>
      </section>
      <div className="pwh-detail">
        <div>
          <h2>Month {current + 1}: {course.title}</h2>
          <p>{course.description}</p>
        </div>
        <div className="pwh-ctas">
          <a className="pwh-cta" href={CLASSROOM}>Explore the classroom →</a>
          <a className="pwh-join" href={JOIN}>Join AI Workforce</a>
        </div>
      </div>
    </div>
  );
}
