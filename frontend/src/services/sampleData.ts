import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import manali from "@/assets/dest-manali.jpg";
import delhi from "@/assets/dest-delhi.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";
import type { Itinerary, Weather } from "./api";

/**
 * Sample data used ONLY as a fallback while the Express backend is not
 * reachable, so the UI can be developed and demoed. Every screen prefers the
 * real API response when the call succeeds.
 */

export interface Place {
  slug: string;
  name: string;
  state: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  blurb: string;
  bestTime: string;
  weather: Weather;
  mustTry: string[];
  safety: string[];
}

const w = (
  city: string,
  temp: number,
  condition: string,
  rain: number,
  advice: string,
  suitable: boolean,
): Weather => ({ city, temp, condition, humidity: 55, rain_chance: rain, advice, suitable });

export const PLACES: Place[] = [
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    image: jaipur,
    rating: 4.7,
    reviews: 2841,
    tags: ["Heritage", "Shopping", "Photography"],
    blurb: "Forts, bazaars and pink sandstone facades glowing at golden hour.",
    bestTime: "October – March",
    weather: w("Jaipur", 28, "Clear sky", 5, "Great weather to visit — ideal for sightseeing and fort walks.", true),
    mustTry: ["Dal Baati Churma", "Pyaaz Kachori", "Lassi at Lassiwala"],
    safety: ["Pre-paid autos from railway station", "Avoid gem-shop touts near Hawa Mahal"],
  },
  {
    slug: "goa",
    name: "Goa",
    state: "Goa",
    image: goa,
    rating: 4.6,
    reviews: 5120,
    tags: ["Beaches", "Nightlife", "Adventure"],
    blurb: "Coastline, water sports, Portuguese lanes and long sunset evenings.",
    bestTime: "November – February",
    weather: w("Goa", 31, "Partly cloudy", 20, "Warm and breezy — beaches before 10 AM, water sports after 3 PM.", true),
    mustTry: ["Goan Fish Curry", "Bebinca", "Prawn Balchão"],
    safety: ["Swim only in lifeguard-flagged zones", "Rent scooters with valid licence"],
  },
  {
    slug: "kerala",
    name: "Alleppey",
    state: "Kerala",
    image: kerala,
    rating: 4.8,
    reviews: 3390,
    tags: ["Nature", "Relaxation", "Backwaters"],
    blurb: "Houseboats drifting through palm-lined backwaters at first light.",
    bestTime: "September – March",
    weather: w("Alleppey", 27, "Light rain", 70, "Rain expected — book a covered houseboat and keep indoor plans ready.", false),
    mustTry: ["Karimeen Pollichathu", "Appam with stew", "Tender coconut"],
    safety: ["Life jackets on shikara rides", "Carry mosquito repellent"],
  },
  {
    slug: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    image: manali,
    rating: 4.5,
    reviews: 4103,
    tags: ["Mountains", "Hiking", "Snow"],
    blurb: "Pine valleys, snow passes and cafés with a view of the Beas.",
    bestTime: "December – February, May – June",
    weather: w("Manali", 6, "Snow showers", 45, "Cold snap — thermals essential, Rohtang road may close by afternoon.", true),
    mustTry: ["Siddu", "Trout fry", "Himachali Dham"],
    safety: ["Check Atal Tunnel status before driving", "Altitude: hydrate on day one"],
  },
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi NCR",
    image: delhi,
    rating: 4.4,
    reviews: 7620,
    tags: ["Historical", "Food", "Markets"],
    blurb: "Mughal monuments, Old Delhi food trails and a metro that reaches all of it.",
    bestTime: "October – March",
    weather: w("Delhi", 24, "Haze", 10, "Pleasant day — perfect for monuments, but avoid 1–4 PM outdoors.", true),
    mustTry: ["Chandni Chowk parathas", "Butter chicken", "Daulat ki Chaat"],
    safety: ["Use metro or app cabs after dark", "Tourist police helpline 1363"],
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    image: varanasi,
    rating: 4.6,
    reviews: 2980,
    tags: ["Culture", "Spiritual", "Photography"],
    blurb: "Sunrise boat rides, ghat rituals and the oldest lanes in the country.",
    bestTime: "October – March",
    weather: w("Varanasi", 26, "Clear sky", 5, "Clear morning — the 5:30 AM boat ride is highly recommended today.", true),
    mustTry: ["Kachori Sabzi", "Banarasi Paan", "Malaiyo"],
    safety: ["Fixed-rate boats only", "Respect photography limits at cremation ghats"],
  },
];

