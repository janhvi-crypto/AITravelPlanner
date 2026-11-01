const { createClient } = require("@supabase/supabase-js");

/**
 * Server-side Supabase client for trip/places/reviews CRUD.
 * Prefer the SERVICE ROLE key so the API can enforce user_id filters in code.
 * Never expose SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY to the frontend.
 */
function normalizeSupabaseUrl(raw) {
  // Project URL only — do NOT include /rest/v1 (the JS client adds that).
  return String(raw || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
);

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[database] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Trip CRUD will fail until set in backend/.env"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
