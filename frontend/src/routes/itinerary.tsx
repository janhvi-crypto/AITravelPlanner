import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Backpack,
  CheckCircle2,
  CloudRain,
  Download,
  Share2,
  Sun,
  Trash2,
  Utensils,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getToken, reviewsApi, tripApi } from "@/services/api";
import { readTrip, storeTrip, type StoredTrip } from "@/lib/tripStore";
import {
  formatTripDate,
  tripRowToStored,
  type SavedTripRow,
} from "@/lib/tripMapper";
import type { Review } from "@/services/sampleData";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Your AI itinerary — AI Travel Planner" },
      {
        name: "description",
        content:
          "A day-wise AI itinerary with budget breakdown, transport plan, must-try food, packing list, safety tips and weather-aware advice.",
      },
      { property: "og:title", content: "Your AI itinerary — AI Travel Planner" },
      {
        property: "og:description",
        content: "Day-wise plan, budget split, food, packing list and weather-aware advice.",
      },
    ],
  }),
  component: ItineraryPage,
});

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ItineraryPage() {
  const [trip, setTrip] = useState<StoredTrip | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedTripRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [saving, setSaving] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!getToken()) {
      setHistory([]);
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await tripApi.history();
      const rows = Array.isArray(res.data) ? (res.data as SavedTripRow[]) : [];
      setHistory(rows);

      const session = readTrip();
      if (session) {
        setTrip(session);
        // Prefer matching a saved row for the same destination if possible
        const match = rows.find(
          (r) =>
            r.destination?.toLowerCase() === session.prefs.destination.toLowerCase() &&
            Number(r.days) === Number(session.prefs.days),
        );
        setActiveTripId(match?.id ?? null);
      } else if (rows[0]) {
        const stored = tripRowToStored(rows[0]);
        setTrip(stored);
        setActiveTripId(rows[0].id);
        storeTrip(stored);
      } else {
        setTrip(null);
        setActiveTripId(null);
      }
    } catch {
      setHistory([]);
      const session = readTrip();
      setTrip(session);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!trip?.prefs?.destination) {
      setPublicReviews([]);
      return;
    }
    reviewsApi
      .list(trip.prefs.destination)
      .then((res) => {
        const rows = Array.isArray(res.data) ? (res.data as Review[]) : [];
        setPublicReviews(rows.slice(0, 6));
      })
      .catch(() => setPublicReviews([]));
  }, [trip?.prefs?.destination]);

  function openSavedTrip(row: SavedTripRow) {
    const stored = tripRowToStored(row);
    setTrip(stored);
    setActiveTripId(row.id);
    storeTrip(stored);
  }

  async function downloadPdf() {
    if (!trip) return;
    try {
      const res = await tripApi.pdf(trip.data);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip.prefs.destination}-itinerary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download PDF");
    }
  }

  async function saveTrip() {
    if (!trip) return;
    if (!getToken()) {
      toast.error("Please sign in to save trips to Supabase");
      return;
    }
    setSaving(true);
    try {
      const saved = (await tripApi.save({ ...trip.prefs, plan: trip.data })) as {
        data?: SavedTripRow;
      };
      toast.success("Trip saved to your history");
      await loadHistory();
      if (saved?.data?.id) setActiveTripId(saved.data.id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save trip";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrip(id: string) {
    if (!getToken()) return;
    try {
      await tripApi.remove(id);
      toast.success("Trip removed");
      if (activeTripId === id) {
        setActiveTripId(null);
        setTrip(null);
      }
      await loadHistory();
    } catch {
      toast.error("Could not delete trip");
    }
  }

  const empty = !trip && !loadingHistory;

  if (empty) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-4xl">No itinerary yet</h1>
          <p className="mt-3 text-muted-foreground">
            {getToken()
              ? "Generate a plan from a destination, then tap Save trip — it will show up here from Supabase."
              : "Sign in, pick a destination, and generate an itinerary to build your history."}
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-primary underline underline-offset-4">
            Browse destinations
          </Link>
        </main>
      </div>
    );
  }

  const prefs = trip?.prefs;
  const data = trip?.data;
  const budgetTotal =
    data && Object.values(data.budget_breakdown).reduce((a, b) => a + b, 0)
      ? Object.values(data.budget_breakdown).reduce((a, b) => a + b, 0)
      : 1;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <div>
            <h2 className="text-lg font-semibold">My itineraries</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Past trips saved for your account.
            </p>
          </div>

          {!getToken() && (
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Sign in to load your Supabase trip history.
            </p>
          )}

          {getToken() && loadingHistory && (
            <p className="text-sm text-muted-foreground">Loading saved trips…</p>
          )}

          {getToken() && !loadingHistory && history.length === 0 && (
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              No saved trips yet. Open a plan and click <span className="font-medium">Save trip</span>.
            </p>
          )}

          <div className="space-y-2">
            {history.map((row) => {
              const active = row.id === activeTripId;
              return (
                <div
                  key={row.id}
                  className={`rounded-xl border p-3 transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => openSavedTrip(row)}>
                    <p className="font-medium">{row.title || `${row.destination} · ${row.days} days`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ₹{Number(row.budget).toLocaleString("en-IN")} · {formatTripDate(row.created_at)}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => void deleteTrip(row.id)}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          {!trip || !prefs || !data ? (
            <section className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Select a saved trip from the left, or generate a new one from Discover.
            </section>
          ) : (
            <>
              <header className="glass-panel rounded-xl p-6">
                <p className="label-caps">Personalised plan</p>
                <h1 className="font-display text-4xl sm:text-5xl">
                  {prefs.destination} — {prefs.days} Days
                </h1>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(data.overview)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k}>
                        <p className="label-caps">{k}</p>
                        <p className="font-semibold">{v}</p>
                      </div>
                    ))}
                </div>
                {data.overview["Experience"] && (
                  <p className="mt-5 text-sm text-muted-foreground">{data.overview["Experience"]}</p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => void downloadPdf()}>
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                  <Button variant="secondary" disabled={saving} onClick={() => void saveTrip()}>
                    {saving ? "Saving…" : "Save trip"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Shareable link copied");
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </header>

              <Section title="Budget breakdown" icon={<Wallet className="h-4 w-4 text-primary" />}>
                <div className="space-y-3">
                  {Object.entries(data.budget_breakdown).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-sm">
                        <span>{k}</span>
                        <span className="font-semibold">₹{v.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.round((v / budgetTotal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="space-y-5">
                {data.itinerary.map((day) => (
                  <section key={day.day} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-2xl">
                        Day {day.day}
                        {day.title ? ` · ${day.title}` : ""}
                      </h2>
                      {day.weather && (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {day.weather.toLowerCase().includes("rain") ? (
                            <CloudRain className="h-4 w-4 text-accent" />
                          ) : (
                            <Sun className="h-4 w-4 text-primary" />
                          )}
                          {day.weather}
                        </span>
                      )}
                    </div>
                    <ol className="mt-5 space-y-0">
                      {day.blocks.map((b, i) => (
                        <li key={i} className="flex gap-4 border-l border-border pb-5 pl-5 last:pb-0">
                          <div className="-ml-[27px] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="label-caps">{b.time}</p>
                            <p className="font-medium">{b.activity}</p>
                            {b.detail && <p className="text-sm text-muted-foreground">{b.detail}</p>}
                          </div>
                          {typeof b.cost === "number" && (
                            <span className="text-sm text-muted-foreground">₹{b.cost}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                    {data.daily_costs.find((d) => d.day === day.day) && (
                      <p className="mt-4 border-t border-border pt-4 text-sm">
                        Estimated day total:{" "}
                        <span className="font-semibold text-primary">
                          ₹
                          {data.daily_costs
                            .find((d) => d.day === day.day)!
                            .total.toLocaleString("en-IN")}
                        </span>
                      </p>
                    )}
                  </section>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="Places to visit">
                  <ul className="space-y-2 text-sm">
                    {data.places.map((p) => (
                      <li key={p.name} className="flex items-start justify-between gap-3">
                        <span>
                          <span className="font-medium">{p.name}</span>
                          {p.note && <span className="block text-muted-foreground">{p.note}</span>}
                        </span>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px]">
                          {p.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Must-try food" icon={<Utensils className="h-4 w-4 text-primary" />}>
                  <ul className="space-y-2 text-sm">
                    {data.must_try_food.map((f) => (
                      <li key={f.name} className="flex justify-between gap-3">
                        <span>
                          <span className="font-medium">{f.name}</span>
                          {f.where && <span className="block text-muted-foreground">{f.where}</span>}
                        </span>
                        {f.cost != null && <span className="text-muted-foreground">₹{f.cost}</span>}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Transport plan">
                  <ul className="space-y-2 text-sm">
                    {data.transport_plan.map((t) => (
                      <li key={t.route} className="flex justify-between gap-3">
                        <span>
                          <span className="font-medium">{t.route}</span>
                          <span className="block text-muted-foreground">
                            {t.mode} · {t.duration}
                          </span>
                        </span>
                        <span className="text-muted-foreground">₹{t.cost}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Packing list" icon={<Backpack className="h-4 w-4 text-primary" />}>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {data.packing_list.map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </Section>

                <Section title="Travel checklist" icon={<CheckCircle2 className="h-4 w-4 text-primary" />}>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {data.travel_checklist.map((c) => (
                      <li key={c}>· {c}</li>
                    ))}
                  </ul>
                </Section>

                <Section title="Safety & cultural etiquette">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[...data.safety_tips, ...data.cultural_etiquette].map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                </Section>
              </div>

              <Section title={`Public reviews · ${prefs.destination}`}>
                {publicReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No public reviews for {prefs.destination} yet.{" "}
                    <Link to="/reviews" className="text-primary underline underline-offset-4">
                      Be the first to share tips
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {publicReviews.map((r) => (
                      <article key={r.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                        <div className="flex items-center justify-between gap-3">
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
                )}
                <Link
                  to="/reviews"
                  className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
                >
                  Write a review for {prefs.destination}
                </Link>
              </Section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
