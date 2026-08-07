import { useEffect, useRef, useState } from "react";

const DURATION = 450;
const easeOut = t => 1 - Math.pow(1 - t, 3);

/**
 * Animates between successive values. Falls back to the raw value when the
 * user has asked for reduced motion, or on the very first render so the page
 * does not count up from zero on load.
 */
export function useCountUp(value) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef(0);
  const firstRef = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (firstRef.current || reduced) {
      firstRef.current = false;
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    if (from === value) return;

    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / DURATION);
      const current = Math.round(from + (value - from) * easeOut(t));
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return display;
}
