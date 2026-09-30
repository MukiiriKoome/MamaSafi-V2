const { z } = require("zod");

// --- Auth ---
const registerSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("must be a valid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
  phone: z.string().trim().min(10, "must be a valid phone number"),
  role: z.enum(["customer", "provider"]).optional(),
  providerProfile: z
    .object({
      skills: z.array(z.string()).optional(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("must be a valid email"),
  password: z.string().min(1, "password is required"),
});

// --- Service ---
const createServiceSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  slug: z.string().trim().toLowerCase().min(1, "slug is required"),
  category: z.enum(["deep_cleaning", "general_cleaning", "laundry", "cooking", "maternal_support"]),
  description: z.string().trim().min(1, "description is required"),
  basePrice: z.number().min(0, "basePrice must be >= 0"),
  pricingModel: z.enum(["fixed", "hourly", "per_room", "per_seat"]),
  estimatedDuration: z.number().int().positive("estimatedDuration must be a positive number of minutes"),
  includedTasks: z.array(z.string()).optional(),
  isBabySafeEquipmentUsed: z.boolean().optional(),
});

// --- Booking ---
const createBookingSchema = z.object({
  service: z.string().min(1, "service id is required"),
  quantity: z.number().int().positive().default(1),
  schedule: z.object({
    date: z.coerce.date({ errorMap: () => ({ message: "a valid schedule.date is required" }) }),
    timeSlot: z.enum(["08:00-11:00", "11:00-14:00", "14:00-17:00"]),
  }),
  serviceAddress: z.object({
    estate: z.string().trim().min(1, "estate is required"),
    houseNumber: z.string().trim().min(1, "houseNumber is required"),
    landmark: z.string().trim().optional(),
  }),
  specialNotes: z.string().trim().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createServiceSchema,
  createBookingSchema,
};