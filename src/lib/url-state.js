import { listFamilies, listSpeeds } from "./plans";

// Selections live in the URL hash so a result can be linked or shared. The hash
// is used rather than the query string to keep it inert for static hosting.

export function encodeState({ pot, hasMobile, selections, addons, altChoice, view, plan, sduPrice }) {
  const params = new URLSearchParams();
  params.set("p", String(pot));
  // The calculator is the default view, so only the other one is written down.
  if (view && view !== "calc") params.set("v", view);
  if (plan) {
    params.set("f", plan.family);
    params.set("sp", String(plan.speed));
  } else if (sduPrice) {
    // Only means something in kalkulator-modus — a fellesavtale prices itself.
    params.set("pp", String(sduPrice));
  }
  if (hasMobile) params.set("m", "1");
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

  if (params.get("v") === "plans") state.view = "plans";

  // A fellesavtale is only worth restoring when both halves of it survive: the
  // avtalen has to still be in prisarket, and it has to still offer that speed.
  const family = params.get("f");
  const speed = Number(params.get("sp"));
  if (family && listFamilies().includes(family) && listSpeeds(family).includes(speed)) {
    state.plan = { family, speed };
  } else {
    const ppRaw = params.get("pp");
    const pp = Number(ppRaw);
    if (ppRaw && Number.isFinite(pp) && pp >= 0) state.sduPrice = pp;
  }

  // The valid pot values depend on whether a fellesavtale is in play, so the
  // number is taken at face value here and clamped against the list that is
  // actually on screen.
  // An absent "p" must stay absent rather than reading as 0: a link that only
  // carries a view or an avtale has no opinion about the pakke, and the caller's
  // own default has to survive.
  const potRaw = params.get("p");
  const pot = Number(potRaw);
  if (potRaw && Number.isFinite(pot) && pot >= 0) state.pot = pot;

  state.hasMobile = params.get("m") === "1";

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
