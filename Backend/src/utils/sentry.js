import log from "./logger.js";

const DSN = process.env.SENTRY_DSN;
const ENV = process.env.NODE_ENV || "development";

let sentryEnabled = false;
let projectId = "";

if (DSN) {
  const match = DSN.match(/https:\/\/([^@]+)@([^.]+)\.ingest\.sentry\.io\/(\d+)/);
  if (match) {
    projectId = match[3];
    sentryEnabled = true;
    log.info({ projectId }, "Sentry error tracking enabled");
  } else {
    log.warn({ dsnConfigured: true }, "SENTRY_DSN format invalid — expected https://key@oXXX.ingest.sentry.io/PROJECT_ID");
  }
}

function buildEnvelope(event) {
  const authHeader = { sdk: { name: "bqplay-custom", version: "1.0.0" } };
  const itemHeader = { type: "event", content_type: "application/json" };
  const header = JSON.stringify(authHeader);
  const itemH = JSON.stringify(itemHeader);
  const payload = JSON.stringify(event);
  return `${header}\n${itemH}\n${payload}`;
}

function buildEvent(err, req) {
  const event = {
    event_id: crypto.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    logger: "bqplay-backend",
    environment: ENV,
    exception: {
      values: [
        {
          type: err.name || "Error",
          value: err.message || String(err),
          stacktrace: err.stack ? { frames: parseStack(err.stack) } : undefined,
          mechanism: { type: "middleware", handled: true },
        },
      ],
    },
    tags: {
      "error.code": String(err.statusCode || err.status || 500),
    },
    extra: {
      ...(err.body ? { body: err.body } : {}),
    },
  };

  if (req) {
    event.request = {
      url: req.originalUrl || req.url,
      method: req.method,
      headers: sanitizeHeaders(req.headers),
      query_string: req.query,
      data: sanitizeData(req.body),
    };
    event.user = req.user ? { id: req.user._id || req.user.id } : undefined;
  }

  return event;
}

function sanitizeHeaders(headers) {
  if (!headers) return {};
  const sensitive = ["authorization", "cookie", "x-api-key", "set-cookie"];
  const safe = {};
  for (const [key, value] of Object.entries(headers)) {
    safe[key] = sensitive.includes(key.toLowerCase()) ? "[redacted]" : String(value);
  }
  return safe;
}

function sanitizeData(value, depth = 0) {
  if (depth > 5) return "[truncated]";
  if (Array.isArray(value)) return value.map((item) => sanitizeData(item, depth + 1));
  if (!value || typeof value !== "object") return value;

  const sensitive = ["password", "token", "secret", "authorization", "cookie", "apikey", "api_key", "key"];
  const safe = {};
  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    safe[key] = sensitive.some((term) => normalized.includes(term))
      ? "[redacted]"
      : sanitizeData(item, depth + 1);
  }
  return safe;
}

function parseStack(stack) {
  if (!stack) return [];
  return stack.split("\n").slice(1).map((line) => {
    const match = line.match(/at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)|(\S+))\)?/);
    if (!match) return { filename: line.trim() };
    return {
      function: match[1] || "<anonymous>",
      filename: match[2] || match[5] || "",
      lineno: match[3] ? parseInt(match[3], 10) : undefined,
      colno: match[4] ? parseInt(match[4], 10) : undefined,
    };
  });
}

async function sendToSentry(event) {
  if (!sentryEnabled) return;
  try {
    const envelope = buildEnvelope(event);
    const url = `https://o${projectId}.ingest.sentry.io/api/${projectId}/envelope/`;
    const res = await fetch(url, {
      method: "POST",
      body: envelope,
      headers: { "Content-Type": "application/x-sentry-envelope" },
    });
    if (!res.ok) {
      log.warn({ status: res.status, statusText: res.statusText }, "Sentry ingest returned non-OK");
    }
  } catch (err) {
    log.warn({ err: err.message }, "Failed to send error to Sentry");
  }
}

export function captureException(err, req) {
  if (!sentryEnabled) return;
  const event = buildEvent(err, req);
  sendToSentry(event);
}

export function sentryMiddleware(err, req, res, next) {
  captureException(err, req);
  next(err);
}

export function initSentry() {
  if (!sentryEnabled) {
    log.info("Sentry not configured — set SENTRY_DSN to enable");
  }
  return sentryEnabled;
}
