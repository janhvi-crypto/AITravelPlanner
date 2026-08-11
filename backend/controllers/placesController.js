const PLACES_DATA = [
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    rating: 4.7,
    reviews: 2841,
    tags: ["Heritage", "Shopping", "Photography"],
    blurb: "Forts, bazaars and pink sandstone facades glowing at golden hour.",
    bestTime: "October – March",
    weather: { city: "Jaipur", temp: 28, condition: "Clear sky", humidity: 55, rain_chance: 5, advice: "Great weather to visit — ideal for sightseeing and fort walks.", suitable: true },
    mustTry: ["Dal Baati Churma", "Pyaaz Kachori", "Lassi at Lassiwala"],
    safety: ["Pre-paid autos from railway station", "Avoid gem-shop touts near Hawa Mahal"],
  },
  {
    slug: "goa",
    name: "Goa",
    state: "Goa",
    rating: 4.6,
    reviews: 5120,
    tags: ["Beaches", "Nightlife", "Adventure"],
    blurb: "Coastline, water sports, Portuguese lanes and long sunset evenings.",
    bestTime: "November – February",
    weather: { city: "Goa", temp: 31, condition: "Partly cloudy", humidity: 65, rain_chance: 20, advice: "Warm and breezy — beaches before 10 AM, water sports after 3 PM.", suitable: true },
    mustTry: ["Goan Fish Curry", "Bebinca", "Prawn Balchão"],
    safety: ["Swim only in lifeguard-flagged zones", "Rent scooters with valid licence"],
  },
  {
    slug: "kerala",
    name: "Alleppey",
    state: "Kerala",
    rating: 4.8,
    reviews: 3390,
    tags: ["Nature", "Relaxation", "Backwaters"],
    blurb: "Houseboats drifting through palm-lined backwaters at first light.",
    bestTime: "September – March",
    weather: { city: "Alleppey", temp: 27, condition: "Light rain", humidity: 80, rain_chance: 70, advice: "Rain expected — book a covered houseboat and keep indoor plans ready.", suitable: false },
    mustTry: ["Karimeen Pollichathu", "Appam with stew", "Tender coconut"],
    safety: ["Life jackets on shikara rides", "Carry mosquito repellent"],
  },
  {
    slug: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    rating: 4.5,
    reviews: 4103,
    tags: ["Mountains", "Hiking", "Snow"],
    blurb: "Pine valleys, snow passes and cafés with a view of the Beas.",
    bestTime: "December – February, May – June",
    weather: { city: "Manali", temp: 6, condition: "Snow showers", humidity: 75, rain_chance: 45, advice: "Cold snap — thermals essential, Rohtang road may close by afternoon.", suitable: true },
    mustTry: ["Siddu", "Trout fry", "Himachali Dham"],
    safety: ["Check Atal Tunnel status before driving", "Altitude: hydrate on day one"],
  },
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi NCR",
    rating: 4.4,
    reviews: 6210,
    tags: ["Food", "History", "Culture"],
    blurb: "Mughal monuments, street-food alleys and sprawling green boulevards.",
    bestTime: "October – March",
    weather: { city: "Delhi", temp: 24, condition: "Haze", humidity: 50, rain_chance: 10, advice: "Pleasant autumn weather — carry a light jacket for late evenings.", suitable: true },
    mustTry: ["Chole Bhature in Chandni Chowk", "Butter Chicken at Moti Mahal", "Daulat ki Chaat"],
    safety: ["Prefer metro for fast cross-city travel", "Negotiate auto fares or use ride apps"],
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    rating: 4.9,
    reviews: 3890,
    tags: ["Spiritual", "Ghats", "Heritage"],
    blurb: "Sunrise boat rides, evening Ganga aarti and timeless narrow alleys.",
    bestTime: "November – February",
    weather: { city: "Varanasi", temp: 22, condition: "Clear sky", humidity: 58, rain_chance: 0, advice: "Ideal spiritual retreat conditions — chilly early mornings on the ghats.", suitable: true },
    mustTry: ["Malaiyo (winters)", "Kachori Sabzi at Ram Bhandar", "Banarasi Paan"],
    safety: ["Beware of fake guides at Dashashwamedh Ghat", "Keep shoes safe near temples"],
  },
];

const listPlaces = (req, res) => {
  const { search } = req.query;
  let results = PLACES_DATA;
  if (search) {
    const q = String(search).trim().toLowerCase();
    results = PLACES_DATA.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  res.json(results);
};

const getPlaceBySlug = (req, res) => {
  const { slug } = req.params;
  const place = PLACES_DATA.find((p) => p.slug.toLowerCase() === String(slug).toLowerCase());
  if (!place) {
    return res.status(404).json({ message: "Place not found" });
  }
  res.json(place);
};

const getRecommendedPlaces = (_req, res) => {
  const recommended = PLACES_DATA.filter((p) => p.weather.suitable).slice(0, 4);
  res.json(recommended);
};

module.exports = {
  listPlaces,
  getPlaceBySlug,
  getRecommendedPlaces,
};
