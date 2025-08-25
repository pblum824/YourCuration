// File: src/utils/LoadingOverlay.jsx — ETA-aware progress (drop-in replacement)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFontStyle } from './fontUtils';
import { useFontSettings } from '../FontSettingsContext';

function formatETA(sec) {
  if (!isFinite(sec) || sec <= 0) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Props
 * - onCancel: () => void
 * - imageCount: total images intended (number)
 * - processed: images completed so far (number, optional)
 * - avgSecPerImage: moving average seconds per image (number, optional)
 * - mode: 'tag' | 'upload'
 *
 * Behavior
 * - If processed & avgSecPerImage are provided (GenerateTags chunking), bar shows
 *   real % and ETA = (imageCount - processed) * avgSecPerImage.
 * - Otherwise falls back to a gentle animated estimate using imageCount & mode.
 */
export default function LoadingOverlay({
  onCancel,
  imageCount = 0,
  processed,
  avgSecPerImage,
  mode = 'upload',
}) {
  const { selectedFont } = useFontSettings();

  // Fallback animation when no external progress supplied
  const [animPct, setAnimPct] = useState(0);
  const rafRef = useRef(null);

  const hasExternal = typeof processed === 'number' && typeof avgSecPerImage === 'number';
  const pct = useMemo(() => {
    if (hasExternal && imageCount > 0) {
      const p = Math.min(100, Math.max(0, (processed / imageCount) * 100));
      return p;
    }
    return animPct; // fallback animation
  }, [hasExternal, processed, imageCount, animPct]);

  const etaSec = useMemo(() => {
    if (hasExternal && imageCount > 0) {
      const remaining = Math.max(0, imageCount - processed);
      return remaining * Math.max(0, avgSecPerImage);
    }
    // crude ETA for fallback: assume ~300ms/img + base 10s
    const est = (mode === 'tag' ? (imageCount * 0.30 + 10) : (imageCount * 0.30));
    const remainingFrac = Math.max(0, 1 - pct / 100);
    return est * remainingFrac;
  }, [hasExternal, imageCount, processed, avgSecPerImage, pct, mode]);

  useEffect(() => {
    if (hasExternal) {
      // using real progress, stop any animation
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    // fallback animation curve (ease-out towards ~95%)
    let start;
    const base = Math.max(10000, mode === 'tag' ? (imageCount * 300 + 8000) : (imageCount * 300));
    const animate = (ts) => {
      if (!start) start = ts;
      const t = ts - start;
      const x = Math.min(1, t / base);
      const eased = 100 * (1 - Math.pow(1 - x, 2)); // quad ease-out
      setAnimPct(eased);
      if (eased < 99.5) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [hasExternal, imageCount, mode]);

  const title = mode === 'tag' ? 'Processing image metadata tags...' : 'Uploading photos...';
  const fontStyle = getFontStyle('artist', { selectedFont });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
      }}
      aria-modal="true" role="dialog"
    >
      <div
        style={{
          background: '#fff', padding: '2rem', borderRadius: '1rem', textAlign: 'center', width: 340,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)', ...fontStyle,
        }}
      >
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{title}</p>

        {/* Progress bar */}
        <div style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              width: `${pct.toFixed(2)}%`, height: '100%', backgroundColor: '#1e3a8a', transition: 'width 350ms ease',
            }}
          />
          {/* In-bar label */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 12, color: '#111827', background: 'rgba(255,255,255,0.78)',
              padding: '2px 6px', borderRadius: 6, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)'
            }}>
              {hasExternal
                ? `${processed}/${imageCount} (${pct.toFixed(1)}%) • ETA ${formatETA(etaSec)}`
                : `${pct.toFixed(0)}%`}
            </span>
          </div>
        </div>

        <button
          onClick={onCancel}
          style={{
            marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.5rem',
            backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #b91c1c', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
