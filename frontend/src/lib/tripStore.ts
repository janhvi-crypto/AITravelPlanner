import type { Itinerary, TripPreferences } from "@/services/api";

const KEY = "atp_last_trip";

export interface StoredTrip {
  prefs: TripPreferences;
  data: Itinerary;
  source: "api" | "sample";
}

export function storeTrip(trip: StoredTrip) {
  window.sessionStorage.setItem(KEY, JSON.stringify(trip));
}

export function readTrip(): StoredTrip | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as StoredTrip) : null;
}