const { authorize } = require("..middleware/authMiddleware");

/**
 * Named, single-purpose RBAC guards for readability in route files.
 * Both must run AFTER protect(), since they rely on req.user.
 *
 * Usage:
 *   router.post("/services", protect, adminOnly, createService);
 *   router.patch("/bookings/:id/status", protect, providerOnly, updateBookingStatus);
 */
const adminOnly = authorize("admin");
const providerOnly = authorize("provider", "admin"); // admins can act as providers for support/testing

module.exports = { adminOnly, providerOnly };