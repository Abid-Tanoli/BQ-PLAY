import axios from "axios";
import { clearAdminSession, isAuthFailure, SESSION_EXPIRED_MESSAGE } from "./authSession";
import { API_BASE_URL } from "../../../Shared/config/env.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

function attachAuthInterceptors(client) {
  if (client.__bqPlayAuthInterceptorsAttached) return;
  client.__bqPlayAuthInterceptorsAttached = true;

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token") || localStorage.getItem("bq_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isAuthFailure(error)) {
        error.response.data = error.response.data || {};
        error.response.data.message = SESSION_EXPIRED_MESSAGE;
        clearAdminSession(SESSION_EXPIRED_MESSAGE);

        if (window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      } else if (error.response?.status === 403) {
        const msg = error.response?.data?.message || "Access denied: insufficient permissions";
        error.response.data = error.response.data || {};
        error.response.data.message = msg;
      }
      return Promise.reject(error);
    }
  );
}

attachAuthInterceptors(api);
attachAuthInterceptors(axios);

export default api;
export { API_BASE_URL, api, attachAuthInterceptors, clearAdminSession, isAuthFailure };
