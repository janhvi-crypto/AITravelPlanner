import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tripApi, type TripPreferences } from "@/services/api";
import { sampleItinerary } from "@/services/sampleData";
import { storeTrip } from "@/lib/tripStore";
import { toast } from "sonner";

const TRANSPORT = ["Car", "Train", "Flight", "Bus", "Bike"];
const FOOD = ["Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Local cuisine"];
const STYLE = ["Adventure", "Relaxation", "Sightseeing", "Shopping", "Nature", "Culture"];
const INTERESTS = ["Beach", "Photography", "Hiking", "Nightlife", "Food", "Historical", "Shopping", "Nature"];
const SAFETY = ["Standard", "Family safe", "Solo woman traveller", "Senior friendly"];
const FESTIVAL = ["Not interested", "Festivals", "Parties", "Live music", "Cultural events"];

function Chips({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: never) => void;
  multi?: boolean;
}) {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (multi) {
                const next = active
                  ? (selected as string[]).filter((s) => s !== opt)
                  : [...(selected as string[]), opt];
                onChange(next as never);
              } else {
                onChange(opt as never);
              }
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const STAGES = [
  "Finding hidden gems…",
  "Checking the weather forecast…",
  "Planning the best routes…",
  "Searching famous local food…",
  "Preparing your packing list…",
];

export function ItineraryFormDialog({
  open,
  onOpenChange,
  destination,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  destination: string;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [prefs, setPrefs] = useState<TripPreferences>({
    destination,
    budget: 30000,
    days: 3,
    people: 2,
    transport: "Car",
    food_preference: "Vegetarian",
    travel_style: "Adventure",
    interests: ["Photography"],
    safety_preference: "Standard",
    pet_friendly: false,
    festival_music: "Not interested",
  });

  const set = <K extends keyof TripPreferences>(k: K, v: TripPreferences[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  async function submit() {
    setLoading(true);
    setStage(0);
    const timer = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1400);
    const payload = { ...prefs, destination };
    try {
      // POST {VITE_API_BASE_URL}/trip/generate
      const { data } = await tripApi.generate(payload);
      storeTrip({ prefs: payload, data, source: "api" });
    } catch {
      toast.info("Backend not reachable — showing a sample plan", {
        description: "POST /trip/generate will replace this once the server is live.",
      });
      storeTrip({
        prefs: payload,
        data: sampleItinerary(destination, payload.days, payload.budget, payload.people),
        source: "sample",
      });
    } finally {
      clearInterval(timer);
      setLoading(false);
      onOpenChange(false);
      navigate({ to: "/itinerary" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="grid h-24 w-24 place-items-center rounded-full border border-primary/40"
            >
              <div className="h-16 w-16 rounded-full border border-dashed border-accent/70" />
            </motion.div>
            <div>
              <p className="font-display text-xl">Crafting your {destination} plan</p>
              <p className="mt-2 text-sm text-muted-foreground">{STAGES[stage]}</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Generate itinerary — {destination}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="label-caps">Budget</Label>
                  <span className="font-display text-lg text-primary">
                    ₹{prefs.budget.toLocaleString("en-IN")}
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={5000}
                  max={200000}
                  step={1000}
                  value={[prefs.budget]}
                  onValueChange={(v) => set("budget", v[0] ?? 5000)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="label-caps">Days</Label>
                  <Input
                    className="mt-2"
                    type="number"
                    min={1}
                    max={21}
                    value={prefs.days}
                    onChange={(e) => set("days", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="label-caps">Number of people</Label>
                  <Input
                    className="mt-2"
                    type="number"
                    min={1}
                    max={20}
                    value={prefs.people}
                    onChange={(e) => set("people", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="label-caps">Transportation</Label>
                <div className="mt-2">
                  <Chips options={TRANSPORT} value={prefs.transport} onChange={(v) => set("transport", v)} />
                </div>
              </div>

              <div>
                <Label className="label-caps">Food preference</Label>
                <div className="mt-2">
                  <Chips options={FOOD} value={prefs.food_preference} onChange={(v) => set("food_preference", v)} />
                </div>
              </div>

              <div>
                <Label className="label-caps">Activity preference</Label>
                <div className="mt-2">
                  <Chips options={STYLE} value={prefs.travel_style} onChange={(v) => set("travel_style", v)} />
                </div>
              </div>

              <div>
                <Label className="label-caps">Interests</Label>
                <div className="mt-2">
                  <Chips options={INTERESTS} value={prefs.interests} multi onChange={(v) => set("interests", v)} />
                </div>
              </div>

              <div>
                <Label className="label-caps">Safety preference</Label>
                <div className="mt-2">
                  <Chips
                    options={SAFETY}
                    value={prefs.safety_preference ?? ""}
                    onChange={(v) => set("safety_preference", v)}
                  />
                </div>
              </div>

              <div>
                <Label className="label-caps">Festivals · parties · music</Label>
                <div className="mt-2">
                  <Chips
                    options={FESTIVAL}
                    value={prefs.festival_music ?? ""}
                    onChange={(v) => set("festival_music", v)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Travelling with a pet</p>
                  <p className="text-xs text-muted-foreground">Filters pet-friendly stays and cafés</p>
                </div>
                <Switch
                  checked={!!prefs.pet_friendly}
                  onCheckedChange={(v) => set("pet_friendly", v)}
                />
              </div>

              <Button className="w-full" size="lg" onClick={submit}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Itinerary
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}