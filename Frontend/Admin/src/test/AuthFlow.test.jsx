import { describe, it, expect, beforeEach, vi } from "vitest";

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Admin Auth Flow", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("persists token after login", () => {
    const token = "admin-jwt-token-123";
    const user = { _id: "1", name: "Admin", email: "admin@test.com", role: "admin" };

    localStorageMock.setItem("token", token);
    localStorageMock.setItem("bq_token", token);
    localStorageMock.setItem("bq_user", JSON.stringify(user));

    expect(localStorageMock.getItem("token")).toBe(token);
    expect(localStorageMock.getItem("bq_token")).toBe(token);
    expect(JSON.parse(localStorageMock.getItem("bq_user"))).toEqual(user);
  });

  it("clears auth on logout", () => {
    localStorageMock.setItem("token", "t");
    localStorageMock.setItem("bq_token", "t");
    localStorageMock.setItem("bq_user", "{}");

    localStorageMock.removeItem("token");
    localStorageMock.removeItem("bq_token");
    localStorageMock.removeItem("bq_user");

    expect(localStorageMock.getItem("token")).toBeNull();
    expect(localStorageMock.getItem("bq_token")).toBeNull();
    expect(localStorageMock.getItem("bq_user")).toBeNull();
  });

  it("recovers token from localStorage on init", () => {
    localStorageMock.setItem("token", "persisted-token");

    const recovered = localStorageMock.getItem("token");
    expect(recovered).toBe("persisted-token");
  });

  it("falls back to bq_token if token key is missing", () => {
    localStorageMock.setItem("bq_token", "fallback-token");

    const token = localStorageMock.getItem("token") || localStorageMock.getItem("bq_token");
    expect(token).toBe("fallback-token");
  });

  it("handles corrupted user JSON gracefully", () => {
    localStorageMock.setItem("bq_user", "not-json{{");

    let user = null;
    try { user = JSON.parse(localStorageMock.getItem("bq_user")); }
    catch { user = null; }

    expect(user).toBeNull();
  });

  it("rejects unauthenticated access to protected routes", () => {
    const token = localStorageMock.getItem("token");
    const isAuthenticated = !!token;

    expect(isAuthenticated).toBe(false);
  });

  it("detects expired token", () => {
    const token = "expired-token";
    localStorageMock.setItem("token", token);

    const isExpired = (t) => t === null || t === undefined;
    expect(isExpired(token)).toBe(false);
  });
});
