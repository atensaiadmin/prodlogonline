"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { updateConviction } from "@/lib/client-actions";
import type { Idea } from "@/lib/schema";

/* ------------------------------------------------------------------
   Conviction color ramp (rose → amber → emerald → cyan).
   The primary accent is reserved for navigation + primary CTAs; the
   progress bars carry meaning by score instead.
   ------------------------------------------------------------------ */
export function convictionGradient(n: number) {
  if (n <= 3) return "from-rose-500/60 to-rose-500";
  if (n <= 6) return "from-amber-500/60 to-amber-500";
  if (n <= 8) return "from-emerald-500/60 to-emerald-500";
  return "from-cyan-500/60 to-cyan-500";
}

export function convictionLabel(n: number) {
  if (n >= 8) return "Strong";
  if (n >= 6) return "Solid";
  if (n >= 4) return "Curious";
  return "Faint";
}

/* ------------------------------------------------------------------
   ConvictionSlider
   - Drag left/right to set 1–10 (optimistic, commits on release)
   - Scroll (wheel) to nudge ±1
   - Arrow keys to nudge ±1
   Persists via the updateConviction server action.
   ------------------------------------------------------------------ */
export function ConvictionSlider({
  ideaId,
  value,
  onLiveChange,
  showValue = true,
}: {
  ideaId: string;
  value: number;
  onLiveChange?: (n: number) => void;
  showValue?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(value);
  const localRef = useRef(value);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const setValue = useCallback(
    (next: number, commit: boolean) => {
      const clamped = Math.max(1, Math.min(10, Math.round(next)));
      if (clamped === localRef.current) return;
      localRef.current = clamped;
      setLocal(clamped);
      onLiveChange?.(clamped);
      if (commit) {
        updateConviction(ideaId, clamped).catch(() => {});
      }
    },
    [ideaId, onLiveChange]
  );

  // Sync when the server pushes a new value (e.g. after a refresh).
  useEffect(() => {
    if (value !== localRef.current) {
      localRef.current = value;
      setLocal(value);
    }
  }, [value]);

  const valueFromX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return localRef.current;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * 9) + 1;
  }, []);

  // Wheel nudge via a native listener so preventDefault reliably stops page scroll.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setValue(localRef.current + (e.deltaY < 0 ? 1 : -1), true);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setValue]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setValue(valueFromX(e.clientX), false);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setValue(valueFromX(e.clientX), false);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setValue(valueFromX(e.clientX), true);
  }

  const pct = local * 10;

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => {
        // Don't let slider interactions navigate (cards are links).
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        ref={trackRef}
        role="slider"
        aria-label="Conviction"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={local}
        aria-valuetext={`${pct}%`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setValue(localRef.current + 1, true);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setValue(localRef.current - 1, true);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="group/slider relative h-2 flex-1 cursor-ew-resize touch-none select-none rounded-full bg-surface-2"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${convictionGradient(local)} ${
            dragging ? "" : "transition-[width] duration-300"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-md ${
            dragging ? "opacity-100" : "opacity-0 group-hover/slider:opacity-100"
          }`}
          style={{ left: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-9 shrink-0 text-right font-mono text-[0.7rem] font-semibold tabular-nums text-text-secondary">
          {pct}%
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   ConvictionCell — slider + % + label, compact enough for table rows.
   ------------------------------------------------------------------ */
export function ConvictionCell({ idea }: { idea: Idea }) {
  const [v, setV] = useState(idea.conviction);
  return (
    <div className="flex items-center gap-2.5">
      <ConvictionSlider ideaId={idea.id} value={v} onLiveChange={setV} showValue={false} />
      <span className="w-12 shrink-0 text-right text-xs">
        <span className="block font-mono font-semibold tabular-nums text-text-secondary">{v * 10}%</span>
        <span className="block text-[0.68rem] text-text-muted">{convictionLabel(v)}</span>
      </span>
    </div>
  );
}
