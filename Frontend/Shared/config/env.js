const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim();
const configuredSocketUrl = (import.meta.env.VITE_SOCKET_URL || "").trim();

const developmentApiUrl = "http://localhost:5000/api";
const developmentSocketUrl = "http://localhost:5000";

export const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? developmentApiUrl : "/api")
).replace(/\/+$/, "");

export const SOCKET_URL = (
  configuredSocketUrl ||
  (import.meta.env.DEV
    ? developmentSocketUrl
    : globalThis.location?.origin || "")
).replace(/\/+$/, "");

if (import.meta.env.PROD && !configuredApiUrl) {
  console.warn(
    "[BQ-PLAY] VITE_API_URL is not configured; API requests will use the frontend origin."
  );
}

if (import.meta.env.PROD && !configuredSocketUrl) {
  console.warn(
    "[BQ-PLAY] VITE_SOCKET_URL is not configured; Socket.IO will use the frontend origin."
  );
}
