const { createClient } = require("@supabase/supabase-js");

/**
 * Auth client — use the anon / publishable key (safe for signUp / signIn).
 */
function normalizeSupabaseUrl(raw) {
  return String(raw || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
);

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const isConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isConfigured) {
  console.warn(
    "[supabase auth] Missing SUPABASE_URL or SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY in backend/.env"
  );
}

const supabase = createClient(supabaseUrl || "http://localhost", supabaseKey || "missing", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase, supabaseUrl, supabaseKey, isConfigured };
