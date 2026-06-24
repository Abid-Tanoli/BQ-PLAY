const AUTH_STORAGE_KEYS = [
  "token",
  "adminToken",
  "authToken",
  "bq_token",
  "bq_user",
  "user",
  "admin",
  "adminUser",
  "auth",
  "persist:auth",
];

const SESSION_MESSAGE_KEY = "bq_admin_session_message";
const SESSION_EXPIRED_MESSAGE = "Session expired. Please login again.";

export function clearAdminSession(message = SESSION_EXPIRED_MESSAGE) {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  if (message) {
    sessionStorage.setItem(SESSION_MESSAGE_KEY, message);
  }
}

export function consumeSessionMessage() {
  const message = sessionStorage.getItem(SESSION_MESSAGE_KEY);
  if (message) {
    sessionStorage.removeItem(SESSION_MESSAGE_KEY);
  }
  return message;
}

export function isAuthFailure(error) {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || "");
  const code = error?.response?.data?.code;

  return (
    status === 401
    || code === "AUTH_PRINCIPAL_NOT_FOUND"
    || /user not found|admin not found|invalid or expired token|session expired/i.test(message)
  );
}

export { AUTH_STORAGE_KEYS, SESSION_EXPIRED_MESSAGE };
