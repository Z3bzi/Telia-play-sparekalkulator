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

// En tjeneste som bare finnes sammen med en annen kan ikke pakkes uten den:
// Disney+ uten TV 2 Play, eller HBO Max Sport uten HBO Max, ville vært en
// dekning kunden ikke får kjøpt. Kravet peker på verten ved id, og verten er
// nivået selv — et tillegg kan ikke stille som vert for et annet tillegg.
//
// Kravet er allerede strøket i `collect` for tillegg som henger på et nivå
// poengene ikke betaler for, så det som står igjen her skal håndheves.
function requirementMasks(chosen) {
  return chosen.map(c => c.requires
    ? chosen.reduce((m, host, j) => (host.id === c.requires ? m | (1 << j) : m), 0)
    : 0);
}

// Alle kombinasjoner, og den beste av dem. Antallet avkryssede linjer er lite —
// åtte til tolv i praksis — så 2^n er billigere enn det ser ut, og til gjengjeld
// er svaret beviselig det beste utvalget og ikke bare et godt et.
function packExact(chosen, budget) {
  const n = chosen.length;
  const need = requirementMasks(chosen);

  let bestMask = 0, bestPrice = -1, bestPoints = 0;
  for (let mask = 0; mask < (1 << n); mask++) {
    let points = 0, price = 0, valid = true;
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      // Verten må være med i den samme pakken, ikke bare være avkrysset.
      if (need[i] && !(mask & need[i])) { valid = false; break; }
      points += chosen[i].points;
      if (points > budget) { valid = false; break; }
      price += chosen[i].price;
    }
    if (!valid || price < bestPrice) continue;
    // Like mange kroner: den som bruker færrest poeng vinner, så det som blir
    // til overs er ekte ledig plass og ikke en vilkårlig fylling.
    if (price > bestPrice || points < bestPoints) {
      bestMask = mask; bestPrice = price; bestPoints = points;
    }
  }

  return { packed: chosen.filter((_, i) => bestMask & (1 << i)), used: bestPoints };
}

// Over denne grensen koster gjennomgangen mer enn den er verdt, og den grådige
// runden under tar over. Startdata har åtte tjenester; grensen er satt der en
// admin må ha lagt til godt over det dobbelte før den slår inn.
const EXACT_LIMIT = 16;

function pack(chosen, available) {
  if (chosen.length <= EXACT_LIMIT) return packExact(chosen, available);
  return packGreedy(chosen, available);
}

// Grådig etter kroneverdi per poeng. Runden gjentas til den ikke får plass til
// mer, slik at en avhengig tjeneste får en ny sjanse når verten kom med etter
// den i verdirekkefølgen. Reserve for de tilfellene der listen er for lang til
// å gå gjennom alle kombinasjonene.
function packGreedy(chosen, available) {
  const queue = [...chosen].sort((a, b) => b.valuePerPoint - a.valuePerPoint);
  const packed = [];
  let used = 0;

  for (let added = true; added; ) {
    added = false;
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i];
      if (used + c.points > available) continue;
      if (c.requires && !packed.some(p => p.id === c.requires)) continue;
      packed.push(c);
      used += c.points;
      queue.splice(i--, 1);
      added = true;
    }
  }

  return { packed, used };
}

// Poengpakkene finnes bare i de konfigurasjonene Telia selger: pakkene selv, og
// den største av dem med en av de faste ekstrapoeng-bolkene oppå. Herfra kan
// kunden altså gå opp til de konfigurasjonene som er større enn pakken hen har,
// og ingen andre — 40 poeng + 10 ekstra er ikke en pakke, uansett hvor mye
// kunden er villig til å betale.
//
// Pakker under `extraBase` har ingen vei oppover: der er ekstrapoeng ikke en
// vare, og kalkulatoren har ikke lov til å prise seg ut av problemet.
//
// `points` er hva spranget koster i poeng — differansen opp fra pakken kunden
// står på, ikke bolken i seg selv. Det betyr noe for fellesavtalene, der
// TV-poengene fra prisarket (80, 100, 120) allerede er slike konfigurasjoner:
// derfra betales bare veien videre til den neste.
export function extraOptions(config, pot) {
  const base = Number(config.extraBase);
  if (!Number.isFinite(base) || pot < base) return [];
  return (config.extraSteps ?? [])
    .map(step => ({ total: base + (Number(step.points) || 0), name: step.name }))
    .filter(o => o.total > pot)
    .sort((a, b) => a.total - b.total)
    .map(o => ({ ...o, points: o.total - pot }));
}

