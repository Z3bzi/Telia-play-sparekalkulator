import { Checkbox, Heading, Select } from "@purpur/library";
import { kr } from "../lib/config";
import { brandColor, monogram } from "../lib/brand";

export function ServicesCard({ services, selections, onToggle, onLevelChange }) {
  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">Hva betaler du for i dag?</Heading>
      <div className="app-svcList">
        {services.map(s => {
          const on = selections[s.id] !== undefined;
          const lvlIdx = on ? selections[s.id] : 0;
          const level = s.levels[lvlIdx] ?? s.levels[0];
          // Collapsed rows show the cheapest tier so the row still carries a
          // price before the user commits to expanding it.
          const cheapest = s.levels.reduce((a, b) => (b.price < a.price ? b : a), s.levels[0]);
          const showFrom = !on && s.levels.length > 1;

          return (
            <div
              key={s.id}
              className={`app-svcRow${on ? " app-svcOn" : ""}`}
              onClick={() => onToggle(s.id)}
            >
              <div className="app-svcMain">
                {/* The checkbox and its label already toggle themselves; stop the
                    click here so the row handler doesn't undo it. */}
                <span className="app-svcCheck" onClick={e => e.stopPropagation()}>
                  <Checkbox
                    id={`svc-${s.id}`}
                    checked={on}
                    onChange={() => onToggle(s.id)}
                    aria-label={s.name}
                  />
                </span>
                <span className="app-svcLogo" style={{ background: brandColor(s) }} aria-hidden="true">
                  {monogram(s.name)}
                </span>
                <span className="app-svcText">
                  <span className="app-svcName">{s.name}</span>
                  <span className="app-svcMeta">
                    {showFrom ? "fra " : ""}{kr(on ? level.price : cheapest.price)} kr/md.
                  </span>
                </span>
                <span className="app-svcPts">{s.points} p</span>
              </div>
              {on && s.levels.length > 1 && (
                <div className="app-svcDetail" onClick={e => e.stopPropagation()}>
                  <Select
                    id={`lvl-${s.id}`}
                    aria-label={`Nivå for ${s.name}`}
                    options={s.levels.map((l, i) => ({
                      label: `${l.name} — ${kr(l.price)} kr/md.`,
                      value: String(i),
                    }))}
                    value={String(lvlIdx)}
                    onChange={e => onLevelChange(s.id, Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
