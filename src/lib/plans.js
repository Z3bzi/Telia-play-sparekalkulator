// Fellesavtalene fra Telias Flex-prisark, transkribert til plans.json. Hver rad
// er én kombinasjon av bredbåndshastighet og TV-poeng innenfor én avtale, og
// prisen er det kombinasjonen koster ut over det fellesavtalen allerede dekker:
//
//   "included"    «Ingen kostnad» — kombinasjonen ligger i rammen for
//                 fellesavtalen, og beboeren kan velge den uten ekstra kostnad.
//   "paid"        Et tillegg i kroner per måned oppå fellesavtalen.
//   "unavailable" «-» — kombinasjonen tilbys ikke. Den ligger under avtalens
//                 verdi, og Telia selger ikke ned: mindre hastighet gir flere
//                 TV-poeng, ikke lavere pris.
//
// Datafilen er transkribert fra prisarket og redigeres ikke for hånd her —
// oppdater plans.json når Telia oppdaterer arket.
import data from "./plans.json";

/**
 * @typedef {"included" | "unavailable" | "paid"} PriceType
 * @typedef {{ family: string, speed_mbit: number, tv_points: number,
 *             price_type: PriceType, price_nok: number | null }} PlanRow
 */

export const plansData = data;

/** @type {PlanRow[]} */
const rows = data.plans;

/** All distinct plan family names, in source order. */
export function listFamilies() {
  return [...new Set(rows.map(p => p.family))];
}

/** Distinct speed tiers (Mbit/s) offered for a given family, ascending. */
export function listSpeeds(family) {
  return [...new Set(rows.filter(p => p.family === family).map(p => p.speed_mbit))]
    .sort((a, b) => a - b);
}

/** Distinct TV-point tiers offered for a given family, ascending. */
export function listTvPointTiers(family) {
  return [...new Set(rows.filter(p => p.family === family).map(p => p.tv_points))]
    .sort((a, b) => a - b);
}

/**
 * Look up a single plan row by family + speed + TV points.
 * Returns undefined if that combination doesn't exist in the source tables
 * (distinct from price_type === "unavailable", which means the combination
 * exists in the table but is marked "-" / not offered).
 */
export function getPlanRow(family, speedMbit, tvPoints) {
  return rows.find(
    p => p.family === family && p.speed_mbit === speedMbit && p.tv_points === tvPoints,
  );
}

/** Human-friendly price label, e.g. "389 kr/md.", "Ingen kostnad" or "–". */
export function formatPrice(row) {
  if (!row || row.price_type === "unavailable") return "–";
  if (row.price_type === "included") return "Ingen kostnad";
  return `${row.price_nok} ${data.unit}`;
}

/**
 * The whole price sheet for one family, shaped the way the table renders it:
 * TV-point tiers down the side, speeds across the top.
 */
export function planMatrix(family) {
  const speeds = listSpeeds(family);
  const tiers = listTvPointTiers(family);
  return {
    family,
    speeds,
    tiers,
    cells: tiers.map(tv => speeds.map(speed => getPlanRow(family, speed, tv))),
  };
}

/**
 * The TV-point tiers a family offers at one speed, each with what it costs.
 * Tiers the sheet marks "-" are kept rather than filtered away: the calculator
 * shows them greyed out, because they become available again at lower speeds
 * and dropping them silently would hide that trade-off.
 */
export function tiersForSpeed(family, speedMbit) {
  return listTvPointTiers(family).map(points => {
    const row = getPlanRow(family, speedMbit, points);
    return {
      points,
      price: row?.price_type === "paid" ? (row.price_nok ?? 0) : 0,
      priceType: row?.price_type ?? "unavailable",
      available: row?.price_type === "included" || row?.price_type === "paid",
    };
  });
}

/**
 * What one combination adds to the monthly bill, or null when it isn't offered.
 * Kept separate from `tiersForSpeed` so the calculator can price a single
 * choice without walking the family.
 */
export function planCost(family, speedMbit, tvPoints) {
  const row = getPlanRow(family, speedMbit, tvPoints);
  if (!row || row.price_type === "unavailable") return null;
  return row.price_type === "paid" ? (row.price_nok ?? 0) : 0;
}

/**
 * The kr/poeng Telia charges within one avtale+hastighet, read off the last
 * steg arket faktisk priser. Brukes til å prise TV-poeng-totaler forbi det
 * avtalens egen tabell når — flere avtaler (Flex Basis Optimal, Flex Start …)
 * stopper på 80 eller 100 TV-poeng, mens behovet til en husstand kan gå
 * høyere. Ekstrapolering fra avtalens egen sats holder tallet forankret i
 * hva Telia faktisk tar for *denne* avtalen, i stedet for å låne satsen fra
 * de løse SDU-pakkene, som ikke har noe med avtalen å gjøre.
 */