export interface Review {
  id: string;
  place: string;
  author: string;
  rating: number;
  category: string;
  text: string;
  location?: string;
  createdAt: string;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    place: "Delhi",
    author: "Ananya S.",
    rating: 5,
    category: "Food",
    text: "Great place to visit! Must try the parathas at Gali Paranthe Wali — go before noon, the queue triples after.",
    location: "Chandni Chowk, Delhi",
    createdAt: "2 days ago",
  },
  {
    id: "r2",
    place: "Goa",
    author: "Rahul M.",
    rating: 4,
    category: "Hotels",
    text: "Stayed near Ashwem — quieter than Baga and half the price. Scooter is a must, cabs are expensive here.",
    location: "Ashwem Beach, Goa",
    createdAt: "1 week ago",
  },
  {
    id: "r3",
    place: "Jaipur",
    author: "Priya K.",
    rating: 5,
    category: "Places",
    text: "Nahargarh Fort at sunset is unbeatable. Skip the paid guide, download the audio tour instead.",
    location: "Nahargarh, Jaipur",
    createdAt: "3 weeks ago",
  },
];

export function sampleItinerary(
  destination: string,
  days: number,
  budget: number,
  people: number,
): Itinerary {
  const perDay = Math.round(budget / Math.max(days, 1));
  return {
    overview: {
      Destination: destination,
      Duration: `${days} Days`,
      "Estimated Budget": `₹${budget.toLocaleString("en-IN")}`,
      Travellers: `${people}`,
      "Best Time": "October – February",
      Experience: `A balanced ${days}-day plan across ${destination} mixing landmark sights, local food streets and slower evenings.`,
    },
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? "Arrival & old city" : i === days - 1 ? "Markets & departure" : "Sights & local flavour",
      weather: i % 3 === 2 ? "Light rain expected — indoor plan first" : "Clear, 26–30°C",
      blocks: [
        { time: "8:00 AM", activity: "Breakfast at a local café", detail: "Try the regional breakfast plate", cost: 250 },
        { time: "9:30 AM", activity: `Main landmark of ${destination}`, detail: "Reach early to avoid queues", cost: 500 },
        { time: "1:00 PM", activity: "Lunch", detail: "Budget thali near the site", cost: 400 },
        { time: "3:30 PM", activity: "Afternoon activity", detail: "Museum / water sport / trek depending on weather", cost: 800 },
        { time: "6:30 PM", activity: "Sunset point", detail: "Best golden-hour spot in the city", cost: 0 },
        { time: "8:30 PM", activity: "Dinner + night walk", detail: "Local speciality restaurant", cost: 700 },
      ],
    })),
    places: [
      { name: "Signature landmark", category: "Popular", note: "Book online to skip the counter" },
      { name: "Quiet viewpoint", category: "Hidden Gem", note: "Best at sunrise" },
      { name: "City museum", category: "Historical" },
      { name: "Old market lane", category: "Shopping" },
      { name: "Riverside promenade", category: "Photography" },
      { name: "Neighbourhood park", category: "Family Friendly" },
    ],
    packing_list: [
      "ID proof & tickets",
      "Power bank",
      "Sunscreen SPF 50",
      "Comfortable walking shoes",
      "Reusable water bottle",
      "Light rain jacket",
      "Basic medicines",
    ],
    travel_checklist: [
      "Hotel booking confirmed",
      "Offline maps downloaded",
      "Cash for local transport",
      "Local SIM / roaming active",
      "Emergency contact shared",
    ],
    budget_breakdown: {
      Hotel: Math.round(budget * 0.34),
      Transport: Math.round(budget * 0.18),
      Food: Math.round(budget * 0.22),
      Activities: Math.round(budget * 0.18),
      Shopping: Math.round(budget * 0.08),
    },
    transport_plan: [
      { route: "Airport → Hotel", mode: "Taxi", cost: 600, duration: "35 min" },
      { route: "Hotel → City centre", mode: "Metro", cost: 60, duration: "25 min" },
      { route: "Day trips", mode: "Rented car", cost: 2200, duration: "Full day" },
    ],
    must_try_food: [
      { name: "Regional thali", where: "Old city", cost: 350 },
      { name: "Street chaat", where: "Main bazaar", cost: 90 },
      { name: "Local dessert", where: "Heritage sweet shop", cost: 120 },
      { name: "Filter coffee / chai", where: "Corner café", cost: 40 },
    ],
    safety_tips: [
      "Use app-based cabs after dark",
      "Keep a digital copy of your ID",
      "Avoid unlicensed guides near ticket counters",
      "Emergency: 112 · Tourist police: 1363",
    ],
    cultural_etiquette: [
      "Remove footwear before entering temples",
      "Cover shoulders and knees at religious sites",
      "Ask before photographing people",
      "Tipping 5–10% is customary at restaurants",
    ],
    daily_costs: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      total: perDay,
      items: { Food: 1350, Travel: 900, Activities: Math.max(perDay - 2250, 300) },
    })),
  };
}