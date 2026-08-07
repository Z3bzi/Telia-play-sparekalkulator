export const STORAGE_KEY = "telia-kalkulator-config";

export const DEFAULT_CONFIG = {
  pots: [15, 40, 60],
  defaultPot: 60,
  mobileBonus: 10,
  extraPricePer10: 25,
  pin: "1234",
  lastUpdated: null,
  services: [
    { id: "netflix", name: "Netflix", points: 50, levels: [
      { name: "Basis m/reklame", price: 119 },
      { name: "Standard", price: 149 },
      { name: "Premium", price: 219 } ]},
    { id: "hbomax", name: "HBO Max", points: 30, levels: [
      { name: "Basis m/reklame", price: 89 },
      { name: "Standard", price: 149 },
      { name: "Premium", price: 189 } ]},
    { id: "viaplay", name: "Viaplay", points: 45, levels: [
      { name: "Film og serier", price: 159 } ]},
    { id: "prime", name: "Prime Video", points: 30, levels: [
      { name: "Standard (m/reklame)", price: 79 },
      { name: "Uten reklame", price: 108 } ]},
    { id: "tv2play", name: "TV 2 Play", points: 10, levels: [
      { name: "Start m/reklame", price: 129 } ]},
    { id: "disney", name: "Disney+", points: 40, levels: [
      { name: "Standard m/reklame", price: 69 },
      { name: "Uten reklame", price: 99 } ]},
    { id: "skyshowtime", name: "SkyShowtime", points: 30, levels: [
      { name: "Standard", price: 79 } ]},
    { id: "britbox", name: "BritBox", points: 10, levels: [
      { name: "Standard", price: 59 } ]},
  ],
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.services)) return parsed;
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
