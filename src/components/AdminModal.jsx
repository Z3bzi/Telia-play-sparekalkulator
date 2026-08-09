import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Modal, TextField } from "@purpur/library";
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
    next.services[si].levels.push({ name: "Nytt nivå", price: 99, points: 10 });
    return next;
  });

  const addSvc = () => setDraft(d => {
    const next = clone(d);
    next.services.push({ id: "svc" + Date.now(), name: "Ny tjeneste", levels: [{ name: "Standard", price: 99, points: 10 }], addons: [] });
    return next;
  });

  const updateAddon = (si, ai, field, value) => setDraft(d => {
    const next = clone(d);
    next.services[si].addons[ai][field] = value;
    return next;
  });

  const removeAddon = (si, ai) => setDraft(d => {
    const next = clone(d);
    next.services[si].addons.splice(ai, 1);
    return next;
  });

  const addAddon = si => setDraft(d => {
    const next = clone(d);
    // The id lives in shared links, so it has to stay stable once handed out.
    (next.services[si].addons ??= []).push({ id: "add" + Date.now(), name: "Nytt tillegg", price: 50, points: 10 });
    return next;
  });

  const updatePot = (pi, field, value) => setDraft(d => {
    const next = clone(d);
    next.pots[pi][field] = value;
    return next;
  });

  const removePot = pi => setDraft(d => {
    const next = clone(d);
    next.pots.splice(pi, 1);
    return next;
  });

  const addPot = () => setDraft(d => ({ ...clone(d), pots: [...clone(d.pots), { name: "Ny pakke", points: 20, price: 0 }] }));

  const reset = () => setDraft(clone(DEFAULT_CONFIG));

  const save = () => {
    // Deduplicate by point count: PotSelector keys and matches selection by it,
    // so two packages of the same size would collide. First one entered wins.
    const seen = new Set();
    const pots = [];
    for (const p of draft.pots) {
      if (p.points <= 0 || seen.has(p.points)) continue;
      seen.add(p.points);
      pots.push({ ...p, name: String(p.name ?? "").trim() || `${p.points} poeng` });
    }
    pots.sort((a, b) => a.points - b.points);
    const cleaned = {
      ...draft,
      // An empty PIN would let an empty input through the gate, and zero
      // packages would leave the calculator computing against one that no
      // longer exists — keep the previous values rather than persist either.
      pin: draft.pin.trim() || config.pin,
      pots: pots.length ? pots : config.pots,
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
                  <TextField
                    className="app-adminNum"
                    id={`lvl-points-${si}-${li}`}
                    label="Poeng"
                    type="number"
                    value={l.points ?? ""}
                    onChange={e => updateLvl(si, li, "points", Math.max(0, Number(e.target.value) || 0))}
                  />
                  {/* Some tiers are sold in kroner only. Clearing the poengfelt
                      this way is what keeps them out of the poengbudsjettet. */}
                  <Checkbox
                    id={`lvl-kr-${si}-${li}`}
                    checked={l.points === null}
                    onChange={value => updateLvl(si, li, "points", value === true ? null : 0)}
                    label="Kun kr"
                  />
                  {/* Purpur's iconOnly buttons expect an icon child and render
                      nothing for text, so these are ordinary labelled buttons. */}
                  <Button variant="destructive" size="sm" onClick={() => removeLvl(si, li)}>Fjern nivå</Button>
                </div>
              ))}
              <Button variant="tertiary-purple" onClick={() => addLvl(si)}>+ Nivå</Button>

              {(s.addons ?? []).map((a, ai) => (
                <div className="app-adminLvl" key={a.id}>
                  <TextField id={`addon-name-${si}-${ai}`} label="Tillegg" value={a.name} onChange={e => updateAddon(si, ai, "name", e.target.value)} />
                  <TextField
                    className="app-adminNum"
                    id={`addon-price-${si}-${ai}`}
                    label="Kr/md."
                    type="number"
                    value={a.price}
                    onChange={e => updateAddon(si, ai, "price", Math.max(0, Number(e.target.value) || 0))}
                  />
                  <TextField
                    className="app-adminNum"
                    id={`addon-points-${si}-${ai}`}
                    label="Poeng"
                    type="number"
                    value={a.points}
                    onChange={e => updateAddon(si, ai, "points", Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeAddon(si, ai)}>Fjern tillegg</Button>
                </div>
              ))}
              <Button variant="tertiary-purple" onClick={() => addAddon(si)}>+ Tillegg</Button>
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
            <div className="app-adminRow app-adminPot" key={pi}>
              <TextField
                id={`pot-name-${pi}`}
                label="Navn"
                value={p.name}
                onChange={e => updatePot(pi, "name", e.target.value)}
              />
              <TextField
                className="app-adminNum"
                id={`pot-${pi}`}
                label="Poeng"
                type="number"
                value={p.points}
                onChange={e => updatePot(pi, "points", Math.max(0, Number(e.target.value) || 0))}
              />
              <TextField
                className="app-adminNum"
                id={`pot-price-${pi}`}
                label="Kr/md."
                type="number"
                value={p.price}
                onChange={e => updatePot(pi, "price", Math.max(0, Number(e.target.value) || 0))}
              />
              <Button variant="destructive" size="sm" onClick={() => removePot(pi)}>Fjern pakke</Button>
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
