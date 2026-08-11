import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Search, Sparkles, Sun } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PlaceCard } from "@/components/PlaceCard";
import { Input } from "@/components/ui/input";
import { PLACES, REVIEWS } from "@/services/sampleData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Discover destinations — AI Travel Planner" },
      {
        name: "description",
        content:
          "Search Indian destinations, check live weather and get AI recommendations tuned to today's conditions and your travel style.",
      },
      { property: "og:title", content: "Discover destinations — AI Travel Planner" },
      {
        property: "og:description",
        content: "Search Indian destinations with live weather and AI recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [query, setQuery] = useState("");

  // GET /places?search=&region=india  → replace PLACES with the API response
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLACES;
    return PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const recommended = PLACES.filter((p) => p.weather.suitable).slice(0, 3);
  const today = PLACES[0]!;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-4xl sm:text-5xl">Where to next?</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Search any destination in India. We check the weather first, then plan.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, states or interests…"
              className="h-13 pl-11 text-base"
            />
          </div>
          <div className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3">
            <Sun className="h-8 w-8 text-primary" />
            <div>
              <p className="label-caps">Weather · {today.weather.city}</p>
              <p className="text-lg font-semibold">
                {today.weather.temp}°C · {today.weather.condition}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Recommended for you</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on today's weather, your saved preferences and traveller ratings.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recommended.map((p) => (
              <div key={p.slug} className="glass-panel rounded-xl p-4">
                <p className="font-display text-xl">{p.name}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p.weather.advice}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">
            {query ? `Results for "${query}"` : "Popular across India"}
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PlaceCard key={p.slug} place={p} />
            ))}
          </div>
          {results.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              No match yet — the live search hits GET /places?search= once the backend is connected.
            </p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold">Latest traveller reviews</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <article key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.place}</p>
                  <span className="text-primary">{"★".repeat(r.rating)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {r.author} · {r.category} · {r.createdAt}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-accent/35 bg-accent/10 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <CloudRain className="h-4 w-4 text-accent" /> Weather alert
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rain is expected in Alleppey today. We recommend indoor attractions and a covered
            houseboat instead of open shikara rides.
          </p>
        </section>
      </main>
    </div>
  );
}