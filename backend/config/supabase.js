const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Missing Supabase URL or publishable key. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in backend/.env"
  );
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

module.exports = { supabase, supabaseUrl, supabaseKey };
