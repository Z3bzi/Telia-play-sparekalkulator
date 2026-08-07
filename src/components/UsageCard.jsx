import { RadioCardGroup } from "@purpur/library";
import { kr } from "../lib/config";

export function UsageCard({ calc, pot, hasMobile, mobileBonus, altMode, onAltModeChange }) {
  const c = calc;
  const a = c.active;
  const pct = c.available > 0 ? Math.min(100, (c.totalPoints / c.available) * 100) : 0;

  const altItems = c.over && c.fit ? [
    {
      id: "alt-buy",
      value: "buy",
      title: "Kjøp ekstra poeng",
      body: `+${c.buy.extraPoints} poeng for ${kr(c.buy.extraCost)} kr/md. Alle ${c.chosen.length} tjenester dekkes. Sparer ${kr(c.buy.savingMonth)} kr/md.`,
    },
    {
      id: "alt-fit",
      value: "fit",
      title: "Bare det som får plass",
      body: `${c.fit.covered.length} av ${c.chosen.length} tjenester — kombinasjonen med mest kroneverdi per poeng. Sparer ${kr(c.fit.savingMonth)} kr/md.`,
    },
  ] : [];

  return (
    <section className="app-card">
      <div className="app-stepLabel">Poengbruk</div>
      <div className="app-barTrack">
        <div className={`app-barFill${c.over ? " app-barOver" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="app-barText">
        {c.totalPoints} av {c.available} poeng
        {c.over && <span className="app-barWarn"> — {c.totalPoints - c.available} poeng over</span>}
      </div>

      {c.over && c.fit && (
        <div className="app-altWrap">
          <div className="app-altHint">Tjenestene bruker mer enn potten. Velg løsning:</div>
          <RadioCardGroup
            id="alt-group"
            aria-label="Velg løsning for poeng over pott"
            orientation="horizontal"
            items={altItems}
            value={altMode}
            onValueChange={onAltModeChange}
          />
        </div>
      )}

      <div className="app-coverList">
        <div className="app-coverHead">Dekkes av poeng:</div>
        {a.covered.map(x => (
          <div className="app-coverRow" key={x.id}>
            <span>{x.name} · {x.levelName}</span>
            <span className="app-coverVal">{kr(x.price)} kr/md.</span>
          </div>
        ))}
        {a.covered.length === 0 && (
          <div className="app-coverRow">Ingen av tjenestene får plass i potten.</div>
        )}
        {c.over && altMode === "fit" && c.fit.dropped.length > 0 && (
          <>
            <div className="app-coverHead">Utenfor potten (beholdes som i dag):</div>
            {c.fit.dropped.map(x => (
              <div className="app-coverRow app-coverDrop" key={x.id}>
                <span>{x.name} · {x.levelName}</span>
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
      </div>
    </section>
  );
}
