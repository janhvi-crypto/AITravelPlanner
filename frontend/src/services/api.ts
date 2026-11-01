import axios from "axios";

/**
 * ---------------------------------------------------------------------------
 * BACKEND CONTRACT (Express + Supabase — built by the backend team)
 * ---------------------------------------------------------------------------
 * Base URL comes from VITE_API_BASE_URL (e.g. https://your-app.onrender.com).
 * Every call below is the ONLY place the frontend talks to the server.
 *
 *  AUTH
 *   POST   /auth/signup           { email, password, name }      -> { token, user }
 *   POST   /auth/login            { email, password }            -> { token, user }
 *   POST   /auth/logout                                          -> 204
 *   GET    /auth/profile                                         -> { user }
 *
 *  PLACES / DASHBOARD
 *   GET    /places?search=&region=india                          -> Place[]
 *   GET    /places/:slug                                         -> Place
 *   GET    /places/recommended                                   -> Place[]  (weather + preference aware)
 *
 *  WEATHER (OpenWeather proxy)
 *   GET    /weather?city=Jaipur                                  -> Weather
 *
 *  REVIEWS
 *   GET    /reviews?place=delhi                                  -> Review[]
 *   POST   /reviews  { place, rating, text, category, location } -> Review
 *          (auth required — saved to Supabase `reviews` table)
 *
 *  TRIPS (CRUD already implemented on the backend)
 *   POST   /trip/generate  { destination, budget, days, people,
 *                            transport, food_preference,
 *                            travel_style, interests[] }          -> Itinerary JSON
 *   POST   /trip/save            { ...itinerary }                -> Trip
 *   GET    /trip/history                                         -> Trip[]
 *   GET    /trip/:id                                             -> Trip
 *   PUT    /trip/:id                                             -> Trip
 *   DELETE /trip/delete/:id                                      -> 204
 *   POST   /trip/pdf             { ...itinerary }                -> application/pdf blob
 * ---------------------------------------------------------------------------
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

const TOKEN_KEY = "atp_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ----------------------------- Types ----------------------------- */

export interface TripPreferences {
  destination: string;
  budget: number;
  days: number;
  people: number;
  transport: string;
  food_preference: string;
  travel_style: string;
  interests: string[];
  safety_preference?: string;
  pet_friendly?: boolean;
  festival_music?: string;
}

export interface Itinerary {
  overview: Record<string, string>;
  itinerary: Array<{
    day: number;
    title?: string;
    weather?: string;
    blocks: Array<{ time: string; activity: string; detail?: string; cost?: number }>;
  }>;
  places: Array<{ name: string; category: string; note?: string }>;
  packing_list: string[];
  travel_checklist: string[];
  budget_breakdown: Record<string, number>;
  transport_plan: Array<{ route: string; mode: string; cost: number; duration: string }>;
  must_try_food: Array<{ name: string; where?: string; cost?: number }>;
  safety_tips: string[];
  cultural_etiquette: string[];
  daily_costs: Array<{ day: number; total: number; items?: Record<string, number> }>;
}

export interface Weather {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  rain_chance: number;
  advice: string;
  suitable: boolean;
}

/* ----------------------------- Calls ----------------------------- */

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post("/auth/signup", { name, email, password }),
  profile: () => api.get("/auth/profile"),
};

export const placesApi = {
  list: (search?: string) => api.get("/places", { params: { search, region: "india" } }),
  detail: (slug: string) => api.get(`/places/${slug}`),
  recommended: () => api.get("/places/recommended"),
};

/** Unwrap `{ success, data|trips|trip }` payloads from the Express backend. */
function unwrap<T = unknown>(payload: any): T {
  if (payload == null) return payload as T;
  // Prefer explicit collections first (history returns { trips: [...] })
  if (Array.isArray(payload.trips)) return payload.trips as T;
  if (payload.trip != null && typeof payload.trip === "object") return payload.trip as T;
  if (payload.data != null && typeof payload.data === "object") return payload.data as T;
  return payload as T;
}

export const weatherApi = {
  get: async (city: string) => {
    const res = await api.get("/weather", { params: { city } });
    const body = res.data as any;
    // Prefer flattened frontend Weather fields when present
    const weather: Weather =
      body?.temp != null
        ? body
        : unwrap<Weather>(body);
    return { ...res, data: weather };
  },
};

export const reviewsApi = {
  list: (place?: string) => api.get("/reviews", { params: { place } }),
  create: (payload: {
    place: string;
    category: string;
    rating: number;
    text: string;
    location?: string;
  }) => api.post("/reviews", payload),
};

export const tripApi = {
  generate: async (prefs: TripPreferences) => {
    const res = await api.post("/trip/generate", prefs);
    return { ...res, data: unwrap<Itinerary>(res.data) };
  },
  save: async (data: unknown) => {
    const res = await api.post("/trip/save", data);
    return { ...res, data: unwrap(res.data) };
  },
  history: async () => {
    const res = await api.get("/trip/history");
    return { ...res, data: unwrap(res.data) };
  },
  byId: async (id: string) => {
    const res = await api.get(`/trip/${id}`);
    return { ...res, data: unwrap(res.data) };
  },
  update: (id: string, data: unknown) => api.put(`/trip/${id}`, data),
  remove: (id: string) => api.delete(`/trip/delete/${id}`),
  pdf: (data: unknown) => api.post("/trip/pdf", data, { responseType: "blob" }),
};