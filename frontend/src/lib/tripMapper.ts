import type { Itinerary, TripPreferences } from "@/services/api";
import type { StoredTrip } from "@/lib/tripStore";

/** Shape returned by GET /trip/history and GET /trip/:id */
export interface SavedTripRow {
  id: string;
  title?: string | null;
  destination: string;
  destination_slug?: string | null;
  budget: number;
  days: number;
  people?: number | null;
  transport?: string | null;
  food_preference?: string | null;
  travel_style?: string | null;
  interests?: string[] | null;
  safety_preference?: string | null;
  pet_friendly?: boolean | null;
  festival_music?: string | null;
  plan?: Partial<Itinerary> | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

/** Make sure plan fields exist so the itinerary page never crashes on old rows. */
export function normalizePlan(plan: Partial<Itinerary> | null | undefined, prefs?: Partial<TripPreferences>): Itinerary {
  const p = plan || {};
  const destination = prefs?.destination || "Trip";
  const days = Number(prefs?.days || 1);
  const budget = Number(prefs?.budget || 0);

  return {
    overview: (p.overview as Record<string, string>) || {
      Destination: destination,
      Duration: `${days} Days`,
      Budget: `₹${budget.toLocaleString("en-IN")}`,
    },
    itinerary: asArray(p.itinerary).map((day, i) => ({
      day: Number(day?.day ?? i + 1),
      title: day?.title,
      weather: day?.weather,
      blocks: asArray(day?.blocks).map((b) => ({
        time: b?.time || "Day",
        activity: b?.activity || "Explore",
        detail: b?.detail,
        cost: typeof b?.cost === "number" ? b.cost : undefined,
      })),
    })),
    places: asArray(p.places).map((x) => ({
      name: x?.name || "Place",
      category: x?.category || "Attraction",
      note: x?.note,
    })),
    packing_list: asArray(p.packing_list, ["Government ID", "Charger"]).map(String),
    travel_checklist: asArray(p.travel_checklist, ["Confirm stay"]).map(String),
    budget_breakdown: (p.budget_breakdown as Record<string, number>) || {
      Accommodation: Math.round(budget * 0.4),
      Food: Math.round(budget * 0.25),
      Transportation: Math.round(budget * 0.15),
      Activities: Math.round(budget * 0.15),
      Miscellaneous: Math.round(budget * 0.05),
    },
    transport_plan: asArray(p.transport_plan).map((t) => ({
      route: t?.route || "Local transit",
      mode: t?.mode || "Cab",
      cost: Number(t?.cost || 0),
      duration: t?.duration || "30 mins",
    })),
    must_try_food: asArray(p.must_try_food).map((f) => ({
      name: f?.name || "Local speciality",
      where: f?.where,
      cost: typeof f?.cost === "number" ? f.cost : undefined,
    })),
    safety_tips: asArray(p.safety_tips, ["Keep valuables secure"]).map(String),
    cultural_etiquette: asArray(p.cultural_etiquette, ["Respect local customs"]).map(String),
    daily_costs: asArray(p.daily_costs).map((d, i) => ({
      day: Number(d?.day ?? i + 1),
      total: Number(d?.total || 0),
      items: d?.items,
    })),
  };
}

export function tripRowToStored(row: SavedTripRow): StoredTrip {
  const prefs: TripPreferences = {
    destination: row.destination,
    budget: Number(row.budget || 0),
    days: Number(row.days || 1),
    people: Number(row.people || 1),
    transport: row.transport || "Car",
    food_preference: row.food_preference || "Local cuisine",
    travel_style: row.travel_style || "Sightseeing",
    interests: Array.isArray(row.interests) ? row.interests : [],
    safety_preference: row.safety_preference || undefined,
    pet_friendly: Boolean(row.pet_friendly),
    festival_music: row.festival_music || undefined,
  };

  return {
    prefs,
    data: normalizePlan(row.plan, prefs),
    source: "api",
  };
}

export function formatTripDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
