// Selections live in the URL hash so a result can be linked or shared. The hash
// is used rather than the query string to keep it inert for static hosting.

export function encodeState({ pot, hasMobile, ownPrice, selections, addons, altChoice }) {
  const params = new URLSearchParams();
  params.set("p", String(pot));
  if (hasMobile) params.set("m", "1");
  // Null means "ikke oppgitt", which is not the same as 0 kr — only a price the
  // user actually typed goes in the link.
  if (ownPrice !== null && ownPrice !== undefined) params.set("c", String(ownPrice));
  const picked = Object.entries(selections).map(([id, lvl]) => `${id}:${lvl}`);
  if (picked.length) params.set("s", picked.join(","));
  const extras = Object.entries(addons ?? {})
    .flatMap(([id, list]) => list.map(a => `${id}:${a}`));
  if (extras.length) params.set("x", extras.join(","));
  // Only an explicit choice is encoded. Omitting it means "follow the
  // recommendation", so a link never freezes a default that later stops being
  // the better option.
  if (altChoice) params.set("a", altChoice);
  return params.toString();
}

export function decodeState(hash, config) {
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return null;

  let params;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return null;
  }

  const state = {};

  const pot = Number(params.get("p"));
  if (Number.isFinite(pot) && config.pots.some(p => p.points === pot)) state.pot = pot;

  state.hasMobile = params.get("m") === "1";

  const own = Number(params.get("c"));
  state.ownPrice = params.has("c") && Number.isFinite(own) && own >= 0 ? own : null;

  const selections = {};
  for (const entry of (params.get("s") || "").split(",")) {
    if (!entry) continue;
    const [id, lvlRaw] = entry.split(":");
    const service = config.services.find(s => s.id === id);
    if (!service) continue;
    const lvl = Number(lvlRaw);
    // Clamp rather than drop, so a stale link still resolves to something valid.
    if (!Number.isFinite(lvl)) continue;
    selections[id] = Math.min(Math.max(0, lvl), service.levels.length - 1);
  }
  state.selections = selections;

  // Tillegg only mean anything alongside the service they hang off, so an entry
  // for an unselected — or since-removed — service is dropped rather than kept.
  const addons = {};
  for (const entry of (params.get("x") || "").split(",")) {
    if (!entry) continue;
    const [id, addonId] = entry.split(":");
    if (selections[id] === undefined) continue;
    const service = config.services.find(s => s.id === id);
    if (!service?.addons?.some(a => a.id === addonId)) continue;
    (addons[id] ??= []).push(addonId);
  }
  state.addons = addons;

  const alt = params.get("a");
  if (alt === "fit" || alt === "buy") state.altMode = alt;

  return state;
}
