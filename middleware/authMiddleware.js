const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect
 * Reads "Authorization: Bearer <token>", verifies it, and attaches the
 * authenticated user (minus password) to req.user for downstream routes.
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the real user document (fresh from DB) so role/status changes
    // are respected even if the token payload is stale.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Not authorized, token expired" });
    }
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

/**
 * authorize(...roles)
 * Route-level RBAC guard. Use after protect().
 * e.g. router.delete("/:id", protect, authorize("admin"), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
