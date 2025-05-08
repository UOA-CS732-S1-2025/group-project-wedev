import { create } from 'zustand'
import axios from 'axios';

const API_BASE_URL = 'http://your-api-domain.com/api'; // 替换为实际 API 地址

export const useUserStore = create((set) => ({
  currentUser: null, // 当前登录用户
  users: [], // 用户列表（管理员用）
  error: null, // 错误信息
  setUser: (user) => set({ user }),

  // 获取当前用户资料
  fetchCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`);
      set({ currentUser: response.data, error: null });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch profile' });
    }
  },

  // 更新用户资料
  updateProfile: async (formData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/profile`, formData);
      set({ currentUser: response.data, error: null });
      return { success: 'Profile updated!' };
    } catch (err) {
      set({ error: err.response?.data?.message || 'Update failed' });
      return { error: err.response?.data?.message };
    }
  },

  // 获取所有用户（管理员）
  fetchUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      set({ users: response.data.users, error: null });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch users' });
    }
  },

  // 新增：获取订单历史
  fetchOrders: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      return response.data.orders; // 返回订单数据供组件使用
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch orders' });
      return [];
    }
  },

  // 新增：提交评价
  submitReview: async (orderId, reviewData) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/reviews`, reviewData);
      return { success: true };
    } catch (err) {
      return { error: err.response?.data?.message };
    }
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
