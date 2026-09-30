const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true }, // e.g. "Home", "Nursery"
    estate: { type: String, trim: true }, // e.g. "Kilimani", "South B"
    houseNumber: { type: String, trim: true },
    landmark: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const providerProfileSchema = new mongoose.Schema(
  {
    skills: [{ type: String }], // e.g. ["Deep Cleaning", "Baby-safe Sanitization"]
    isVerified: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0.0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never returned by default queries
    },
    phone: { type: String, required: true, unique: true, trim: true },
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    addresses: [addressSchema], // customer only
    providerProfile: providerProfileSchema, // populated only if role === "provider"
  },
  { timestamps: true }
);

// Compound index for fast login/role lookups
userSchema.index({ email: 1, role: 1 });

// --- Password hashing: hash/salt only when the password field is new or changed ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- Instance method: compare a plaintext candidate against the stored hash ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --- Instance method: sign a JWT with a custom payload for this user ---
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
