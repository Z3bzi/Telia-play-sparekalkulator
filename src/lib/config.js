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
//
// Two fields tie services together, both needed for Disney+, which Telia only
// sells in combination with TV 2 Play:
//
//   `requires` on a service — its poengpris only applies alongside that other
//   service. Disney+ without TV 2 Play cannot be bought for poeng at all, so it
//   is reported as en ren kroneutgift instead of counting as besparelse.
//
//   `includes` on a nivå — services that tier already contains. TV 2 Plays
//   Standard-nivåer inkluderer Disney+, so ticking both must not charge for
//   Disney+ twice: it rides along on TV 2 Plays poeng og kroner.
export const DEFAULT_CONFIG = {
  // Poengpakkene ship as bare point counts, because that is all we can vouch
  // for. They briefly carried the names Start/Standard/Premium and the prices
  // 109/189/399 — those belong to TV 2 Plays egne abonnementer på play.tv2.no,
  // not to Telias poengpakker, and had no business here.
  //
  // `name` and `price` are still supported and editable in admin, for whoever
  // has the real ones. Prisen holds off by default regardless: MDU-kunder pay
  // whatever their borettslag has agreed with Telia, and the calculator cannot
  // tell who is looking.
  showPotPrices: false,
  pots: [
    { points: 15 },
    { points: 40 },
    { points: 60 },
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
    // Viaplay har nå to Film og serier-varianter, 109 med reklame og 169 uten.
    // Telia lister bare én, til 45 poeng, og sier ikke hvilken. 169 er lagt til
    // grunn: der Telia faktisk skiller på reklame — HBO Max, SkyShowtime, Prime,
    // TV 2 Play — er reklamevarianten alltid billigere i poeng, så en enslig
    // oppføring til 45 poeng peker mot den fulle tjenesten. Verdt å bekrefte.
    { id: "viaplay", name: "Viaplay", levels: [
      { name: "Film og serier", price: 169, points: 45 },
      { name: "V Premium", price: 699, points: null },
      { name: "Viaplay Total", price: 749, points: null } ]},
    { id: "prime", name: "Prime Video", levels: [
      { name: "Standard", price: 79, points: 30 } ]},
    // play.tv2.no oppgir "fra 109,-/mnd" for Start og "fra 189,-/mnd" for
    // Standard — det er reklamevariantene, de samme som koster 10 og 50 poeng
    // hos Telia. Prisene uten reklame er fortsatt anslag.
    { id: "tv2play", name: "TV 2 Play", levels: [
      { name: "Start m/reklame", price: 109, points: 10 },
      { name: "Start", price: 199, points: 40 },
      { name: "Standard m/Disney+, m/reklame", price: 189, points: 50, includes: ["disney"] },
      { name: "Standard m/Disney+", price: 379, points: 110, includes: ["disney"] } ]},
    // Disney+ selges ikke løsrevet hos Telia — det er bare tilgjengelig sammen
    // med TV 2 Play. På Standard-nivåene ligger det allerede inne i prisen; på
    // Start-nivåene kan det kjøpes til for 40 poeng. Uten TV 2 Play i det hele
    // tatt er det ingen poengvei til Disney+, og kroneprisen står som den er.
    { id: "disney", name: "Disney+", requires: "tv2play", levels: [
      { name: "Standard m/reklame", price: 69, points: 40 },
      { name: "Uten reklame", price: 99, points: 40 } ]},
    { id: "skyshowtime", name: "SkyShowtime", levels: [
      { name: "Med reklame", price: 69, points: 20 },
      { name: "Uten reklame", price: 79, points: 30 } ]},
    // 89 kr er månedsprisen. Årsabonnementet på 699 kr tilsvarer 58 kr/md.,
    // men det er ikke det du slipper å betale om poeng dekker tjenesten fra
    // måned til måned, så månedsprisen er den riktige å sammenligne med.
    { id: "britbox", name: "BritBox", levels: [
      { name: "Standard", price: 89, points: 10 } ]},
  ],
};

// `requires` og `includes` peker på andre tjenester ved id. En peker til en
// tjeneste som ikke finnes kan aldri innfris, og ville låst den avhengige
// tjenesten ute fra poeng for godt — så den forkastes i stedet for å håndheves.
// Kjøres både ved innlasting og ved lagring fra admin, der tjenester slettes.
export function pruneBundleRefs(services) {
  const ids = new Set(services.map(s => s.id));
  for (const s of services) {
    if (typeof s.requires !== "string" || !ids.has(s.requires) || s.requires === s.id) {
      delete s.requires;
    }
    for (const l of s.levels ?? []) {
      // A tier cannot include the service it belongs to, and duplicate entries
      // would list the same tjeneste twice under «Følger med».
      const kept = Array.isArray(l.includes)
        ? [...new Set(l.includes)].filter(id => id !== s.id && ids.has(id))
        : [];
      if (kept.length) l.includes = kept; else delete l.includes;
    }
  }
  return services;
}

// Configs saved before points moved onto levels carry a single service-wide
// `points`; spread it onto every tier so stored admin edits keep working.
function migrateConfig(cfg) {
  pruneBundleRefs(cfg.services);
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
  // Configs stored while prices were always visible must not keep showing them.
  if (typeof cfg.showPotPrices !== "boolean") cfg.showPotPrices = false;
  cfg.pots = (Array.isArray(cfg.pots) ? cfg.pots : []).map(p => {
    // A pakke needs nothing but its poengtall; navn and pris are optional and
    // stay absent unless someone has actually filled them in.
    const points = Number(p && typeof p === "object" ? p.points : p) || 0;
    const name = typeof p === "object" ? String(p?.name ?? "").trim() : "";
    const price = Number(typeof p === "object" ? p?.price : 0) || 0;
    return { points, ...(name ? { name } : {}), ...(price ? { price } : {}) };
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
