export const STORAGE_KEY = "telia-kalkulator-config";

// Points are priced per tier, not per service: on Telia Play, HBO Max med
// reklame costs 30 poeng while Standard costs 50, TV 2 Play spans 10-110, and
// SkyShowtime 20-30. Point values below match the Telia Play interface
// (august 2026); prices remain veiledende and editable in admin.
//
// Two tiers exist that poeng cannot buy at all — HBO Max Premium, V Premium and
// Viaplay Total are sold in kroner only. They carry `points: null`, which keeps
// them out of the poeng budget and out of the besparelse: Telias kronepris for
// them matches what the tjenesten koster direkte, so having Telia Play changes
// nothing about what you pay.
//
// `addons` are tillegg that stack on top of a chosen nivå rather than replacing
// it — HBO Max Sport costs 20 poeng (or 50 kr) on top of Basis or Standard.
// Viaplay's V Sport, V Sport Golf and V Series are also poengpriset (20/50/5),
// but they are TV-kanaler with no standalone kronepris, so "hva betaler du i
// dag" has no meaningful answer for them and they are left out of startdata.
export const DEFAULT_CONFIG = {
  // Telia Play sells the point packages as named tiers, so the selector shows
  // the same name and månedspris the customer sees when signing up. `points`
  // is what the calculation runs on; `price` is context only.
  pots: [
    { name: "Start", points: 15, price: 109 },
    { name: "Standard", points: 40, price: 189 },
    { name: "Premium", points: 60, price: 399 },
  ],
  defaultPot: 60,
  mobileBonus: 10,
  extraPricePer10: 25,
  pin: "1234",
  lastUpdated: null,
  services: [
    { id: "netflix", name: "Netflix", levels: [
      { name: "Basis m/reklame", price: 119, points: 50 },
      { name: "Standard", price: 149, points: 50 },
      { name: "Premium", price: 219, points: 50 } ]},
    { id: "hbomax", name: "HBO Max", levels: [
      { name: "Basis m/reklame", price: 89, points: 30 },
      { name: "Standard", price: 149, points: 50 },
      { name: "Premium", price: 189, points: null } ],
      addons: [ { id: "sport", name: "Sport", price: 50, points: 20 } ]},
    { id: "viaplay", name: "Viaplay", levels: [
      { name: "Film og serier", price: 159, points: 45 },
      { name: "V Premium", price: 699, points: null },
      { name: "Viaplay Total", price: 749, points: null } ]},
    { id: "prime", name: "Prime Video", levels: [
      { name: "Standard", price: 79, points: 30 } ]},
    { id: "tv2play", name: "TV 2 Play", levels: [
      { name: "Start m/reklame", price: 129, points: 10 },
      { name: "Start", price: 199, points: 40 },
      { name: "Standard m/Disney+, m/reklame", price: 299, points: 50 },
      { name: "Standard m/Disney+", price: 379, points: 110 } ]},
    { id: "disney", name: "Disney+", levels: [
      { name: "Standard m/reklame", price: 69, points: 40 },
      { name: "Uten reklame", price: 99, points: 40 } ]},
    { id: "skyshowtime", name: "SkyShowtime", levels: [
      { name: "Med reklame", price: 59, points: 20 },
      { name: "Uten reklame", price: 79, points: 30 } ]},
    { id: "britbox", name: "BritBox", levels: [
      { name: "Standard", price: 59, points: 10 } ]},
  ],
};

// Configs saved before points moved onto levels carry a single service-wide
// `points`; spread it onto every tier so stored admin edits keep working.
function migrateConfig(cfg) {
  for (const s of cfg.services) {
    const fallback = Number(s.points) || 0;
    for (const l of s.levels) {
      // null is deliberate — the tier is sold in kroner only. Anything else
      // non-numeric predates per-tier points and takes the old service value.
      if (l.points !== null && typeof l.points !== "number") l.points = fallback;
    }
    if (!Array.isArray(s.addons)) s.addons = [];
    delete s.points;
  }
  // Packages used to be bare point counts. Name and price the ones we still
  // recognise from the defaults; anything the admin invented keeps working
  // under a generic label rather than being dropped.
  cfg.pots = (Array.isArray(cfg.pots) ? cfg.pots : []).map(p => {
    if (p && typeof p === "object") {
      return { name: String(p.name ?? `${p.points} poeng`), points: Number(p.points) || 0, price: Number(p.price) || 0 };
    }
    const points = Number(p) || 0;
    const known = DEFAULT_CONFIG.pots.find(d => d.points === points);
    return known ? { ...known } : { name: `${points} poeng`, points, price: 0 };
  });
  return cfg;
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.services)) return migrateConfig(parsed);
    }
  } catch (e) { /* utilgjengelig lagring — bruk startdata */ }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

export function persistConfig(next) {
  const updated = { ...next, lastUpdated: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { /* gjelder for økten */ }
  return updated;
}

export const kr = n => n.toLocaleString("nb-NO");
