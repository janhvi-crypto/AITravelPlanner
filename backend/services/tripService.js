const supabase = require("../config/database");

/**
 * Map frontend save payload → trips table columns.
 * Frontend sends: { ...prefs, plan: itinerary }
 */
function mapTripPayload(body, userId) {
  const plan = body.plan || body.itinerary_plan || {};
  const interests = Array.isArray(body.interests)
    ? body.interests
    : typeof body.interests === "string"
      ? body.interests.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const destination = String(body.destination || plan.destination || "Trip").trim();
  const budget = Number(body.budget ?? plan.budget ?? 0);
  const days = Number(body.days ?? plan.days ?? 1);

  if (!destination) throw new Error("destination is required");
  if (!budget || budget <= 0) throw new Error("budget must be a positive number");
  if (!days || days <= 0) throw new Error("days must be a positive number");
  if (!userId) throw new Error("user_id is required — please log in");

  return {
    user_id: userId,
    title: body.title || `${destination} · ${days} days`,
    destination,
    destination_slug: body.destination_slug || body.slug || null,
    budget,
    days,
    people: Number(body.people || 1),
    transport: body.transport || null,
    food_preference: body.food_preference || null,
    travel_style: body.travel_style || null,
    interests,
    safety_preference: body.safety_preference || null,
    pet_friendly: Boolean(body.pet_friendly),
    festival_music: body.festival_music || null,
    plan,
    cover_image_url: body.cover_image_url || null,
    weather_snapshot: body.weather_snapshot || null,
    status: body.status || "saved",
    updated_at: new Date().toISOString(),
  };
}

async function createTrip(tripData) {
  const { data, error } = await supabase.from("trips").insert([tripData]).select().single();
  if (error) throw error;
  return data;
}

async function getTripHistory(userId) {
  let query = supabase.from("trips").select("*").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getTripById(id, userId) {
  let query = supabase.from("trips").select("*").eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

async function updateTrip(id, tripData, userId) {
  let query = supabase.from("trips").update(tripData).eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

async function deleteTrip(id, userId) {
  let query = supabase.from("trips").delete().eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

async function testDatabaseConnection() {
  const { data, error } = await supabase.from("trips").select("id").limit(1);
  if (error) throw error;
  return data;
}

module.exports = {
  mapTripPayload,
  createTrip,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
  testDatabaseConnection,
};
