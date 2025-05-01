import { create } from 'zustand'

export const useUserStore = create((set) => ({
  users: [],
  setUser: (user) => set({ user }),
  fetchUsers: async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    set({ users: data.users })
  },
  fetchProviders: async () => {
    const response = await fetch('/api/users/providers')
    const data = await response.json()
    set({ users: data.providers })
  },
  deleteUser: async (id) => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.success) {
        set((state) => ({ users: state.users.filter((user) => user._id !== id) }))
        return { success: 'user deleted successfully' }
      } else {
        return { error: 'Failed to delete user' }
      }
  }
}))
