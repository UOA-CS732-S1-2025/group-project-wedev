import axios from 'axios';

export const updateBookingStatus = (messageId, status) => {
  return axios.patch(`/api/messages/${messageId}/booking-status`, { status });
}; 