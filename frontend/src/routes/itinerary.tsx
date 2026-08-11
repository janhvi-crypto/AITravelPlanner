import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Backpack,
  CheckCircle2,
  CloudRain,
  Download,
  Share2,
  Sun,
  Utensils,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { tripApi } from "@/services/api";
import { readTrip, type StoredTrip } from "@/lib/tripStore";

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

  useEffect(() => {
    setTrip(readTrip());
  }, []);

  if (!trip) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-4xl">No itinerary yet</h1>
          <p className="mt-3 text-muted-foreground">
            Pick a destination and hit Generate Itinerary — the plan lands here.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-primary underline underline-offset-4">
            Browse destinations
          </Link>
        </main>
      </div>
    );
  }

  const { data, prefs } = trip;
  const budgetTotal = Object.values(data.budget_breakdown).reduce((a, b) => a + b, 0) || 1;

  async function downloadPdf() {
    try {
      // POST {VITE_API_BASE_URL}/trip/pdf  → returns a PDF blob
      const res = await tripApi.pdf(data);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prefs.destination}-itinerary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.info("PDF endpoint not connected yet", {
        description: "POST /trip/pdf will return the file once the server is live.",
      });
    }
  }

  async function saveTrip() {
    try {
      // POST {VITE_API_BASE_URL}/trip/save
      await tripApi.save({ ...prefs, plan: data });
      toast.success("Trip saved to your history");
    } catch {
      toast.info("POST /trip/save will store this once the backend is connected");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-10">
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
            <Button onClick={downloadPdf}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button variant="secondary" onClick={saveTrip}>
              Save trip
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
                    ₹{data.daily_costs.find((d) => d.day === day.day)!.total.toLocaleString("en-IN")}
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

        <div className="grid h-56 place-items-center rounded-xl border border-dashed border-border bg-secondary/40 text-center text-sm text-muted-foreground">
          <span>
            Route map
            <br />
            <span className="text-xs">Google Maps markers for hotels, food stops and attractions</span>
          </span>
        </div>
      </main>
    </div>
  );
}