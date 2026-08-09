// Everything the user has ticked, split by how it is paid for. `chosen` is what
// poeng can cover and what the besparelse is measured against; `premium` is the
// kroner-only tiers, which cost the same with or without Telia Play and so are
// reported separately rather than folded into the saving.
function collect(config, selections, addons) {
  const chosen = [], premium = [];

  const add = (item) => {
    if (item.points === null) premium.push(item);
    else chosen.push({
      ...item,
      // How much subscription value each point unlocks — this is the ordering
      // that "bare det som får plass" packs by, so it is worth surfacing.
      valuePerPoint: item.points > 0 ? item.price / item.points : Infinity,
    });
  };

  for (const s of config.services) {
    const levelIndex = selections[s.id];
    if (levelIndex === undefined || !s.levels[levelIndex]) continue;
    const level = s.levels[levelIndex];
    add({ id: s.id, name: s.name, levelName: level.name, points: level.points, price: level.price });

    // Tillegg stack on the chosen nivå, so they are separate line items with
    // their own poeng- and kronekostnad.
    for (const a of s.addons ?? []) {
      if (!(addons[s.id] ?? []).includes(a.id)) continue;
      add({ id: `${s.id}:${a.id}`, name: s.name, levelName: a.name, points: a.points, price: a.price });
    }
  }

  return { chosen, premium };
}

export function calculate(config, { pot, hasMobile, selections, addons = {}, altMode }) {
  const { chosen, premium } = collect(config, selections, addons);

  const totalPrice = chosen.reduce((a, c) => a + c.price, 0);
  const totalPoints = chosen.reduce((a, c) => a + c.points, 0);
  const premiumCost = premium.reduce((a, c) => a + c.price, 0);
  const available = pot + (hasMobile ? config.mobileBonus : 0);
  const over = totalPoints > available;

  const extraPoints = over ? Math.ceil((totalPoints - available) / 10) * 10 : 0;
  const extraCost = (extraPoints / 10) * config.extraPricePer10;
  const buy = { covered: chosen, dropped: [], extraPoints, extraCost,
    savingMonth: totalPrice - extraCost, pointsUsed: totalPoints };

  let fit = null;
  if (over) {
    const sorted = [...chosen].sort((a, b) => b.valuePerPoint - a.valuePerPoint);
    const packed = []; let used = 0;
    for (const c of sorted) {
      if (used + c.points <= available) { packed.push(c); used += c.points; }
    }
    fit = {
      covered: packed,
      dropped: chosen.filter(c => !packed.some(p => p.id === c.id)),
      extraPoints: 0, extraCost: 0,
      savingMonth: packed.reduce((a, c) => a + c.price, 0),
      pointsUsed: used,
    };
  }

  // Ties go to "buy", which keeps every service the user actually pays for.
  const recommended = fit && fit.savingMonth > buy.savingMonth ? "fit" : "buy";

  const active = over && altMode === "fit" && fit ? fit : buy;
  return { chosen, premium, premiumCost, totalPrice, totalPoints, available, over, buy, fit, active, recommended };
}
