// stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  login: () =>
    set({
      user: {
        _id: "68127c6ca2aa6a9ad3a136cf",
        username: "customer1",
        email: "Admin_changed_email_API_test@example.com",
        role: "customer",
        firstName: "CustomerFirst1",
        lastName: "CustomerLast1",
        phoneNumber: "1234567810",
        profilePictureUrl: "https://avatar.iran.liara.run/public",
        address: {
          street: "100 Customer St",
          city: "Beijing",
          state: "Beijing",
          postalCode: "10000",
          country: "China",
        },
        location: { type: "Point" },
        averageRating: 0,
        reviewCount: 0,
        availability: [],
        portfolioMedia: [],
        createdAt: "2025-05-01T00:00:00.000Z", // 可根据你的时间戳转换
        updatedAt: "2025-05-03T00:00:00.000Z"
      },
    }),
  logout: () => set({ user: null }),
}));

export default useAuthStore;