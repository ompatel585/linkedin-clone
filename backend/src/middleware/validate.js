// Validates and replaces req.body with the parsed (and stripped) result of the zod schema.
export const validateBody = (schema) => (req, res, next) => {
    req.body = schema.parse(req.body ?? {});
    next();
};
