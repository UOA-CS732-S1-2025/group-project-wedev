import { create } from 'zustand'

export const useUserStore = create((set) => ({
  users: [],
  setUser: (user) => set({ user }),
  fetchUsers: async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    set({ users: data.users })
  },
}))
