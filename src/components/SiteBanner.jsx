import { useEffect, useRef, useState } from "react";

/**
 * The site's own chrome, above everything a single tool renders.
 *
 * TStools owns this strip; the tool owns the page under it. Keeping the two
 * levels apart is the whole point: the Telia-branded header below belongs to
 * kalkulatoren, not to nettstedet, and bunntekstens forbehold reads as honest
 * only when the site itself never wears Telias merke.
 */

// Every tool the site serves. A single entry means there is nothing to switch
// between, so the switcher below stays hidden until this list grows — a menu
// whose only choice is the page you are already on is noise.
const TOOLS = [
  { id: "sparekalkulator", name: "Sparekalkulator", note: "Strømmetjenester", href: "/" },
];

const CURRENT = "sparekalkulator";

function GridIcon() {
  return (
    <svg className="site-grid" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true" focusable="false">
      {[0, 4, 8].map(y => [0, 4, 8].map(x => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.6" fill="currentColor" />
      )))}
    </svg>
  );
}

export function SiteBanner() {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef(null);

  // An open menu closes on Escape or on a press anywhere outside it. Both
  // listeners only exist while it is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = event => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = event => {
      if (!switcherRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="site-bar">
      <div className="site-barRow">
        {/* One text node, so it is read as the single word it is. */}
        <span className="site-mark">TS<span className="site-markTail">tools</span></span>

        {TOOLS.length > 1 && (
          <div className="site-switch" ref={switcherRef}>
            <button
              type="button"
              className="site-switchBtn"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen(o => !o)}
            >
              Verktøy
              <GridIcon />
            </button>
            {open && (
              <ul className="site-menu" role="menu">
                {TOOLS.map(tool => (
                  <li key={tool.id} role="none">
                    <a
                      role="menuitem"
                      className="site-menuItem"
                      href={tool.href}
                      aria-current={tool.id === CURRENT ? "page" : undefined}
                    >
                      <span className="site-menuName">{tool.name}</span>
                      <span className="site-menuNote">{tool.note}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