// `planCost` is what the valgte kombinasjonen av hastighet og TV-poeng koster ut
// over fellesavtalen — 0 når den ligger i rammen, og 0 når ingen fellesavtale er
// valgt. Den trekkes fra begge alternativene likt, så anbefalingen står uendret:
// den avgjør bare hva pakken faktisk er verdt når den er betalt for.
export function calculate(config, { pot, hasMobile, selections, addons = {}, altMode, planCost = 0, planOptions = null }) {
  const { chosen, premium, included, bundle } = collect(config, selections, addons);

  const totalPrice = chosen.reduce((a, c) => a + c.price, 0);
  const totalPoints = chosen.reduce((a, c) => a + c.points, 0);
  const premiumCost = premium.reduce((a, c) => a + c.price, 0);
  const bonus = hasMobile ? config.mobileBonus : 0;
  const available = pot + bonus;
  const over = totalPoints > available;

  // Hvilke pakker kunden kan gå opp til herfra, og hva spranget koster. Er det
  // ingen — pakken er under den ekstrapoengene henger på — finnes ikke
  // «kjøp ekstra poeng» som alternativ i det hele tatt. Med en fellesavtale
  // kommer disse fra avtalens eget prisark (planOptions) i stedet for de løse
  // SDU-pakkenes flate sats — Telia selger ikke ekstrapoeng på Min Side til en
  // fellesavtale-kunde, de går til en annen rad i borettslagets prisark.
  const options = planOptions ?? extraOptions(config, pot);
  const extraOffered = options.length > 0;

  // Taket er den største konfigurasjonen som finnes, ikke et tall for seg.
  // Mobilbonusen løfter det slik den løfter pakken — 210 alene, 220 med
  // mobilabonnement på den største pakken.
  const largest = options.length ? options[options.length - 1] : null;
  const ceiling = (largest ? largest.total : pot) + bonus;

  // Den minste konfigurasjonen som dekker behovet. Rekker ingen av dem, står
  // den største igjen: mer enn det kan kunden ikke kjøpe seg til.
  const wanted = over
    ? (options.find(o => o.total + bonus >= totalPoints) ?? largest)
    : null;
  const extraPoints = wanted ? wanted.points : 0;
  const extraName = wanted?.name ?? null;
  // planOptions bærer sin egen kr-kostnad, hentet fra avtalen (ekte eller
  // ekstrapolert). Uten en avtale er ekstrapoeng en flat løs-pakke-sats,
  // oppgitt per ti poeng — bolkene er hele tiere, men en admin-oppfunnet bolk
  // trenger ikke være det, så kronebeløpet rundes.
  const extraCost = wanted
    ? (planOptions ? wanted.cost : Math.round((extraPoints / 10) * config.extraPricePer10))
    : 0;
  const extraExtrapolated = wanted?.extrapolated ?? false;

  // Med taket i veien dekker «kjøp ekstra poeng» ikke nødvendigvis alt lenger.
  // Når selv den største pakken kommer til kort, må også dette alternativet
  // pakke — det kjøper så mye det får lov til, og fyller med det som gir mest
  // igjen.
  const budget = available + extraPoints;
  const capped = totalPoints > budget;
  const bought = capped ? pack(chosen, budget) : { packed: chosen, used: totalPoints };
  const buy = {
    covered: bought.packed,
    dropped: chosen.filter(c => !bought.packed.some(p => p.id === c.id)),
    extraPoints, extraCost, extraName, extraExtrapolated, capped,
    savingMonth: bought.packed.reduce((a, c) => a + c.price, 0) - extraCost - planCost,
    pointsUsed: bought.used,
  };

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
  // Uten ekstrapoeng å kjøpe er de to alternativene det samme regnestykket, og
  // da er «bare det som får plass» det ærlige navnet på svaret.
  const recommended = fit && (!extraOffered || fit.savingMonth > buy.savingMonth) ? "fit" : "buy";

  const active = over && fit && (altMode === "fit" || !extraOffered) ? fit : buy;
  return { chosen, premium, premiumCost, included, bundle, totalPrice, totalPoints,
    available, ceiling, over, buy, fit, active, recommended, planCost,
    extraOffered, extraBase: Number(config.extraBase) || 0 };
}
