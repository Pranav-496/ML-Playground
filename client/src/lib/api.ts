import axios from "axios";

// Auto-correct missing /api to prevent common deployment errors
let baseUrl = import.meta.env.VITE_API_URL || "/api";
if (baseUrl.startsWith("http") && !baseUrl.endsWith("/api")) {
  baseUrl = baseUrl.replace(/\/$/, "") + "/api";
}

const api = axios.create({
  // Use the environment variable if available (production), otherwise fallback to proxy (local dev)
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes to allow Render free tier to wake up
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("valoris_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling + auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired/invalid, clear auth state
    if (error.response?.status === 401) {
      localStorage.removeItem("valoris_token");
      localStorage.removeItem("valoris_user");
      // Only reload if we're not already on a login-related request
      const url = error.config?.url || "";
      if (!url.includes("/auth/")) {
        window.location.reload();
      }
    }

    const message =
      error.response?.data?.detail || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
