import { Link } from "@tanstack/react-router";
import { CloudRain, MapPin, Star, Sun } from "lucide-react";
import type { Place } from "@/services/sampleData";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <Link
      to="/places/$slug"
      params={{ slug: place.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image}
          alt={`${place.name}, ${place.state}`}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[var(--gradient-veil)]" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-xl leading-tight">{place.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {place.state}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {place.rating}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">{place.blurb}</p>
        <div className="flex flex-wrap gap-1.5">
          {place.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
              {t}
            </span>
          ))}
        </div>
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
            place.weather.suitable
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "border-accent/35 bg-accent/10 text-foreground"
          }`}
        >
          {place.weather.suitable ? (
            <Sun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <CloudRain className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          )}
          <span>
            {place.weather.temp}°C · {place.weather.condition} — {place.weather.advice}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{place.reviews.toLocaleString("en-IN")} traveller reviews</p>
      </div>
    </Link>
  );
}