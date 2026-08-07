import { Checkbox, Select } from "@purpur/library";
import { kr } from "../lib/config";

export function ServicesCard({ services, selections, onToggle, onLevelChange }) {
  return (
    <section className="app-card">
      <div className="app-stepLabel">Hva betaler du for i dag?</div>
      <div className="app-svcList">
        {services.map(s => {
          const on = selections[s.id] !== undefined;
          const lvlIdx = on ? selections[s.id] : 0;
          return (
            <div key={s.id} className={`app-svcRow${on ? " app-svcOn" : ""}`}>
              <div className="app-svcMain">
                <Checkbox
                  id={`svc-${s.id}`}
                  checked={on}
                  onChange={() => onToggle(s.id)}
                  label={s.name}
                />
                <span className="app-svcPts">{s.points} p</span>
              </div>
              {on && (
                <div className="app-svcDetail">
                  {s.levels.length > 1 ? (
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
                  ) : (
                    <div className="app-lvlSingle">{s.levels[0].name} — {kr(s.levels[0].price)} kr/md.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
