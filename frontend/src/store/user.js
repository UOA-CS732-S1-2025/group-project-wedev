import { create } from 'zustand';

export const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      set({ users: data.users || [], loading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ error: error.message, loading: false, users: [] });
    }
  },

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      set({ users: data.providers || [], loading: false });
    } catch (error) {
      console.error("Error fetching providers:", error);
      set({ error: error.message, loading: false, users: [] });
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({ users: state.users.filter((user) => user._id !== id) }));
        return { success: 'User deleted successfully' };
      } else {
        return { error: 'Failed to delete user' };
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return { error: error.message };
    }
  },

  searchProviders: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      // If searchParams has properties with null/undefined values, clean them up
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      const response = await fetch('/api/providers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      set({ users: data.providers || [], loading: false });
    } catch (error) {
      console.error("Error searching providers:", error);
      set({ error: error.message, loading: false, users: [] });
    }
  }
}));
