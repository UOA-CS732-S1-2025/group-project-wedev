import axios from "axios";

const VITE_API_DOMAIN = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: VITE_API_DOMAIN ? `${VITE_API_DOMAIN}/api` : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 自动带上 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
