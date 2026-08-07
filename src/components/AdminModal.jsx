import { useEffect, useRef, useState } from "react";
import { Button, Modal, TextField } from "@purpur/library";
import { DEFAULT_CONFIG } from "../lib/config";

const clone = obj => JSON.parse(JSON.stringify(obj));

export function AdminModal({ open, onOpenChange, config, onSave }) {
  const [draft, setDraft] = useState(() => clone(config));
  const [savedFlash, setSavedFlash] = useState(false);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (open) {
      setDraft(clone(configRef.current));
      setSavedFlash(false);
    }
    // Only reset the draft when the modal transitions open; saving (which
    // updates `config` while still open) must not clobber the flash state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateSvc = (si, field, value) => {
    setDraft(d => {
      const next = clone(d);
      next.services[si][field] = value;
      return next;
    });
  };

  const updateLvl = (si, li, field, value) => {
    setDraft(d => {
      const next = clone(d);
      next.services[si].levels[li][field] = value;
      return next;
    });
  };

  const removeSvc = si => setDraft(d => {
    const next = clone(d);
    next.services.splice(si, 1);
    return next;
  });

  const removeLvl = (si, li) => setDraft(d => {
    const next = clone(d);
    next.services[si].levels.splice(li, 1);
    return next;
  });

  const addLvl = si => setDraft(d => {
    const next = clone(d);
    next.services[si].levels.push({ name: "Nytt nivå", price: 99 });
    return next;
  });

  const addSvc = () => setDraft(d => {
    const next = clone(d);
    next.services.push({ id: "svc" + Date.now(), name: "Ny tjeneste", points: 10, levels: [{ name: "Standard", price: 99 }] });
    return next;
  });

  const updatePot = (pi, value) => setDraft(d => {
    const next = clone(d);
    next.pots[pi] = value;
    return next;
  });

  const removePot = pi => setDraft(d => {
    const next = clone(d);
    next.pots.splice(pi, 1);
    return next;
  });

  const addPot = () => setDraft(d => ({ ...clone(d), pots: [...d.pots, 20] }));

  const reset = () => setDraft(clone(DEFAULT_CONFIG));

  const save = () => {
    const cleaned = {
      ...draft,
      pots: draft.pots.filter(p => p > 0).sort((a, b) => a - b),
      services: draft.services.filter(s => s.name.trim() && s.levels.length > 0),
    };
    onSave(cleaned);
    setDraft(clone(cleaned));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const updated = config.lastUpdated
    ? "Sist oppdatert: " + new Date(config.lastUpdated).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })
    : "Ikke lagret ennå (startdata)";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        title="Admin"
        showCloseButton
        closeButtonAriaLabel="Lukk"
        stickyButtons
        actions={
          <div className="app-adminBtns">
            <Button variant="secondary" fullWidth onClick={() => onOpenChange(false)}>Lukk</Button>
            <Button variant="primary" fullWidth onClick={save}>{savedFlash ? "Lagret ✓" : "Lagre endringer"}</Button>
          </div>
        }
      >
        <div className="app-adminUpdated">{updated}</div>

        <div className="app-adminSection">
          <div className="app-stepLabel">Tjenester</div>
          {draft.services.map((s, si) => (
            <div className="app-adminSvc" key={si}>
              <div className="app-adminSvcTop">
                <TextField id={`svc-name-${si}`} label="Navn" value={s.name} onChange={e => updateSvc(si, "name", e.target.value)} />
                <TextField
                  className="app-adminNum"
                  id={`svc-points-${si}`}
                  label="Poeng"
                  type="number"
                  value={s.points}
                  onChange={e => updateSvc(si, "points", Math.max(0, Number(e.target.value) || 0))}
                />
                <Button variant="destructive" onClick={() => removeSvc(si)}>Fjern</Button>
              </div>
              <div className="app-adminRow">
                <TextField
                  id={`svc-logo-${si}`}
                  label="Logo"
                  placeholder="netflix.svg"
                  helperText="Filnavn i /logos, eller full URL. Tomt = bokstavmerke."
                  value={s.logo ?? ""}
                  onChange={e => updateSvc(si, "logo", e.target.value)}
                />
              </div>
              {s.levels.map((l, li) => (
                <div className="app-adminLvl" key={li}>
                  <TextField id={`lvl-name-${si}-${li}`} label="Nivånavn" value={l.name} onChange={e => updateLvl(si, li, "name", e.target.value)} />
                  <TextField
                    className="app-adminNum"
                    id={`lvl-price-${si}-${li}`}
                    label="Kr/md."
                    type="number"
                    value={l.price}
                    onChange={e => updateLvl(si, li, "price", Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Button variant="destructive" iconOnly aria-label="Fjern nivå" onClick={() => removeLvl(si, li)}>×</Button>
                </div>
              ))}
              <Button variant="tertiary-purple" onClick={() => addLvl(si)}>+ Nivå</Button>
            </div>
          ))}
          <Button variant="tertiary-purple" onClick={addSvc}>+ Legg til tjeneste</Button>
        </div>

        <div className="app-adminSection">
          <div className="app-stepLabel">Poeng og priser</div>
          <div className="app-adminRow">
            <TextField
              id="extra-price"
              label="Pris per 10 ekstra poeng (kr)"
              type="number"
              value={draft.extraPricePer10}
              onChange={e => setDraft(d => ({ ...d, extraPricePer10: Math.max(0, Number(e.target.value) || 0) }))}
            />
          </div>
          <div className="app-adminRow">
            <TextField
              id="mobile-bonus-input"
              label="Mobilbonus (poeng)"
              type="number"
              value={draft.mobileBonus}
              onChange={e => setDraft(d => ({ ...d, mobileBonus: Math.max(0, Number(e.target.value) || 0) }))}
            />
          </div>
          <div className="app-stepLabel">Valgbare poengpakker</div>
          {draft.pots.map((p, pi) => (
            <div className="app-adminRow" key={pi}>
              <TextField
                className="app-adminNum"
                id={`pot-${pi}`}
                label="Poeng"
                type="number"
                value={p}
                onChange={e => updatePot(pi, Math.max(0, Number(e.target.value) || 0))}
              />
              <Button variant="destructive" iconOnly aria-label="Fjern pakke" onClick={() => removePot(pi)}>×</Button>
            </div>
          ))}
          <Button variant="tertiary-purple" onClick={addPot}>+ Pakke</Button>
        </div>

        <div className="app-adminSection">
          <div className="app-stepLabel">PIN-kode</div>
          <TextField id="pin-config" label="PIN" value={draft.pin} onChange={e => setDraft(d => ({ ...d, pin: e.target.value }))} />
        </div>

        <div className="app-adminSection">
          <Button variant="destructive" onClick={reset}>Tilbakestill til startdata</Button>
        </div>
      </Modal.Content>
    </Modal>
  );
}
