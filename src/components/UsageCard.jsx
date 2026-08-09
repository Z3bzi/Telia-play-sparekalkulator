import { Heading } from "@purpur/library";
import { kr } from "../lib/config";

// A 0-point service has infinite value per point (it costs nothing from the
// package) — meaningful for the packing order, meaningless on screen.
const pointsRate = x => Number.isFinite(x.valuePerPoint)
  ? `${x.points} p · ${x.valuePerPoint.toFixed(1)} kr/poeng`
  : `${x.points} p`;

const ALT_LABELS = {
  buy: "Kjøp ekstra poeng",
  fit: "Bare det som får plass",
};

function AltCard({ mode, calc, altMode, onAltModeChange }) {
  const c = calc;
  const data = mode === "buy" ? c.buy : c.fit;
  const selected = altMode === mode;
  const isBest = c.recommended === mode;

  const body = mode === "buy"
    ? `+${data.extraPoints} poeng for ${kr(data.extraCost)} kr/md. Alle ${c.chosen.length} tjenester dekkes.`
    : `${data.covered.length} av ${c.chosen.length} tjenester — kombinasjonen med mest kroneverdi per poeng.`;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`app-altCard${selected ? " app-altOn" : ""}`}
      onClick={() => onAltModeChange(mode)}
    >
      <span className="app-altHead">
        <span className="app-altTitle">{ALT_LABELS[mode]}</span>
        {isBest && <span className="app-altBadge">Best</span>}
      </span>
      <span className="app-altBody">{body}</span>
      <span className="app-altSum">Sparer {kr(data.savingMonth)} kr/md.</span>
    </button>
  );
}

export function UsageCard({ calc, altMode, onAltModeChange }) {
  const c = calc;
  const a = c.active;
  // The bar can exceed the pot, so scale against whichever is larger and draw a
  // marker where the pot limit actually sits.
  const scaleMax = Math.max(c.available, c.totalPoints) || 1;
  const usedPct = Math.min(100, (c.totalPoints / scaleMax) * 100);
  const limitPct = (c.available / scaleMax) * 100;

  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">Poengbruk</Heading>

      <div className="app-barTrack">
        <div className={`app-barFill${c.over ? " app-barOver" : ""}`} style={{ width: `${usedPct}%` }} />
        {c.over && (
          <div className="app-barLimit" style={{ left: `${limitPct}%` }} aria-hidden="true" />
        )}
      </div>
      <div className="app-barText">
        {c.totalPoints} av {c.available} poeng
        {c.over && <span className="app-barWarn"> — {c.totalPoints - c.available} poeng over</span>}
      </div>

      {c.over && c.fit && (
        <div className="app-altWrap">
          <div className="app-altHint">Tjenestene bruker mer enn pakken. Velg løsning:</div>
          <div className="app-altGrid" role="radiogroup" aria-label="Velg løsning for poeng over pakke">
            <AltCard mode="buy" calc={c} altMode={altMode} onAltModeChange={onAltModeChange} />
            <AltCard mode="fit" calc={c} altMode={altMode} onAltModeChange={onAltModeChange} />
          </div>
        </div>
      )}

      <div className="app-coverList">
        {c.chosen.length > 0 && <div className="app-coverHead">Dekkes av poeng:</div>}
        {a.covered.map(x => (
          <div className="app-coverRow" key={x.id}>
            <span className="app-coverName">
              {x.name} · {x.levelName}
              <span className="app-coverRate">{pointsRate(x)}</span>
            </span>
            <span className="app-coverVal">{kr(x.price)} kr/md.</span>
          </div>
        ))}
        {c.chosen.length > 0 && a.covered.length === 0 && (
          <div className="app-coverRow">Ingen av tjenestene får plass i pakken.</div>
        )}
        {c.over && altMode === "fit" && c.fit.dropped.length > 0 && (
          <>
            <div className="app-coverHead">Utenfor pakken (beholdes som i dag):</div>
            {c.fit.dropped.map(x => (
              <div className="app-coverRow app-coverDrop" key={x.id}>
                <span className="app-coverName">
                  {x.name} · {x.levelName}
                  <span className="app-coverRate">{pointsRate(x)}</span>
                </span>
                <span>{kr(x.price)} kr/md.</span>
              </div>
            ))}
          </>
        )}
        {a.extraCost > 0 && (
          <div className="app-coverRow app-coverExtra">
            <span>Ekstra poeng ({a.extraPoints} p)</span>
            <span>−{kr(a.extraCost)} kr/md.</span>
          </div>
        )}
        {c.premium.length > 0 && (
          <>
            <div className="app-coverHead">Kan ikke kjøpes for poeng:</div>
            {c.premium.map(x => (
              <div className="app-coverRow app-coverDrop" key={x.id}>
                <span className="app-coverName">
                  {x.name} · {x.levelName}
                  <span className="app-coverRate">samme pris med og uten poeng</span>
                </span>
                <span>{kr(x.price)} kr/md.</span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
