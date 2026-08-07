import { useEffect, useState } from "react";
import { kr } from "../lib/config";

/**
 * Keeps the payoff figure visible while the user is still ticking services.
 * Shows only once the real result card has scrolled out of view.
 */
export function StickyBar({ savingMonth, targetRef }) {
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

  return (
    <div className={`app-stickyBar${visible ? " app-stickyOn" : ""}`} aria-hidden={!visible}>
      <span className="app-stickyLabel">Du sparer</span>
      <span className="app-stickyValue">{kr(savingMonth)} kr/md.</span>
    </div>
  );
}
