/**
 * In-memory rate limiter (from member-3), CommonJS.
 */
function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const WINDOW_MS = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
const MAX_REQUESTS = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 20);
const requestLog = new Map();

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, timestamps] of requestLog.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) requestLog.delete(key);
    else requestLog.set(key, active);
  }
}, 5 * 60_000).unref?.();

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const maxRequests = options.maxRequests ?? MAX_REQUESTS;
  const keyGenerator = options.keyGenerator ?? getClientKey;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = (requestLog.get(key) || []).filter((ts) => ts > cutoff);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${retryAfterSeconds}s.`,
      });
    }

    timestamps.push(now);
    requestLog.set(key, timestamps);
    return next();
  };
}

const aiRateLimiter = createRateLimiter();

module.exports = { createRateLimiter, aiRateLimiter };
