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
 * Prisen arket oppgir for én kombinasjon, men bare når den er et betalt trinn.
 * «Ingen kostnad» er ikke et trinn i trappen — det er rammen fellesavtalen
 * allerede dekker — og å regne det som 0 kr ville gjort spranget ut av avtalen
 * til et poengsteg. Det er det ikke: det spranget er avtalens grunnpris.
 */
function paidPrice(family, speedMbit, tvPoints) {
  const row = getPlanRow(family, speedMbit, tvPoints);
  return row?.price_type === "paid" ? (row.price_nok ?? 0) : null;
}

/**
 * Hva ett hakk opp i TV-poeng koster ved én hastighet, lest av de to øverste
 * trinnene kolonnen selv priser. Avtalene er ikke enige om dette steget: Flex
 * Start og Flex Basis går 100 kr per trinn hele veien, mens Flex Bredbånd Max
 * går 100 kr fra 15 til 40 TV-poeng og 50 kr fra 40 til 60. Toppen er derfor
 * den eneste riktige å lese av — det er den trappen som fortsetter oppover.
 */
function tierStepAt(family, speedMbit) {
  const tiers = listTvPointTiers(family);
  for (let i = tiers.length - 1; i > 0; i--) {
    const hi = paidPrice(family, speedMbit, tiers[i]);
    const lo = paidPrice(family, speedMbit, tiers[i - 1]);
    if (hi === null || lo === null) continue;
    return hi - lo;
  }
  return null;
}

/**
 * Samme steg, men med resten av avtalen som reserve: en kolonne med bare ett
 * betalt trinn sier ingenting om steget, mens de raske kolonnene i samme
 * avtale gjør det. Steget er likt i alle kolonner som har det, så det spiller
 * ingen rolle hvilken av dem svaret kommer fra.
 */
function tierStep(family, speedMbit) {
  const own = tierStepAt(family, speedMbit);
  if (own !== null) return own;
  const speeds = listSpeeds(family);
  for (let i = speeds.length - 1; i >= 0; i--) {
    const step = tierStepAt(family, speeds[i]);
    if (step !== null) return step;
  }
  return null;
}

/**
 * Grunnprisen for å gå ut av fellesavtalen ved én hastighet: det første
 * betalte trinnet på arkets øverste poengrad, funnet ved å se oppover i
 * hastighet herfra. Trappen i arket går nemlig i to retninger samtidig — ett
 * hakk opp i TV-poeng koster det samme som ett hakk opp i hastighet — så det
 * første hakket ut av avtalen står allerede i naboraden. Flex Start Optimal
 * med 60 TV-poeng ligger i avtalen på 50 Mbit/s og koster 389 kr på
 * 100 Mbit/s, og 389 kr er dermed også det 80 TV-poeng koster på 50 Mbit/s.
 */
function stepOutPrice(family, speedMbit) {
  const speeds = listSpeeds(family);
  const tiers = listTvPointTiers(family);
  const topTier = tiers[tiers.length - 1];
  for (let s = speeds.indexOf(speedMbit) + 1; s < speeds.length; s++) {
    const price = paidPrice(family, speeds[s], topTier);
    if (price !== null) return price;
  }
  return null;
}

/**
 * Hva en TV-poeng-sum forbi arkets egne trinn koster ved én hastighet, og om
 * tallet er lest eller anslått. Arket stopper på 60, 80, 100 eller 120
 * TV-poeng avhengig av avtalen, men avtalen gjør ikke det — Telia selger flere
 * poeng enn tabellen rekker å skrive ned.
 *
 * Kolonnen kunden står i svarer selv når den har to betalte trinn: da er
 * trappen allerede i gang, og den forlenges med avtalens eget poengsteg ved
 * akkurat den hastigheten. Har den ikke det, står kunden på grensen for
 * fellesavtalen, og første hakk ut av den koster grunnprisen fra naboraden —
 * derfra igjen gjelder poengsteget.
 *
 * Returnerer null bare når avtalen ikke gir noe å regne fra i det hele tatt.
 */
export function projectPlanCost(family, speedMbit, tvPoints) {
  const tiers = listTvPointTiers(family);
  if (!listSpeeds(family).includes(speedMbit) || !tiers.length) return null;

  const exact = planCost(family, speedMbit, tvPoints);
  if (exact !== null) return { cost: exact, extrapolated: false };

  const top = tiers[tiers.length - 1];
  const gap = tiers.length > 1 ? top - tiers[tiers.length - 2] : 0;
  // Forbi toppen er det eneste vi kan strekke. Under den er «-» et bevisst
  // valg fra Telia — avtalen selges ikke ned — og skal ikke prises bort.
  if (tvPoints <= top || gap <= 0) return null;
  const steps = (tvPoints - top) / gap;
  if (!Number.isInteger(steps)) return null;

  const ownStep = tierStepAt(family, speedMbit);
  if (ownStep !== null) {
    const topPrice = paidPrice(family, speedMbit, top);
    if (topPrice !== null) return { cost: topPrice + ownStep * steps, extrapolated: true };
  }

  const base = stepOutPrice(family, speedMbit);
  if (base === null) return null;
  if (steps === 1) return { cost: base, extrapolated: true };

  const step = tierStep(family, speedMbit);
  if (step === null) return null;
  return { cost: base + step * (steps - 1), extrapolated: true };
}

/**
 * TV-poeng-konfigurasjoner forbi pakken en fellesavtale-kunde sitter på: ekte
 * rader fra prisarket der de finnes, og prisen lest av avtalens egen diagonal
 * forbi det — stegvis med samme mellomrom avtalen selv bruker (typisk 20
 * poeng), avgrenset av `ceilingTotal` så konseptet ikke løper i det uendelige.
 * `cost` er allerede tillegget over `currentCost` — hva det faktisk koster å
 * kjøpe seg opp fra pakken kunden står på.
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

  const lastGap = tiers.length > 1 ? maxTier - tiers[tiers.length - 2] : 0;
  if (lastGap > 0) {
    for (let t = maxTier + lastGap; t <= ceilingTotal; t += lastGap) {
      if (t <= pot) continue;
      const projected = projectPlanCost(family, speedMbit, t);
      if (!projected) break;
      options.push({
        total: t, points: t - pot,
        cost: Math.round(projected.cost - currentCost),
        extrapolated: projected.extrapolated,
      });
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
