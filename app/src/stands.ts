import data from '../assets/data/stations.json';

export type Stand = {
  id: string;
  hub: string;
  destinations: string[];
  price_dh: number;
  hours: 'day' | 'day_night';
  notes: string;
  verified: boolean;
  lng: number;
  lat: number;
};

export const stands: Stand[] = data.features.map((f) => ({
  ...(f.properties as Omit<Stand, 'lng' | 'lat'>),
  lng: f.geometry.coordinates[0],
  lat: f.geometry.coordinates[1],
}));

// Every destination once, for the shortcut chips.
export const allDestinations = [...new Set(stands.flatMap((s) => s.destinations))];

export const HOURS_LABEL = { day: 'Jour seulement', day_night: 'Jour et nuit' };

// "Château" and "chateau" must match: lowercase and drop accents.
const simplify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function matches(stand: Stand, query: string) {
  const q = simplify(query);
  return q === '' || stand.destinations.some((d) => simplify(d).includes(q));
}

// Google wants lat,lng here (the opposite of GeoJSON).
// The Maps app ignores travelmode=walking in the web link (tested on the emulator),
// so Android uses google.navigation with mode=w, and the web link is the fallback.
export const walkingNavUrl = (s: Stand) => `google.navigation:q=${s.lat},${s.lng}&mode=w`;
export const walkingWebUrl = (s: Stand) =>
  `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking`;
