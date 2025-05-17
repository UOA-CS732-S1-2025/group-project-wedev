// stores/authStore.js
import { create } from "zustand";
import api from "../lib/api"; 

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoaded: false,

  login: async (email, password) => {
    localStorage.removeItem("token");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("login", Date.now().toString());
      set({ user, token, isLoaded: true });
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  },


  register: async ({ firstName, lastName, email, password }) => {
    try {
      const res = await api.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role: "customer", // Default registration as customer
        location: {
          type: "Point",
          coordinates: [174.7682, -36.8523], // Default coordinates (UOA)
        }
      });
      return { success: true, message: res.data.message || "Registered" };
    } catch (error) {
      console.error("Registration failed:", error.message, error.stack);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  },



  logout: () => {
    localStorage.removeItem("token");
    localStorage.setItem("logout", Date.now().toString());
    set({ user: null, token: null, isLoaded: true });
  },


  fetchCurrentUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const res = await api.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      set({ user: res.data.user, token , isLoaded: true});
    } catch (err) {
      console.error("Fetch user failed:", err);
      localStorage.removeItem("token");
      set({ user: null, token: null , isLoaded: true});
    }
  },
  
  


}));


export const initAuthSync = (fetchCurrentUser) => {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === "logout") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (e.key === "login") {
        const token = localStorage.getItem("token");
        if (token) {
          fetchCurrentUser();
        }
      }
    });
  }
};


export default useAuthStore;