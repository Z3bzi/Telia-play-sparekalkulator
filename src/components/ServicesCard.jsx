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

// A kroner-only tier has no poengpris to show, in the badge or in the select.
const levelPoints = l => (l.points === null ? "kun kr" : `${l.points} p`);

export function ServicesCard({ services, selections, addons, bundle, onToggle, onLevelChange, onAddonToggle }) {
  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">Hva betaler du for i dag?</Heading>
      <div className="app-svcList">
        {services.map(s => {
          const on = selections[s.id] !== undefined;
          // A tjeneste can be carried by another tier the user has picked, or be
          // waiting on one it is only sold alongside. Either way the row has to
          // say so — the price and the poengbadge alone would be a lie.
          const host = bundle.includedBy.get(s.id);
          const missing = host ? null : bundle.missingRequirement(s.id);
          const lvlIdx = on ? selections[s.id] : 0;
          const level = s.levels[lvlIdx] ?? s.levels[0];
          // Collapsed rows show the cheapest tier so the row still carries a
          // price before the user commits to expanding it.
          const cheapest = s.levels.reduce((a, b) => (b.price < a.price ? b : a), s.levels[0]);
          const showFrom = !on && s.levels.length > 1;
          // Tiers can cost different point amounts, so the collapsed badge
          // shows the span; once a tier is chosen it shows that tier's cost.
          // Kroner-only tiers hold no poeng and are left out of the span.
          const allPts = s.levels.map(l => l.points).filter(p => p !== null);
          const minPts = Math.min(...allPts), maxPts = Math.max(...allPts);
          // Whatever the tier costs in poeng, an included tjeneste costs the
          // pakken nothing extra — the host already paid for it.
          const ptsLabel = host ? "inkludert"
            : on ? levelPoints(level)
            : !allPts.length ? "kun kr"
            : minPts === maxPts ? `${minPts} p` : `${minPts}–${maxPts} p`;
          const picked = addons[s.id] ?? [];

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
                    {host
                      ? `Følger med ${host.name} · ${host.levelName}`
                      : `${showFrom ? "fra " : ""}${kr(on ? level.price : cheapest.price)} kr/md.`}
                    {missing && <span className="app-svcNeed"> · bare med {missing.name}</span>}
                  </span>
                </span>
                <span className="app-svcPts">{ptsLabel}</span>
              </div>
              {on && missing && (
                <div className="app-svcNote">
                  {s.name} selges bare sammen med {missing.name}. Kryss av {missing.name} for å
                  dekke den med poeng — uten den blir den stående som en ren kroneutgift.
                </div>
              )}
              {on && host && (
                <div className="app-svcNote">
                  Ligger allerede i {host.name} {host.levelName}, så den er med i regnestykket
                  uten å koste noe ekstra.
                </div>
              )}
              {on && !host && (s.levels.length > 1 || (s.addons ?? []).length > 0) && (
                <div className="app-svcDetail" onClick={e => e.stopPropagation()}>
                  {s.levels.length > 1 && (
                    <Select
                      id={`lvl-${s.id}`}
                      aria-label={`Nivå for ${s.name}`}
                      options={s.levels.map((l, i) => ({
                        label: `${l.name} — ${kr(l.price)} kr/md. · ${levelPoints(l)}`,
                        value: String(i),
                      }))}
                      value={String(lvlIdx)}
                      onChange={e => onLevelChange(s.id, Number(e.target.value))}
                    />
                  )}
                  {(s.addons ?? []).map(a => (
                    <span className="app-svcAddon" key={a.id}>
                      <Checkbox
                        id={`addon-${s.id}-${a.id}`}
                        checked={picked.includes(a.id)}
                        onChange={() => onAddonToggle(s.id, a.id)}
                        label={<>+ {a.name}<span className="app-svcAddonMeta">{kr(a.price)} kr/md. · {a.points} p</span></>}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
