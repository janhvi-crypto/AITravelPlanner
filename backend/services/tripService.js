const supabase = require("../config/database");

async function createTrip(tripData) {
  const { data, error } = await supabase.from("trips").insert([tripData]).select().single();
  if (error) throw error;
  return data;
}

async function getTripHistory() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function getTripById(id) {
  const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function updateTrip(id, tripData) {
  const { data, error } = await supabase
    .from("trips")
    .update(tripData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteTrip(id) {
  const { data, error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function testDatabaseConnection() {
  const { data, error } = await supabase.from("trips").select("id").limit(1);
  if (error) throw error;
  return data;
}

module.exports = {
  createTrip,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
  testDatabaseConnection,
};
