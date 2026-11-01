const { supabase, isConfigured } = require("../config/supabase");

/**
 * Requires a valid Supabase access token in Authorization: Bearer <token>.
 * Sets req.user = { id, email, name }.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Login required. Missing token." });
    }

    const token = header.slice(7).trim();
    if (!token || token.startsWith("atp_session_") || token.startsWith("atp_token_")) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please sign in again with a real Supabase account.",
      });
    }

    if (!isConfigured) {
      return res.status(503).json({
        success: false,
        message: "Supabase is not configured. Add keys to backend/.env",
      });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    const meta = data.user.user_metadata || {};
    req.user = {
      id: data.user.id,
      email: data.user.email,
      name: meta.name || meta.full_name || data.user.email?.split("@")[0] || "Traveller",
    };
    req.accessToken = token;
    return next();
  } catch (err) {
    console.error("[authMiddleware]", err.message || err);
    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
}

/** Optional auth — attaches req.user when token is valid, otherwise continues. */
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ") || !isConfigured) return next();
    const token = header.slice(7).trim();
    if (!token || token.startsWith("atp_")) return next();
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      const meta = data.user.user_metadata || {};
      req.user = {
        id: data.user.id,
        email: data.user.email,
        name: meta.name || meta.full_name || data.user.email?.split("@")[0] || "Traveller",
      };
    }
  } catch (_) {
    // ignore
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
