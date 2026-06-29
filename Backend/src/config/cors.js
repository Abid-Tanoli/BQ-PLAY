const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/+$/, "");

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

export const allowedCorsOrigins = configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === "production"
    ? []
    : developmentOrigins;

export const corsOrigin = (origin, callback) => {
  if (!origin || allowedCorsOrigins.includes(normalizeOrigin(origin))) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};
