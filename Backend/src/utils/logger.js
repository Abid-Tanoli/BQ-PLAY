const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function stringify(obj) {
  if (obj instanceof Error) return { message: obj.message, stack: obj.stack, ...obj };
  if (typeof obj === "object" && obj !== null) return obj;
  return { msg: String(obj) };
}

export function createLogger(context = {}) {
  const base = { ...context };

  function log(level, obj, msg) {
    if (LOG_LEVELS[level] < LEVEL) return;
    const entry = { level, time: timestamp(), ...base, ...stringify(obj) };
    if (msg) entry.msg = msg;

    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  return {
    debug: (obj, msg) => log("debug", obj, msg),
    info: (obj, msg) => log("info", obj, msg),
    warn: (obj, msg) => log("warn", obj, msg),
    error: (obj, msg) => log("error", obj, msg),
    child: (extra) => createLogger({ ...base, ...extra }),
  };
}

const root = createLogger();
export default root;
