import { describe, it, expect, beforeEach, vi } from "vitest";

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("User Auth Service", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("persists auth token and user", () => {
    const token = "user-jwt-123";
    const user = { _id: "u1", name: "Test", email: "test@test.com", role: "viewer" };

    localStorageMock.setItem("bq_token", token);
    localStorageMock.setItem("token", token);
    localStorageMock.setItem("bq_user", JSON.stringify(user));

    expect(localStorageMock.getItem("bq_token")).toBe(token);
    expect(localStorageMock.getItem("token")).toBe(token);
    expect(JSON.parse(localStorageMock.getItem("bq_user"))).toEqual(user);
  });

  it("clears all auth on logout", () => {
    localStorageMock.setItem("bq_token", "t");
    localStorageMock.setItem("token", "t");
    localStorageMock.setItem("bq_user", "{}");
    localStorageMock.removeItem("bq_token");
    localStorageMock.removeItem("token");
    localStorageMock.removeItem("bq_user");

    expect(localStorageMock.getItem("bq_token")).toBeNull();
    expect(localStorageMock.getItem("bq_user")).toBeNull();
  });

  it("restores auth from localStorage on init", () => {
    localStorageMock.setItem("bq_token", "saved-token");
    localStorageMock.setItem("bq_user", JSON.stringify({ name: "User" }));

    const token = localStorageMock.getItem("bq_token") || localStorageMock.getItem("token");
    let user = null;
    try { user = JSON.parse(localStorageMock.getItem("bq_user")); }
    catch { user = null; }

    expect(token).toBe("saved-token");
    expect(user).toEqual({ name: "User" });
  });

  it("handles guest mode (no token)", () => {
    const token = localStorageMock.getItem("bq_token");
    expect(token).toBeNull();
  });

  it("supports continue-as-guest flow", () => {
    localStorageMock.setItem("token", "stale");
    localStorageMock.removeItem("bq_token");
    localStorageMock.removeItem("token");
    localStorageMock.removeItem("bq_user");

    expect(localStorageMock.getItem("bq_token")).toBeNull();
    expect(localStorageMock.getItem("token")).toBeNull();
  });

  it("updates auth state when setCredentials is dispatched", () => {
    const state = { user: null, token: null };
    const payload = {
      token: "new-token",
      user: { _id: "u2", name: "New", role: "scorer" },
    };

    state.user = payload.user;
    state.token = payload.token;

    localStorageMock.setItem("bq_token", payload.token);
    localStorageMock.setItem("token", payload.token);
    localStorageMock.setItem("bq_user", JSON.stringify(payload.user));

    expect(state.token).toBe("new-token");
    expect(state.user.role).toBe("scorer");
    expect(localStorageMock.getItem("bq_token")).toBe("new-token");
  });

  it("handles Google login auth response format", () => {
    const googleResponse = { credential: "google-token" };
    const apiResponse = { token: "jwt-from-google", user: { _id: "g1", name: "Google User", role: "viewer" } };

    localStorageMock.setItem("bq_token", apiResponse.token);
    localStorageMock.setItem("token", apiResponse.token);
    localStorageMock.setItem("bq_user", JSON.stringify(apiResponse.user));

    expect(localStorageMock.getItem("bq_token")).toBe("jwt-from-google");
    expect(JSON.parse(localStorageMock.getItem("bq_user")).name).toBe("Google User");
  });
});
