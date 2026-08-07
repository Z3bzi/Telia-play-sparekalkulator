import { useState } from "react";
import { Checkbox, Heading, Select } from "@purpur/library";
import { kr } from "../lib/config";
import { brandColor, logoSrc, monogram } from "../lib/brand";

function ServiceMark({ service }) {
  const src = logoSrc(service);
  // A configured logo that fails to load must not leave a blank square, so fall
  // back to the monogram the same way an unconfigured service does. The failure
  // is remembered per-src, so correcting the path in admin retries immediately.
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return (
      <span className="app-svcLogo app-svcLogoImg">
        <img src={src} alt="" onError={() => setFailedSrc(src)} />
      </span>
    );
  }

  return (
    <span className="app-svcLogo" style={{ background: brandColor(service) }} aria-hidden="true">
      {monogram(service.name)}
    </span>
  );
}

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
          // Tiers can cost different point amounts, so the collapsed badge
          // shows the span; once a tier is chosen it shows that tier's cost.
          const allPts = s.levels.map(l => l.points);
          const minPts = Math.min(...allPts), maxPts = Math.max(...allPts);
          const ptsLabel = on ? `${level.points} p`
            : minPts === maxPts ? `${minPts} p` : `${minPts}–${maxPts} p`;

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
                <ServiceMark service={s} />
                <span className="app-svcText">
                  <span className="app-svcName">{s.name}</span>
                  <span className="app-svcMeta">
                    {showFrom ? "fra " : ""}{kr(on ? level.price : cheapest.price)} kr/md.
                  </span>
                </span>
                <span className="app-svcPts">{ptsLabel}</span>
              </div>
              {on && s.levels.length > 1 && (
                <div className="app-svcDetail" onClick={e => e.stopPropagation()}>
                  <Select
                    id={`lvl-${s.id}`}
                    aria-label={`Nivå for ${s.name}`}
                    options={s.levels.map((l, i) => ({
                      label: `${l.name} — ${kr(l.price)} kr/md. · ${l.points} p`,
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
