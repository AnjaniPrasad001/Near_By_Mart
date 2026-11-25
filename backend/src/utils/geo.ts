/**
 * Calculate Haversine distance in kilometers between two lat/lng points.
 */
export const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 100) / 100;
};

/**
 * Parse optional coordinate pair from query params.
 */
export const parseCoordinates = (
  latParam?: unknown,
  lngParam?: unknown,
): { lat: number; lng: number } | null => {
  if (latParam === undefined || lngParam === undefined) return null;
  const lat = Number(latParam);
  const lng = Number(lngParam);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

/**
 * Escape special characters for safe MongoDB regex queries.
 */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
