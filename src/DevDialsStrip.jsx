// File: src/DevDialsStrip.jsx — modular dev dials with downward slider + Reset chip
import React, { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * DevDialsStrip.jsx
 * - 10 dial chips (5 left / 5 right) flanking a center control (passed via props)
 * - Clicking a chip opens a LARGE vertical slider DROPPING DOWN beneath it
 * - Only one slider open at a time
 * - Includes a small right-aligned **Reset** chip (dev-only)
 */
export default function DevDialsStrip({ devMode, values, onChange, center, portalTarget, onReset }) {
  const target = portalTarget || (typeof document !== "undefined" ? document.body : null);
  const [open, setOpen] = useState(null); // { key, side, rect }
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const leftDials = [
    { key: "NEUTRAL_COLORED_MAX", label: "Neutral colored max", min: 0, max: 10, step: 0.5, unit: "%", format: (v) => `${v}%` },
    { key: "NEUTRAL_RATIO_MIN",   label: "Neutral ratio min",   min: 80, max: 100, step: 1, unit: "%", format: (v) => `${v}%` },
    { key: "BW_EXTREME_MIN",      label: "B&W extremes",        min: 80, max: 100, step: 1, unit: "%", format: (v) => `${v}%` },
    { key: "BW_MID_MAX",          label: "B&W mid max",         min: 0,  max: 20,  step: 0.5, unit: "%", format: (v) => `${v}%` },
    { key: "BW_ENTROPY_MAX",      label: "B&W entropy max",     min: 2.0,max: 6.0, step: 0.1, unit: "",  format: (v) => v.toFixed(1) },
  ];

  const rightDials = [
    { key: "DISTINCT_DE",       label: "Distinct ΔE",      min: 8,  max: 40, step: 1, unit: "",  format: (v) => `${v}` },
    { key: "DISTINCT_DHUE",     label: "Distinct ΔHue",    min: 5,  max: 40, step: 1, unit: "°", format: (v) => `${v}°` },
    { key: "SELECTIVE_MAX",     label: "Selective area",    min: 10, max: 60, step: 1, unit: "%", format: (v) => `${v}%` },
    { key: "DOMINANCE_NARROW",  label: "Mono dominance",    min: 50, max: 90, step: 1, unit: "%", format: (v) => `${v}%` },
    { key: "SEPIA_CENTER",      label: "Sepia band (center)", min: 20, max: 40, step: 1, unit: "°", format: (v) => `${v}°` },
  ];

  const all = useMemo(() => ({ left: leftDials, right: rightDials }), []);

  const getValue = (key) => {
    if (key === "SEPIA_CENTER") {
      const min = Number(values?.SEPIA_HUE_MIN ?? 15);
      const max = Number(values?.SEPIA_HUE_MAX ?? 50);
      return Math.round((min + max) / 2);
    }
    return Number(values?.[key] ?? 0);
  };

  const setValue = (key, next) => {
    if (typeof onChange !== "function") return;
    if (key === "SEPIA_CENTER") {
      const half = 17; // fixed half-width
      const min = Math.max(0, Math.round(next - half));
      const max = Math.min(360, Math.round(next + half));
      onChange("SEPIA_HUE_MIN", min);
      onChange("SEPIA_HUE_MAX", max);
      return;
    }
    onChange(key, Number(next));
  };

  useEffect(() => {
    function onResize() {
      if (!open) return;
      const colRef = open.side === "left" ? leftRef.current : rightRef.current;
      const btn = colRef?.querySelector(`[data-dial-key="${open.key}"]`);
      if (btn) setOpen((o) => ({ ...o, rect: btn.getBoundingClientRect() }));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const openDial = (side, key) => {
    const colRef = side === "left" ? leftRef.current : rightRef.current;
    const btn = colRef?.querySelector(`[data-dial-key="${key}"]`);
    if (!btn) return;
    setOpen({ side, key, rect: btn.getBoundingClientRect() });
  };

  const closeDial = () => setOpen(null);

  const Chip = ({ side, d }) => (
    <button
      type="button"
      data-dial-key={d.key}
      onClick={() => openDial(side, d.key)}
      className="px-3 py-1 rounded-full border shadow-sm bg-white hover:shadow transition text-xs flex items-center gap-1"
      title={d.label}
    >
      <span className="opacity-70 whitespace-nowrap">{d.label}</span>
      <span className="font-mono text-[11px] bg-gray-100 px-1 py-0.5 rounded">{d.format(getValue(d.key))}</span>
    </button>
  );

  const Popover = () => {
    if (!open || !target) return null;
    const d = [...leftDials, ...rightDials].find((x) => x.key === open.key);
    if (!d) return null;
    const val = getValue(d.key);
    const style = {
      position: "fixed",
      top: open.rect.bottom + 8,
      left: Math.max(8, Math.min(window.innerWidth - 280, open.rect.left + open.rect.width / 2 - 140)),
      width: 280,
      zIndex: 1000,
    };

    return createPortal(
      <div style={style} className="rounded-2xl border bg-white shadow-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium opacity-70">{d.label}</div>
          <button onClick={closeDial} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
        <div className="flex items-center justify-center py-2">
          <div className="h-40 w-40 flex items-center justify-center relative">
            <input
              type="range"
              min={d.min}
              max={d.max}
              step={d.step}
              value={val}
              onChange={(e) => setValue(d.key, Number(e.target.value))}
              className="absolute w-40 h-6 [transform:rotate(90deg)] [transform-origin:center] accent-indigo-600"
              aria-label={d.label}
            />
          </div>
        </div>
        <div className="text-right text-xs font-mono">{d.format(getValue(d.key))}</div>
      </div>,
      target
    );
  };

  if (!devMode) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 my-4">
      {/* Left chips */}
      <div ref={leftRef} className="hidden md:flex items-center gap-2 absolute left-0">
        {leftDials.map((d) => (<Chip key={d.key} side="left" d={d} />))}
      </div>

      {/* Center control */}
      <div>{center}</div>

      {/* Right chips + Reset */}
      <div ref={rightRef} className="hidden md:flex items-center gap-2 absolute right-0">
        {rightDials.map((d) => (<Chip key={d.key} side="right" d={d} />))}
        <button
          type="button"
          onClick={() => onReset && onReset()}
          className="px-3 py-1 rounded-full border text-xs bg-white hover:shadow"
          title="Reset to defaults"
        >
          Reset
        </button>
      </div>

      {/* Mobile: chips grid + Reset */}
      <div className="md:hidden grid grid-cols-2 gap-2 w-full justify-items-stretch mt-3">
        {[...leftDials, ...rightDials].map((d) => (<Chip key={d.key} side="mobile" d={d} />))}
        <button
          type="button"
          onClick={() => onReset && onReset()}
          className="col-span-2 px-3 py-2 rounded-lg border text-xs bg-white"
        >
          Reset to defaults
        </button>
      </div>

      <Popover />
    </div>
  );
}
