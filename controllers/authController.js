const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, providerProfile } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, "Email or phone already registered");
  }

  // password hashing happens automatically via the pre("save") hook on User
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === "provider" ? "provider" : "customer", // never let a client self-assign "admin"
    providerProfile: role === "provider" ? providerProfile : undefined,
  });

  const token = user.generateAuthToken();

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false on the schema, so it must be explicitly requested
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = user.generateAuthToken();

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route  GET /api/auth/me
// @access Private (requires protect middleware)
const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by the protect middleware
  res.status(200).json({ user: req.user });
});

module.exports = { register, login, getMe };