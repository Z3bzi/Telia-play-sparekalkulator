import { useRef } from "react";
import { kr } from "../lib/config";

/**
 * Purpur's RadioCardGroup ignores `orientation="horizontal"` below a 600px
 * container and stacks full-width cards, which cost ~330px of vertical space
 * for a three-way numeric choice. This is a compact segmented control with the
 * same semantics: a radiogroup with roving tabindex and arrow-key navigation.
 */
export function PotSelector({ pots, pot, onPotChange, showPrices, ownPrice }) {
  const refs = useRef([]);

  const move = (from, delta) => {
    if (!pots.length) return;
    const next = (from + delta + pots.length) % pots.length;
    onPotChange(pots[next].points);
    refs.current[next]?.focus();
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
        onPotChange(pots[0].points);
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        onPotChange(pots[pots.length - 1].points);
        refs.current[pots.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  const activeIndex = Math.max(0, pots.findIndex(p => p.points === pot));

  return (
    <div className="app-segmented" role="radiogroup" aria-label="Velg poengpakke">
      {pots.map((p, i) => {
        const selected = p.points === pot;
        // A price the user typed beats listeprisen on the pakken they hold —
        // it is the only figure we know is right for them. "Fra" is dropped
        // with it, since theirs is an exact amount rather than a startpris.
        const own = selected && ownPrice !== null && ownPrice !== undefined;
        const price = own ? ownPrice : (showPrices && p.price > 0 ? p.price : null);
        return (
          <button
            key={p.points}
            ref={el => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={i === activeIndex ? 0 : -1}
            className={`app-seg${selected ? " app-segOn" : ""}`}
            onClick={() => onPotChange(p.points)}
            onKeyDown={e => handleKeyDown(e, i)}
            aria-label={`${p.name ? `${p.name}, ` : ""}${p.points} poeng${price === null ? "" : `, ${own ? "" : "fra "}${kr(price)} kroner per måned`}`}
          >
            {p.name && <span className="app-segName">{p.name}</span>}
            <span className="app-segNum">{p.points}</span>
            <span className="app-segUnit">poeng</span>
            {price !== null && <span className="app-segPrice">{own ? "" : "fra "}{kr(price)},–/md.</span>}
          </button>
        );
      })}
    </div>
  );
}
