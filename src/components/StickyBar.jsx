import { useEffect, useState } from "react";
import { kr } from "../lib/config";

/**
 * Keeps the payoff figure visible while the user is still ticking services.
 * Shows only once the real result card has scrolled out of view.
 */
export function StickyBar({ savingMonth, targetRef, suppressed = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-8px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetRef]);

  // While a modal is open the bar would sit over the dialog's own buttons, and
  // it refers to page content the user isn't looking at anyway.
  const shown = visible && !suppressed;

  return (
    <div className={`app-stickyBar${shown ? " app-stickyOn" : ""}`} aria-hidden={!shown}>
      <span className="app-stickyLabel">{savingMonth < 0 ? "Du betaler mer" : "Du sparer"}</span>
      <span className="app-stickyValue">{kr(Math.abs(savingMonth))} kr/md.</span>
    </div>
  );
}
