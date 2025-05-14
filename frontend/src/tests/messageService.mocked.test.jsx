import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateBookingStatus } from '../services/messageService';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('messageService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('updateBookingStatus should send correct PATCH request', async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        success: true,
        message: 'Booking status updated successfully',
      },
    };
    
    axios.patch.mockResolvedValue(mockResponse);
    
    // Call updateBookingStatus function
    const messageId = 'msg123';
    const status = 'accepted';
    
    const result = await updateBookingStatus(messageId, status);
    
    // Verify axios.patch was called correctly
    expect(axios.patch).toHaveBeenCalledWith(
      `/api/messages/${messageId}/booking-status`,
      { status }
    );
    
    // Verify return value
    expect(result).toEqual(mockResponse);
  });

  test('updateBookingStatus should handle request errors', async () => {
    // Mock error response
    const mockError = new Error('Network error');
    axios.patch.mockRejectedValue(mockError);
    
    // Call updateBookingStatus function
    const messageId = 'msg123';
    const status = 'declined';
    
    // Use try/catch to handle expected error
    let caughtError;
    try {
      await updateBookingStatus(messageId, status);
    } catch (error) {
      caughtError = error;
    }
    
    // Verify error was caught
    expect(caughtError).toBe(mockError);
    
    // Verify axios.patch was called correctly
    expect(axios.patch).toHaveBeenCalledWith(
      `/api/messages/${messageId}/booking-status`,
      { status }
    );
  });
}); 