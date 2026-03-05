'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const [stars, setStars] = useState<{ x: number; y: number; r: number; o: number; d: number }[]>([]);
  const [ready, setReady] = useState(false);

  // Generate random stars on client only
  useEffect(() => {
    setStars(
      Array.from({ length: 160 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: 0.5 + Math.random() * 1.5,
        o: 0.2 + Math.random() * 0.7,
        d: 1.5 + Math.random() * 3,
      }))
    );
    // Fade in
    setTimeout(() => setReady(true), 50);
  }, []);

  return (
    <div className="welcome-root">
      {/* CSS Stars */}
      <div className="welcome-stars" aria-hidden>
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              opacity: s.o,
              animationDuration: `${s.d}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient glows */}
      <div className="welcome-glow-1" aria-hidden />
      <div className="welcome-glow-2" aria-hidden />

      {/* Content */}
      <main className={`welcome-content ${ready ? 'visible' : ''}`}>
        <h1 className="welcome-title">
          Haloo<br />
          <span className="welcome-highlight">Bocil</span>
          <span className="welcome-wave">👋</span>
        </h1>
        <button
          className="welcome-btn"
          onClick={() => router.push('/saturn')}
          aria-label="Mulai petualangan"
        >
          <span className="btn-text">Mulai ✦</span>
          <span className="btn-glow" aria-hidden />
        </button>

      </main>
    </div>
  );
}
