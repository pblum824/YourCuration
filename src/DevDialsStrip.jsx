// File: src/DevDialsStrip.jsx — aligned chips, vertical popover slider (downwards), Reset chip
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * DevDialsStrip
 * - Chips flanking center
 * - Vertical slider popover (Safari/iOS safe) using rotated range + WebKit styles
 */
export default function DevDialsStrip({ devMode, values, onChange, center, onReset, portalTarget }) {
  if (!devMode) return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>{center}</div>
  );

  const target = portalTarget || (typeof document !== 'undefined' ? document.body : null);
  const [open, setOpen] = useState(null); // { key, rect }

  const leftDials = useMemo(() => ([
    { key: 'NEUTRAL_COLORED_MAX', label: 'Neutral colored max', min: 0, max: 10, step: 0.5, fmt: (v)=>`${v}%` },
    { key: 'NEUTRAL_RATIO_MIN',   label: 'Neutral ratio min',   min: 80, max: 100, step: 1,   fmt: (v)=>`${v}%` },
    { key: 'BW_EXTREME_MIN',      label: 'B&W extremes',        min: 80, max: 100, step: 1,   fmt: (v)=>`${v}%` },
    { key: 'BW_MID_MAX',          label: 'B&W mid max',         min: 0,  max: 20,  step: 0.5, fmt: (v)=>`${v}%` },
    { key: 'BW_ENTROPY_MAX',      label: 'B&W entropy max',     min: 2,  max: 6,   step: 0.1, fmt: (v)=>v.toFixed(1) },
  ]), []);

  const rightDials = useMemo(() => ([
    { key: 'DISTINCT_DE',      label: 'Distinct ΔE',       min: 8,  max: 40, step: 1, fmt: (v)=>`${v}` },
    { key: 'DISTINCT_DHUE',    label: 'Distinct ΔHue',     min: 5,  max: 40, step: 1, fmt: (v)=>`${v}°` },
    { key: 'SELECTIVE_MAX',    label: 'Selective area',    min: 10, max: 60, step: 1, fmt: (v)=>`${v}%` },
    { key: 'DOMINANCE_NARROW', label: 'Mono dominance',    min: 50, max: 90, step: 1, fmt: (v)=>`${v}%` },
    { key: 'SEPIA_CENTER',     label: 'Sepia band (center)',min: 20, max: 40, step: 1, fmt: (v)=>`${v}°` },
  ]), []);

  const getVal = (k) => {
    if (k === 'SEPIA_CENTER') {
      const min = Number(values?.SEPIA_HUE_MIN ?? 15);
      const max = Number(values?.SEPIA_HUE_MAX ?? 50);
      return Math.round((min + max) / 2);
    }
    return Number(values?.[k] ?? 0);
  };

  const setVal = (k, v) => {
    if (!onChange) return;
    if (k === 'SEPIA_CENTER') {
      const half = 17;
      const min = Math.max(0, Math.round(v - half));
      const max = Math.min(360, Math.round(v + half));
      onChange('SEPIA_HUE_MIN', min);
      onChange('SEPIA_HUE_MAX', max);
    } else {
      onChange(k, Number(v));
    }
  };

  useEffect(() => {
    const onWindow = () => {
      if (!open) return;
      const el = document.querySelector(`[data-dial-key="${open.key}"]`);
      if (el) setOpen((o) => ({ ...o, rect: el.getBoundingClientRect() }));
    };
    window.addEventListener('resize', onWindow);
    window.addEventListener('scroll', onWindow, true);
    return () => {
      window.removeEventListener('resize', onWindow);
      window.removeEventListener('scroll', onWindow, true);
    };
  }, [open]);

  const Chip = ({ dial }) => (
    <button
      type="button"
      data-dial-key={dial.key}
      onClick={(e) => setOpen({ key: dial.key, rect: e.currentTarget.getBoundingClientRect() })}
      style={{
        padding: '6px 10px',
        borderRadius: 9999,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#fff',
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        whiteSpace: 'nowrap',
      }}
      title={dial.label}
    >
      <span style={{ opacity: 0.7 }}>{dial.label}</span>
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>
        {dial.fmt(getVal(dial.key))}
      </span>
    </button>
  );

  // ----- Custom vertical slider: supports tap + drag on all browsers -----
  function VerticalSlider({ min, max, step, value, onChange }) {
    const trackRef = useRef(null);

    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const snap = (val) => {
      const s = Number(step || 1);
      const snapped = Math.round((val - min) / s) * s + min;
      return clamp(snapped, min, max);
    };

    const percent = ((value - min) / (max - min)) || 0; // 0..1

    const handleAt = (clientY) => {
      const r = trackRef.current.getBoundingClientRect();
      const p = clamp((clientY - r.top) / r.height, 0, 1);
      const val = snap(min + (1 - p) * (max - min)); // top=max, bottom=min
      onChange && onChange(val);
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      trackRef.current.setPointerCapture?.(e.pointerId);
      handleAt(e.clientY);
    };
    const onPointerMove = (e) => {
      if (e.buttons !== 1) return;
      handleAt(e.clientY);
    };

    const h = 140; // visual height

    return (
      <div style={{ width: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          style={{ position: 'relative', width: 36, height: h, borderRadius: 10, background: '#fff' }}
        >
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, bottom: 8, width: 4, borderRadius: 9999, background: '#e5e7eb', border: '1px solid #e5e7eb' }} />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, 50%)',
              bottom: 8 + (1 - percent) * (h - 16 - 8),
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#1e3a8a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)'
            }}
          />
        </div>
        <div style={{ marginLeft: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>{value}</div>
      </div>
    );
  }

  const Popover = () => {
    if (!open || !target) return null;
    const dial = [...leftDials, ...rightDials].find(d => d.key === open.key);
    if (!dial) return null;

    const style = {
      position: 'fixed',
      top: open.rect.bottom + 8,
      left: Math.max(8, Math.min(window.innerWidth - 220, open.rect.left + (open.rect.width/2) - 110)),
      width: 220, // narrower, cleaner
      zIndex: 1000,
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.12)',
      borderRadius: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      padding: 12,
    };

    return createPortal(
      <div style={style}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{dial.label}</div>
          <button onClick={() => setOpen(null)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.08)' }}>Close</button>
        </div>
        <VerticalSlider
          min={dial.min}
          max={dial.max}
          step={dial.step}
          value={getVal(dial.key)}
          onChange={(v) => setVal(dial.key, v)}
        />
        <div style={{ textAlign: 'right', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11 }}>
          {dial.fmt(getVal(dial.key))}
        </div>
      </div>,
      target
    );
  };

  return (
    <div style={{ position: 'relative', marginBottom: 24, minHeight: 46 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{center}</div>

      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
        {leftDials.map((d) => <Chip key={d.key} dial={d} />)}
      </div>

      <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8, alignItems: 'center' }}>
        {rightDials.map((d) => <Chip key={d.key} dial={d} />)}
        <button type="button" onClick={() => onReset && onReset()}
          style={{ padding: '6px 10px', borderRadius: 9999, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', fontSize: 12 }}>Reset</button>
      </div>

      <Popover />
    </div>
  );
}