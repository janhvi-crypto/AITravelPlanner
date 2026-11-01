const supabase = require("../config/database");

function slugifyPlace(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapReviewRow(row) {
  if (!row) return null;
  const created = row.created_at ? new Date(row.created_at) : new Date();
  const ms = Date.now() - created.getTime();
  let createdAt = "Just now";
  if (ms > 7 * 24 * 60 * 60 * 1000) createdAt = created.toLocaleDateString();
  else if (ms > 24 * 60 * 60 * 1000) createdAt = `${Math.floor(ms / (24 * 60 * 60 * 1000))} days ago`;
  else if (ms > 60 * 60 * 1000) createdAt = `${Math.floor(ms / (60 * 60 * 1000))} hours ago`;

  return {
    id: row.id,
    place: row.place_name,
    place_slug: row.place_slug,
    author: row.author_name || "Traveller",
    avatar: row.avatar_url || null,
    rating: row.rating,
    text: row.text,
    category: row.category || "General",
    location: row.location || "",
    media_urls: row.media_urls || [],
    createdAt,
    created_at: row.created_at,
  };
}

async function resolvePlaceSlug(placeName, preferredSlug) {
  const slug = preferredSlug || slugifyPlace(placeName);
  if (!slug) return null;

  const { data } = await supabase.from("places").select("slug").eq("slug", slug).maybeSingle();
  if (data?.slug) return data.slug;

  const { data: byName } = await supabase
    .from("places")
    .select("slug")
    .ilike("name", placeName)
    .maybeSingle();
  return byName?.slug || null;
}

/** Attach display names from profiles (no FK embed — reviews.user_id → auth.users, not profiles). */
async function withAuthorNames(rows) {
  const list = rows || [];
  if (!list.length) return [];

  const userIds = [...new Set(list.map((r) => r.user_id).filter(Boolean))];
  const nameById = {};

  if (userIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    for (const p of profiles || []) {
      nameById[p.id] = {
        author_name: p.full_name || (p.email ? p.email.split("@")[0] : "Traveller"),
        avatar_url: p.avatar_url || null,
      };
    }
  }

  return list.map((row) =>
    mapReviewRow({
      ...row,
      author_name: nameById[row.user_id]?.author_name || "Traveller",
      avatar_url: nameById[row.user_id]?.avatar_url || null,
    })
  );
}

async function listReviews({ place } = {}) {
  // Public feed: every signed-in user's reviews (not filtered by current login)
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });

  if (place) {
    const p = String(place).trim();
    const slug = slugifyPlace(p);
    query = query.or(`place_name.ilike.%${p}%,place_slug.eq.${slug}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return withAuthorNames(data || []);
}

async function createReview(payload, user) {
  if (!user?.id) throw new Error("Login required to publish a review");

  const placeName = String(payload.place || payload.place_name || "").trim();
  if (!placeName) throw new Error("place is required");

  const text = String(payload.text || "").trim();
  if (!text) throw new Error("Review text is required");

  const rating = Number(payload.rating);
  if (!rating || rating < 1 || rating > 5) throw new Error("rating must be between 1 and 5");

  const placeSlug = await resolvePlaceSlug(placeName, payload.place_slug);
  const media =
    Array.isArray(payload.media_urls) && payload.media_urls.length
      ? payload.media_urls
      : [];

  const row = {
    user_id: user.id,
    place_slug: placeSlug,
    place_name: placeName,
    rating,
    text,
    category: payload.category || "General",
    location: payload.location || null,
    media_urls: media,
  };

  const { data, error } = await supabase.from("reviews").insert([row]).select().single();
  if (error) throw error;

  return mapReviewRow({
    ...data,
    author_name: user.name || user.email || "You",
  });
}

module.exports = {
  listReviews,
  createReview,
  slugifyPlace,
  mapReviewRow,
};
