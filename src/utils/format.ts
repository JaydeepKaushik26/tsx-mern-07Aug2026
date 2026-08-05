/** Formats an ISO date string into dd-MM-yyyy. Returns 'Unknown' if unparsable. */
export function formatDateDDMMYYYY(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** SWAPI height is centimeters as a string (or "unknown"). Converts to meters, e.g. "172" -> "1.72 m". */
export function heightInMeters(height: string): string {
  const cm = Number(height);
  if (!height || Number.isNaN(cm)) return 'Unknown';
  return `${(cm / 100).toFixed(2)} m`;
}

/** SWAPI mass is kilograms as a string (or "unknown", possibly with commas). */
export function massInKg(mass: string): string {
  if (!mass || mass.toLowerCase() === 'unknown') return 'Unknown';
  const kg = Number(mass.replace(/,/g, ''));
  if (Number.isNaN(kg)) return 'Unknown';
  return `${kg.toLocaleString()} kg`;
}

/** Deterministic-per-character random picsum image, stable across re-renders for the same person. */
export function pictureUrlFor(seed: string, width = 400, height = 400): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
