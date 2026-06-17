const store = new Map();

export default function rateLimiter({ windowMs = 1000, max = 5 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(key)) {
      store.set(key, []);
    }

    const timestamps = store.get(key).filter((t) => t > windowStart);
    timestamps.push(now);
    store.set(key, timestamps);

    if (timestamps.length > max) {
      return res.status(429).json({
        message: `Too many requests. Max ${max} per ${windowMs / 1000}s. Try again shortly.`,
      });
    }

    next();
  };
}

// Cleanup stale entries every 60s
setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, timestamps] of store) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) store.delete(key);
    else store.set(key, filtered);
  }
}, 60000);
