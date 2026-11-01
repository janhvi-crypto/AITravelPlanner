import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, MapPin, Video } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getToken, reviewsApi } from "@/services/api";
import { PLACES, REVIEWS, type Review } from "@/services/sampleData";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Share a travel review — AI Travel Planner" },
      {
        name: "description",
        content:
          "Publish your own travel review with photos, videos, ratings and location for places, food, hotels and transport across India.",
      },
      { property: "og:title", content: "Share a travel review — AI Travel Planner" },
      {
        property: "og:description",
        content: "Publish travel reviews with photos, videos, ratings and location.",
      },
    ],
  }),
  component: ReviewsPage,
});

const CATEGORIES = ["Places", "Food", "Hotels", "Transport"];

function ReviewsPage() {
  const [place, setPlace] = useState(PLACES[0]!.name);
  const [category, setCategory] = useState("Places");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [feed, setFeed] = useState<Review[]>(REVIEWS);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    reviewsApi
      .list()
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length) setFeed(rows as Review[]);
      })
      .catch(() => {
        /* keep sample feed if backend is down */
      });
  }, []);

  async function publish() {
    if (!text.trim()) {
      toast.error("Write a few words about your experience");
      return;
    }
    if (!getToken()) {
      toast.error("Please sign in first", {
        description: "Reviews are saved to your Supabase account.",
      });
      return;
    }

    setPublishing(true);
    try {
      const res = await reviewsApi.create({
        place,
        category,
        rating,
        text,
        location,
      });
      const saved = res.data as Review;
      setFeed([saved, ...feed.filter((r) => r.id !== saved.id)]);
      toast.success("Review saved to Supabase");
      setText("");
      setLocation("");
      setFiles([]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save review";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,460px)_1fr]">
        <section className="glass-panel h-fit rounded-xl p-6">
          <h1 className="font-display text-3xl">Write a review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your notes help other travellers plan better trips.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <Label className="label-caps">Place</Label>
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {PLACES.map((p) => (
                  <option key={p.slug} value={p.name} className="bg-card">
                    {p.name}, {p.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="label-caps">Category</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm ${
                      c === category
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="label-caps">Rating</Label>
              <div className="mt-2 flex gap-1 text-2xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star`}
                    onClick={() => setRating(n)}
                    className={n <= rating ? "text-primary" : "text-muted-foreground/40"}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="label-caps">Your review</Label>
              <Textarea
                className="mt-2 min-h-32"
                placeholder="Great place to visit! Must try the local food…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div>
              <Label className="label-caps">Location</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Share location / landmark"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="label-caps">Photos & videos</Label>
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" />
                <Video className="h-4 w-4" />
                Upload media
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    setFiles(Array.from(e.target.files ?? []).map((f) => f.name))
                  }
                />
              </label>
              {files.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">{files.join(", ")}</p>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={publish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Published reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These appear on the matching destination page too.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {feed.map((r) => (
              <article key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{r.place}</p>
                  <span className="text-primary">{"★".repeat(r.rating)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {r.author} · {r.category}
                  {r.location ? ` · 📍 ${r.location}` : ""} · {r.createdAt}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}