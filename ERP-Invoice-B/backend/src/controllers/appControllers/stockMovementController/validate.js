const { createSchema } = require('./schemaValidate');

// Route-level middleware to validate create body using Joi
const validateCreate = (req, res, next) => {
  const body = req.body || {};
  const { error } = createSchema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({ success: false, result: null, message: details[0]?.message });
  }
  return next();
};

module.exports = validateCreate;
