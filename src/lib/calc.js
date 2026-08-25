// Which services are selected, and which of them another selected nivå already
// carries. TV 2 Plays Standard-nivåer inkluderer Disney+, so a Disney+-hake on
// top of dem is not a second utgift — and Disney+ on its own has no poengpris at
// all, because Telia only sells it in combination with TV 2 Play.
export function bundleState(config, selections) {
  const selected = new Map();
  for (const s of config.services) {
    const level = s.levels[selections[s.id]];
    if (level) selected.set(s.id, { id: s.id, name: s.name, levelName: level.name });
  }

  const includedBy = new Map();
  for (const s of config.services) {
    const level = s.levels[selections[s.id]];
    if (!level) continue;
    // First host wins: a tjeneste can only ride along on one nivå, and listing
    // it twice under «Følger med» would say nothing extra.
    for (const id of level.includes ?? []) {
      if (!includedBy.has(id)) includedBy.set(id, selected.get(s.id));
    }
  }

  // A service is blocked when its poengpris only applies alongside a tjeneste
  // the user has not picked. Being included by someone else settles the matter
  // regardless — the host is right there, so the combination holds.
  const missingRequirement = id => {
    const s = config.services.find(x => x.id === id);
    if (!s?.requires || includedBy.has(id) || selected.has(s.requires)) return null;
    return config.services.find(x => x.id === s.requires) ?? null;
  };

  return { selected, includedBy, missingRequirement };
}

// Everything the user has ticked, split by how it is paid for. `chosen` is what
// poeng can cover and what the besparelse is measured against; `premium` is what
// poeng cannot buy — kroner-only tiers, which cost the same with or without
// Telia Play, and tjenester whose kombinasjonskrav is not met. Both are reported
// separately rather than folded into the saving. `included` is what another
// chosen nivå already carries, and so costs nothing on either side of the sum.
function collect(config, selections, addons) {
  const chosen = [], premium = [], included = [];
  const bundle = bundleState(config, selections);
  // Services whose own nivå is something poeng pay for. Only those can hold a
  // dependent tjeneste inside the pakken — see the requires-pass further down.
  const poengPaid = new Set();

  for (const s of config.services) {
    const levelIndex = selections[s.id];
    if (levelIndex === undefined || !s.levels[levelIndex]) continue;
    const level = s.levels[levelIndex];

    // Already inside another tier's price. Counting its kroner again would
    // inflate what the user pays today, and its poeng are the host's problem.
    // Its tillegg go with it: none of the bundled tjenester have any, and a
    // tillegg on one would need a pris of its own to mean anything here.
    const host = bundle.includedBy.get(s.id);
    if (host) {
      included.push({ id: s.id, serviceId: s.id, name: s.name, levelName: level.name, host });
      continue;
    }

    const missing = bundle.missingRequirement(s.id);
    const note = missing
      ? `bare tilgjengelig sammen med ${missing.name}`
      : "samme pris med og uten poeng";

    const add = (item) => {
      if (missing || item.points === null) {
        premium.push({ ...item, note, reason: missing ? "requires" : "kroner" });
      } else {
        chosen.push({
          ...item,
          // How much subscription value each point unlocks — this is the
          // ordering that "bare det som får plass" packs by, so it is worth
          // surfacing.
          valuePerPoint: item.points > 0 ? item.price / item.points : Infinity,
        });
      }
    };

    add({ id: s.id, serviceId: s.id, name: s.name, levelName: level.name,
          points: level.points, price: level.price, requires: s.requires });
    if (!missing && level.points !== null) poengPaid.add(s.id);

    // Tillegg stack on the chosen nivå, so they are separate line items with
    // their own poeng- og kronekostnad. They hang off the service itself, which
    // is what keeps them from being packed without it.
    for (const a of s.addons ?? []) {
      if (!(addons[s.id] ?? []).includes(a.id)) continue;
      add({ id: `${s.id}:${a.id}`, serviceId: s.id, name: s.name, levelName: a.name,
            points: a.points, price: a.price, requires: s.id });
    }
  }

  // The kombinasjonskravet is already settled above — what is left is the tie
  // «bare det som får plass» has to respect. It only means something when the
  // tjenesten it hangs off is itself paid for with poeng: HBO Max Sport oppå et
  // HBO Max Premium betalt i kroner stands on its own, and must not be dragged
  // out of the pakken by a host that was never in it.
  for (const c of chosen) {
    if (c.requires && !poengPaid.has(c.requires)) delete c.requires;
  }

  return { chosen, premium, included, bundle };
}

// Grådig etter kroneverdi per poeng, men en tjeneste som bare finnes sammen med
// en annen kan ikke pakkes uten den: Disney+ uten TV 2 Play, eller HBO Max Sport
// uten HBO Max, ville vært en dekning kunden ikke får kjøpt. Runden gjentas til
// den ikke får plass til mer, slik at en avhengig tjeneste får en ny sjanse når
// verten kom med etter den i verdirekkefølgen.
function pack(chosen, available) {
  const queue = [...chosen].sort((a, b) => b.valuePerPoint - a.valuePerPoint);
  const packed = [];
  let used = 0;

  for (let added = true; added; ) {
    added = false;
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i];
      if (used + c.points > available) continue;
      if (c.requires && !packed.some(p => p.serviceId === c.requires)) continue;
      packed.push(c);
      used += c.points;
      queue.splice(i--, 1);
      added = true;
    }
  }

  return { packed, used };
}

// `planCost` is what the valgte kombinasjonen av hastighet og TV-poeng koster ut
// over fellesavtalen — 0 når den ligger i rammen, og 0 når ingen fellesavtale er
// valgt. Den trekkes fra begge alternativene likt, så anbefalingen står uendret:
// den avgjør bare hva pakken faktisk er verdt når den er betalt for.
export function calculate(config, { pot, hasMobile, selections, addons = {}, altMode, planCost = 0 }) {
  const { chosen, premium, included, bundle } = collect(config, selections, addons);

  const totalPrice = chosen.reduce((a, c) => a + c.price, 0);
  const totalPoints = chosen.reduce((a, c) => a + c.points, 0);
  const premiumCost = premium.reduce((a, c) => a + c.price, 0);
  const available = pot + (hasMobile ? config.mobileBonus : 0);
  const over = totalPoints > available;

  const extraPoints = over ? Math.ceil((totalPoints - available) / 10) * 10 : 0;
  const extraCost = (extraPoints / 10) * config.extraPricePer10;
  const buy = { covered: chosen, dropped: [], extraPoints, extraCost,
    savingMonth: totalPrice - extraCost - planCost, pointsUsed: totalPoints };

  let fit = null;
  if (over) {
    const { packed, used } = pack(chosen, available);
    fit = {
      covered: packed,
      dropped: chosen.filter(c => !packed.some(p => p.id === c.id)),
      extraPoints: 0, extraCost: 0,
      savingMonth: packed.reduce((a, c) => a + c.price, 0) - planCost,
      pointsUsed: used,
    };
  }

  // Ties go to "buy", which keeps every service the user actually pays for.
  const recommended = fit && fit.savingMonth > buy.savingMonth ? "fit" : "buy";

  const active = over && altMode === "fit" && fit ? fit : buy;
  return { chosen, premium, premiumCost, included, bundle, totalPrice, totalPoints,
    available, over, buy, fit, active, recommended, planCost };
}
