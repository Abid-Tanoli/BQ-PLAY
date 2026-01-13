import { ZodError } from 'zod';

export default function validate(schema) {
  return (req, res, next) => {
    try {
      // Parse and coerce body according to schema
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: err.errors });
      }
      return res.status(400).json({ message: 'Invalid request', error: err.message || err });
    }
  };
}