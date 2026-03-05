'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef } from 'react';

const SaturnScene = dynamic(() => import('../components/SaturnScene'), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_THETA = Math.PI / 6;
const DEFAULT_PHI = Math.PI / 2.5;
const DEFAULT_RADIUS = 11;   // Starts far — user zooms in!
const MIN_RADIUS = 2.0;
const MAX_RADIUS = 13;
const STEP_ANGLE = 0.5;
const STEP_ZOOM = 0.5;

// Static photos — just put your image files in public/photos/
const STATIC_PHOTOS = [
  '/photos/photo1.jpg',
  '/photos/photo2.jpg',
  '/photos/photo3.jpg',
  '/photos/photo4.jpg',
  '/photos/photo5.jpg',
  '/photos/photo6.jpg',
];

export default function Home() {
  const [theta, setTheta] = useState(DEFAULT_THETA);
  const [phi, setPhi] = useState(DEFAULT_PHI);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  const pressedRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    const p = pressedRef.current;
    if (p.size === 0) { rafRef.current = null; return; }
    if (p.has('left')) setTheta(t => t - STEP_ANGLE * 0.04);
    if (p.has('right')) setTheta(t => t + STEP_ANGLE * 0.04);
    if (p.has('up')) setPhi(v => Math.max(0.15, v - STEP_ANGLE * 0.04));
    if (p.has('down')) setPhi(v => Math.min(Math.PI - 0.15, v + STEP_ANGLE * 0.04));
    if (p.has('zoomin')) setRadius(r => Math.max(MIN_RADIUS, r - STEP_ZOOM * 0.06));
    if (p.has('zoomout')) setRadius(r => Math.min(MAX_RADIUS, r + STEP_ZOOM * 0.06));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startPress = useCallback((key: string) => {
    pressedRef.current.add(key);
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const endPress = useCallback((key: string) => {
    pressedRef.current.delete(key);
  }, []);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') startPress('left');
      if (e.key === 'ArrowRight') startPress('right');
      if (e.key === 'ArrowUp') startPress('up');
      if (e.key === 'ArrowDown') startPress('down');
      if (e.key === '+' || e.key === '=') startPress('zoomin');
      if (e.key === '-') startPress('zoomout');
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') endPress('left');
      if (e.key === 'ArrowRight') endPress('right');
      if (e.key === 'ArrowUp') endPress('up');
      if (e.key === 'ArrowDown') endPress('down');
      if (e.key === '+' || e.key === '=') endPress('zoomin');
      if (e.key === '-') endPress('zoomout');
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, [startPress, endPress]);

  const btnProps = (key: string) => ({
    onMouseDown: () => startPress(key),
    onMouseUp: () => endPress(key),
    onMouseLeave: () => endPress(key),
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); startPress(key); },
    onTouchEnd: () => endPress(key),
  });

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#03030a', position: 'relative', overflow: 'hidden' }}>
      {/* Fullscreen canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <SaturnScene theta={theta} phi={phi} radius={radius} photoUrls={STATIC_PHOTOS} />
      </div>

      {/* Controls */}
      <div className="controls-wrapper">
        {/* Zoom buttons */}
        <div className="zoom-group">
          <button className="ctrl-btn zoom-btn" {...btnProps('zoomin')} aria-label="Zoom in">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="9" y1="5" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button className="ctrl-btn zoom-btn" {...btnProps('zoomout')} aria-label="Zoom out">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* D-pad */}
        <div className="dpad">
          <button className="ctrl-btn arrow-btn dpad-up"    {...btnProps('up')} aria-label="Up">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3L14 11H2L8 3Z" fill="currentColor" /></svg>
          </button>
          <button className="ctrl-btn arrow-btn dpad-left"  {...btnProps('left')} aria-label="Left">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L11 2V14L3 8Z" fill="currentColor" /></svg>
          </button>
          <div className="dpad-center"><div className="dpad-dot" /></div>
          <button className="ctrl-btn arrow-btn dpad-right" {...btnProps('right')} aria-label="Right">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8L5 2V14L13 8Z" fill="currentColor" /></svg>
          </button>
          <button className="ctrl-btn arrow-btn dpad-down"  {...btnProps('down')} aria-label="Down">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13L2 5H14L8 13Z" fill="currentColor" /></svg>
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="hint-label">
        ♄ SATURN · ↑↓←→ rotate · +/− zoom · Zoom in untuk lihat foto 💖
      </div>
    </div>
  );
}
