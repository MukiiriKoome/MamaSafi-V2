/**
 * validate(schema)
 * Parses req.body against a Zod schema. On success, req.body is replaced
 * with the parsed (and coerced/defaulted) data. On failure, responds 400
 * with a readable list of field errors — the route handler never runs.
 *
 * Usage:
 *   router.post("/services", protect, adminOnly, validate(createServiceSchema), createService);
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data;
  next();
};

module.exports = validate;