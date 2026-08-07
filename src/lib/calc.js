export function calculate(config, { pot, hasMobile, selections, altMode }) {
  const chosen = config.services
    .filter(s => selections[s.id] !== undefined && s.levels[selections[s.id]])
    .map(s => {
      const level = s.levels[selections[s.id]];
      return {
        id: s.id, name: s.name, points: level.points, price: level.price,
        levelName: level.name,
        // How much subscription value each point unlocks — this is the ordering
        // that "bare det som får plass" packs by, so it is worth surfacing.
        valuePerPoint: level.points > 0 ? level.price / level.points : Infinity,
      };
    });

  const totalPrice = chosen.reduce((a, c) => a + c.price, 0);
  const totalPoints = chosen.reduce((a, c) => a + c.points, 0);
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
  return { chosen, totalPrice, totalPoints, available, over, buy, fit, active, recommended };
}
