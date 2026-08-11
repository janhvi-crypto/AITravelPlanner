function errorHandler(err, _req, res, _next) {
  console.error("[errorHandler]", err);
  const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

module.exports = { errorHandler };
