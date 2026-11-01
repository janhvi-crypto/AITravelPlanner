import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CloudRain, MapPin, Shield, Star, Sun, Utensils } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ItineraryFormDialog } from "@/components/ItineraryFormDialog";
import { reviewsApi } from "@/services/api";
import { PLACES, REVIEWS, type Review } from "@/services/sampleData";

export const Route = createFileRoute("/places/$slug")({
  head: ({ params }) => {
    const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
    return {
      meta: [
        { title: `${name} travel guide — AI Travel Planner` },
        {
          name: "description",
          content: `Weather, reviews, must-try food and safety tips for ${name}, plus an AI-generated day-wise itinerary built around your budget.`,
        },
        { property: "og:title", content: `${name} travel guide — AI Travel Planner` },
        {
          property: "og:description",
          content: `Plan ${name} with weather-aware AI itineraries, budgets and food guides.`,
        },
      ],
    };
  },
  component: PlacePage,
});

function PlacePage() {
  const { slug } = Route.useParams();
  const [open, setOpen] = useState(false);
  const [placeReviews, setPlaceReviews] = useState<Review[]>([]);
  // GET /places/:slug  → replace this lookup with the API response
  const place = PLACES.find((p) => p.slug === slug);

  useEffect(() => {
    if (!place) return;
    reviewsApi
      .list(place.name)
      .then((res) => {
        const rows = Array.isArray(res.data) ? (res.data as Review[]) : [];
        setPlaceReviews(rows.length ? rows : REVIEWS.filter((r) => r.place === place.name));
      })
      .catch(() => {
        setPlaceReviews(REVIEWS.filter((r) => r.place === place.name));
      });
  }, [place]);

  if (!place) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Destination not found</h1>
          <p className="mt-2 text-muted-foreground">
            Once GET /places/:slug is live, any Indian destination will resolve here.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-primary underline underline-offset-4">
            Back to discover
          </Link>
        </main>
      </div>
    );
  }

  const reviews = placeReviews.length
    ? placeReviews
    : REVIEWS.filter((r) => r.place === place.name);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="relative h-[46vh] min-h-80">
        <img
          src={place.image}
          alt={`${place.name}, ${place.state}`}
          width={1200}
          height={800}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--gradient-veil)]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8">
          <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Discover
          </Link>
          <h1 className="font-display text-5xl sm:text-6xl">{place.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {place.state}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" /> {place.rating} ·{" "}
              {place.reviews.toLocaleString("en-IN")} reviews
            </span>
            <span>Best time: {place.bestTime}</span>
          </p>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <p className="text-lg text-muted-foreground">{place.blurb}</p>

          <section
            className={`rounded-xl border p-5 ${
              place.weather.suitable ? "border-primary/35 bg-primary/10" : "border-accent/35 bg-accent/10"
            }`}
          >
            <p className="flex items-center gap-2 font-semibold">
              {place.weather.suitable ? (
                <>
                  <Sun className="h-4 w-4 text-primary" /> Great weather to visit
                </>
              ) : (
                <>
                  <CloudRain className="h-4 w-4 text-accent" /> Weather alert
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{place.weather.advice}</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="label-caps">Temp</p>
                <p className="font-semibold">{place.weather.temp}°C</p>
              </div>
              <div>
                <p className="label-caps">Humidity</p>
                <p className="font-semibold">{place.weather.humidity}%</p>
              </div>
              <div>
                <p className="label-caps">Rain chance</p>
                <p className="font-semibold">{place.weather.rain_chance}%</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Traveller reviews</h2>
            <div className="mt-4 space-y-3">
              {(reviews.length ? reviews : REVIEWS).map((r) => (
                <article key={r.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.author}</p>
                    <span className="text-primary">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {r.category}
                    {r.location ? ` · ${r.location}` : ""} · {r.createdAt}
                  </p>
                </article>
              ))}
            </div>
            <Link to="/reviews" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
              Write your own review
            </Link>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="glass-panel rounded-xl p-5">
            <p className="font-display text-xl">Plan this trip</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us your budget and style — the AI builds a day-wise plan.
            </p>
            <Button className="mt-4 w-full" size="lg" onClick={() => setOpen(true)}>
              Generate Itinerary
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Utensils className="h-4 w-4 text-primary" /> Must try
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {place.mustTry.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4 text-accent" /> Safety tips
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {place.safety.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>

          <div className="grid h-44 place-items-center rounded-xl border border-dashed border-border bg-secondary/40 text-center text-sm text-muted-foreground">
            <span>
              Map view
              <br />
              <span className="text-xs">Google Maps / Mapbox markers mount here</span>
            </span>
          </div>
        </aside>
      </main>

      <ItineraryFormDialog open={open} onOpenChange={setOpen} destination={place.name} />
    </div>
  );
}