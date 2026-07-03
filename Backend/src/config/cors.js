const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/+$/, "");

const configuredOrigins = [
  process.env.CORS_ORIGINS,
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map(normalizeOrigin)
  .filter(Boolean);

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
];

const isProduction = process.env.NODE_ENV === "production";

export const allowedCorsOrigins = [
  ...new Set([
    ...configuredOrigins,
    ...(isProduction ? [] : developmentOrigins),
  ]),
];

export const corsOrigin = (origin, callback) => {
  if (!origin || allowedCorsOrigins.includes(normalizeOrigin(origin))) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};
