/**
 * CORS middleware for frontend integration.
 * Supports comma-separated origins via CORS_ORIGIN env variable.
 */

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const origins = allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_ORIGINS;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const corsMiddleware = (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && origins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  } else if (!requestOrigin && process.env.NODE_ENV !== 'production') {
    // Allow non-browser clients (curl, Postman) in development
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

export default corsMiddleware;
