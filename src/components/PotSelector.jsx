import { useRef } from "react";
import { kr } from "../lib/config";

/**
 * Purpur's RadioCardGroup ignores `orientation="horizontal"` below a 600px
 * container and stacks full-width cards, which cost ~330px of vertical space
 * for a three-way numeric choice. This is a compact segmented control with the
 * same semantics: a radiogroup with roving tabindex and arrow-key navigation.
 *
 * A pakke may carry a `priceLabel` (what the fellesavtalen charges for it),
 * `disabled` (the avtalen does not offer it at the chosen hastighet) and
 * `best` (the pakke that leaves the most igjen etter at den er betalt for).
 */
export function PotSelector({ pots, pot, onPotChange, showPrices }) {
  const refs = useRef([]);

  const pickable = pots.filter(p => !p.disabled);

  const move = (from, delta) => {
    if (!pickable.length) return;
    // Step over pakker the avtalen doesn't offer rather than landing on one.
    for (let step = 1; step <= pots.length; step++) {
      const next = (from + delta * step + pots.length * step) % pots.length;
      if (pots[next].disabled) continue;
      onPotChange(pots[next].points);
      refs.current[next]?.focus();
      return;
    }
  };

  const jump = index => {
    onPotChange(pots[index].points);
    refs.current[index]?.focus();
  };

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        jump(pots.indexOf(pickable[0]));
        break;
      case "End":
        e.preventDefault();
        jump(pots.indexOf(pickable[pickable.length - 1]));
        break;
      default:
        break;
    }
  };

  const selectedIndex = pots.findIndex(p => p.points === pot);
  // Something has to be tabbable even when the selection sits on a pakke the
  // avtalen no longer offers, so fall back to the first one that is pickable.
  const activeIndex = selectedIndex >= 0 && !pots[selectedIndex].disabled
    ? selectedIndex
    : Math.max(0, pots.indexOf(pickable[0]));

  return (
    <div className="app-segmented" role="radiogroup" aria-label="Velg poengpakke">
      {pots.map((p, i) => {
        const selected = p.points === pot;
        // A pakke from the fellesavtalen brings its own label; a løs pakke from
        // admin only has a price, and only sometimes.
        const priceLabel = p.priceLabel ?? (p.price > 0 ? `fra ${kr(p.price)},–/md.` : null);
        const withPrice = showPrices && priceLabel;
        return (
          <button
            key={p.points}
            ref={el => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={p.disabled || undefined}
            tabIndex={i === activeIndex ? 0 : -1}
            className={[
              "app-seg",
              selected && "app-segOn",
              p.disabled && "app-segOff",
              p.best && !selected && "app-segBest",
            ].filter(Boolean).join(" ")}
            onClick={() => { if (!p.disabled) onPotChange(p.points); }}
            onKeyDown={e => handleKeyDown(e, i)}
            aria-label={[
              p.name,
              `${p.points} poeng`,
              p.disabled ? "ikke tilgjengelig" : withPrice ? priceLabel : null,
              p.best ? "gir mest igjen" : null,
            ].filter(Boolean).join(", ")}
          >
            {p.name && <span className="app-segName">{p.name}</span>}
            <span className="app-segNum">{p.points}</span>
            <span className="app-segUnit">poeng</span>
            {p.disabled
              ? <span className="app-segPrice">–</span>
              : withPrice && <span className="app-segPrice">{priceLabel}</span>}
            {p.best && <span className="app-segFlag" aria-hidden="true">Mest igjen</span>}
          </button>
        );
      })}
    </div>
  );
}
