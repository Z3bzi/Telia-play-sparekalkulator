import { useRef } from "react";
import { kr } from "../lib/config";

/**
 * Purpur's RadioCardGroup ignores `orientation="horizontal"` below a 600px
 * container and stacks full-width cards, which cost ~330px of vertical space
 * for a three-way numeric choice. This is a compact segmented control with the
 * same semantics: a radiogroup with roving tabindex and arrow-key navigation.
 */
export function PotSelector({ pots, pot, onPotChange, showPrices }) {
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
        const withPrice = showPrices && p.price > 0;
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
            aria-label={`${p.name}, ${p.points} poeng${withPrice ? `, fra ${kr(p.price)} kroner per måned` : ""}`}
          >
            <span className="app-segName">{p.name}</span>
            <span className="app-segNum">{p.points}</span>
            <span className="app-segUnit">poeng</span>
            {withPrice && <span className="app-segPrice">fra {kr(p.price)},–/md.</span>}
          </button>
        );
      })}
    </div>
  );
}
