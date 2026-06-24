import { getMongoTarget } from "../utils/mongoTarget.js";

export function assertDestructiveSeedAllowed(actionName) {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI || "";
  const { host, databaseName } = getMongoTarget(mongoUrl);

  if (!databaseName) {
    throw new Error(`${actionName} refused: Mongo URL has no database name and would target the default test database.`);
  }

  if (process.env.ALLOW_DESTRUCTIVE_DB_SEED !== "true") {
    throw new Error(`${actionName} refused: it deletes existing data. Set ALLOW_DESTRUCTIVE_DB_SEED=true only for an intentional reset. Target: ${host}/${databaseName}`);
  }

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_DB_RESET !== "true") {
    throw new Error(`${actionName} refused in production. Set ALLOW_PRODUCTION_DB_RESET=true only after taking a fresh backup.`);
  }
}
