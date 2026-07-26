import axios from "axios";

const api = axios.create({
  // Use the environment variable if available (production), otherwise fallback to proxy (local dev)
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
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
