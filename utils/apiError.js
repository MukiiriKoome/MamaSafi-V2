/**
 * Lightweight error class carrying an HTTP status code.
 * Throw this from any asyncHandler-wrapped controller and the global
 * error middleware will format the response correctly.
 *
 * Usage:
 *   throw new ApiError(404, "Service not found");
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;