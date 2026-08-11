/**
 * Optional API key auth (from member-3).
 * When API_KEY is unset, requests are allowed (local/dev).
 */
const API_KEY = (process.env.API_KEY || "").trim();
const HEADER_NAME = "x-api-key";

function apiKeyAuth(req, res, next) {
  if (!API_KEY) return next();

  const providedKey = req.headers[HEADER_NAME];
  if (typeof providedKey !== "string" || providedKey.trim() !== API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid or missing API key. Provide a valid X-API-Key header.",
    });
  }
  return next();
}

module.exports = { apiKeyAuth, isApiKeyAuthEnabled: () => Boolean(API_KEY) };