export function pointRate(family, speedMbit) {
  const tiers = listTvPointTiers(family);
  for (let i = tiers.length - 1; i > 0; i--) {
    const hi = getPlanRow(family, speedMbit, tiers[i]);
    const lo = getPlanRow(family, speedMbit, tiers[i - 1]);
    if (!hi || !lo || hi.price_type === "unavailable" || lo.price_type === "unavailable") continue;
    const dPts = tiers[i] - tiers[i - 1];
    if (dPts <= 0) continue;
    const hiPrice = hi.price_type === "paid" ? (hi.price_nok ?? 0) : 0;
    const loPrice = lo.price_type === "paid" ? (lo.price_nok ?? 0) : 0;
    return (hiPrice - loPrice) / dPts;
  }
  return null;
}

/**
 * TV-poeng-konfigurasjoner forbi pakken en fellesavtale-kunde sitter på:
 * ekte rader fra prisarket der de finnes, og ekstrapolert fra avtalens egen
 * kr/poeng forbi det — stegvis med samme mellomrom avtalen selv bruker
 * (typisk 20 poeng), avgrenset av `ceilingTotal` så konseptet ikke løper i
 * det uendelige. `cost` er allerede tillegget over `currentCost` — hva det
 * faktisk koster å kjøpe seg opp fra pakken kunden står på.
 */
export function planExtraOptions(family, speedMbit, pot, currentCost, ceilingTotal) {
  const tiers = listTvPointTiers(family);
  if (!tiers.length) return [];
  const maxTier = tiers[tiers.length - 1];
  const options = [];

  for (const t of tiers) {
    if (t <= pot) continue;
    const cost = planCost(family, speedMbit, t);
    if (cost === null) continue;
    options.push({ total: t, points: t - pot, cost: Math.round(cost - currentCost), extrapolated: false });
  }

  const rate = pointRate(family, speedMbit);
  const lastGap = tiers.length > 1 ? tiers[tiers.length - 1] - tiers[tiers.length - 2] : null;
  if (rate !== null && lastGap) {
    const topRow = getPlanRow(family, speedMbit, maxTier);
    const topPrice = topRow?.price_type === "paid" ? (topRow.price_nok ?? 0) : 0;
    for (let t = maxTier + lastGap; t <= ceilingTotal; t += lastGap) {
      if (t <= pot) continue;
      const cost = topPrice + rate * (t - maxTier);
      options.push({ total: t, points: t - pot, cost: Math.round(cost - currentCost), extrapolated: true });
    }
  }

  return options.sort((a, b) => a.total - b.total);
}

/**
 * The facts about a family worth stating above its table, all read off the
 * sheet rather than assumed: which combinations the fellesavtale covers, how
 * far the TV-points go, and what the paid steps span.
 */
export function planSummary(family) {
  const own = rows.filter(p => p.family === family);
  const included = own
    .filter(p => p.price_type === "included")
    .sort((a, b) => b.speed_mbit - a.speed_mbit);
  const paid = own.filter(p => p.price_type === "paid").map(p => p.price_nok ?? 0);
  const tiers = listTvPointTiers(family);
  return {
    included,
    maxTvPoints: tiers[tiers.length - 1] ?? 0,
    minPaid: paid.length ? Math.min(...paid) : null,
    maxPaid: paid.length ? Math.max(...paid) : null,
  };
}

/**
 * Which hastighet to start a family on. The one where the current TV-poeng tier
 * is already included wins: it costs nothing extra, so choosing an avtale never
 * quietly adds a charge nobody asked for. Failing that, a hastighet the user has
 * already picked and the avtalen still offers, and failing that the fastest one.
 */
export function defaultSpeed(family, tvPoints, preferSpeed) {
  const free = rows.find(
    p => p.family === family && p.tv_points === tvPoints && p.price_type === "included",
  );
  if (free) return free.speed_mbit;
  const speeds = listSpeeds(family);
  if (speeds.includes(preferSpeed)) return preferSpeed;
  return speeds[speeds.length - 1];
}

/** Speeds are quoted per second; TV-points are not. */
export const speedLabel = mbit => `${mbit} Mbit/s`;
export const tvPointsLabel = points =>
  points === 0 ? "Ingen TV" : `${points} TV-poeng`;
