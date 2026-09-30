/**
 * Wraps an async route handler and forwards any rejected promise to
 * Express's error-handling middleware via next(err), so individual
 * controllers don't need their own try/catch blocks.
 *
 * Usage:
 *   const register = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;