/**
 * Deterministic color palette keyed by species name. Falls back to a
 * stable hash-based color for species not explicitly listed, so every
 * species (including ones added later by the API) still gets a
 * consistent, distinguishable color.
 */
const PALETTE: Record<string, { bg: string; accent: string }> = {
  Human: { bg: '#2b2145', accent: '#8f7fff' },
  Droid: { bg: '#1f3a3d', accent: '#3ddad7' },
  Wookiee: { bg: '#3a2416', accent: '#d99a4e' },
  Rodian: { bg: '#1e3a1e', accent: '#5ed65e' },
  Hutt: { bg: '#3a1e2e', accent: '#e0558f' },
  Yoda_s_species: { bg: '#26401f', accent: '#8ce65c' },
  "Yoda's species": { bg: '#26401f', accent: '#8ce65c' },
  Trandoshan: { bg: '#3d2a12', accent: '#e08a2b' },
  "Mon Calamari": { bg: '#12313d', accent: '#4bb8e0' },
  Ewok: { bg: '#33240f', accent: '#c9a24b' },
  Sullustan: { bg: '#2a2a3d', accent: '#9d9de0' },
  "Neimodian": { bg: '#1e3d33', accent: '#4be0a8' },
  Gungan: { bg: '#123d2f', accent: '#3be6b0' },
  Twi_lek: { bg: '#3d1230', accent: '#e63bb0' },
  "Twi'lek": { bg: '#3d1230', accent: '#e63bb0' },
  Zabrak: { bg: '#3d1212', accent: '#e64b4b' },
};

const FALLBACK_ACCENTS = ['#8f7fff', '#3ddad7', '#e0558f', '#8ce65c', '#e08a2b', '#4bb8e0'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorForSpecies(speciesName: string | null): { bg: string; accent: string } {
  const name = speciesName ?? 'Human';
  if (PALETTE[name]) return PALETTE[name];
  const accent = FALLBACK_ACCENTS[hashString(name) % FALLBACK_ACCENTS.length];
  return { bg: '#1e1e2e', accent };
}
