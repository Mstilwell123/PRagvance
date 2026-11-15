"use client";

import { useRef, useState } from "react";

/**
 * "Tap to hear [owner]" control. Plays the owner's recorded clip only on tap (never autoplay).
 * With no clip yet, it renders a visible, disabled "recording coming soon" state and plays nothing.
 */
export default function TapToHear({ owner, src }: { owner: string; src: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!src) {
    return (
      <button type="button" className="su-tap" disabled aria-describedby="su-tap-note">
        <PlayIcon />
        <span>Tap to hear {owner}</span>
        <span id="su-tap-note" className="su-tap-note">
          Recording coming soon
        </span>
      </button>
    );
  }

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  };

  return (
    <>
      <button type="button" className="su-tap" onClick={toggle} aria-pressed={playing}>
        <PlayIcon />
        <span>{playing ? `Pause ${owner}` : `Tap to hear ${owner}`}</span>
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" focusable="false">
      <path d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
    </svg>
  );
}
