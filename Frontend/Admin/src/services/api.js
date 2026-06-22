import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("bq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("bq_token");
      localStorage.removeItem("bq_user");
      if (error.response?.status === 403) {
        const msg = error.response?.data?.message || "Access denied: insufficient permissions";
        error.response.data = error.response.data || {};
        error.response.data.message = msg;
      }
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
