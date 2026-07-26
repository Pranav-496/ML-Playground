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
  timeout: 120000, // Increased to 2 minutes to allow Render free tier to wake up
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
