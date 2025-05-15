import axios from 'axios';

export const updateBookingStatus = (messageId, status) => {
  return axios.patch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}/booking-status`, { status });
}; 