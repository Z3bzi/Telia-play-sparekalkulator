// Approximate brand colours for the services we ship by default. These drive a
// coloured monogram, not a reproduced logo, so a close match is good enough.
const KNOWN_BRANDS = {
  netflix: "#E50914",
  hbomax: "#4A2AE8",
  viaplay: "#E8112D",
  prime: "#00A8E1",
  tv2play: "#D31C24",
  disney: "#113CCF",
  skyshowtime: "#7B2FD4",
  britbox: "#12284C",
};

// Services added through the admin panel have no entry above, so derive a
// stable colour from the id instead of leaving them all grey.
const FALLBACK_HUES = [210, 340, 25, 160, 280, 55, 120, 305];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function brandColor(service) {
  if (KNOWN_BRANDS[service.id]) return KNOWN_BRANDS[service.id];
  const hue = FALLBACK_HUES[hashCode(service.id) % FALLBACK_HUES.length];
  return `hsl(${hue} 58% 42%)`;
}

export function monogram(name) {
  const trimmed = String(name).trim();
  if (!trimmed) return "?";
  // "TV 2 Play" -> "T2", "Netflix" -> "N", "HBO Max" -> "HM"
  const words = trimmed.split(/\s+/).slice(0, 2);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return words.map(w => w.slice(0, 1)).join("").toUpperCase();
}
