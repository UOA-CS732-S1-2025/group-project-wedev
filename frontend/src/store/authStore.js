// stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  login: () => set({ user: { name: "Test User", profilePictureUrl: "https://avatar.iran.liara.run/public" } }),
  logout: () => set({ user: null }),
}));

export default useAuthStore;