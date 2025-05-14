import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateBookingStatus } from '../services/messageService';
import axios from 'axios';

// 模拟 axios
vi.mock('axios');

describe('messageService 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('updateBookingStatus 应发送正确的 PATCH 请求', async () => {
    // 模拟成功的响应
    const mockResponse = {
      data: {
        success: true,
        message: 'Booking status updated successfully',
      },
    };
    
    axios.patch.mockResolvedValue(mockResponse);
    
    // 调用 updateBookingStatus 函数
    const messageId = 'msg123';
    const status = 'accepted';
    
    const result = await updateBookingStatus(messageId, status);
    
    // 验证 axios.patch 被正确调用
    expect(axios.patch).toHaveBeenCalledWith(
      `/api/messages/${messageId}/booking-status`,
      { status }
    );
    
    // 验证返回值
    expect(result).toEqual(mockResponse);
  });

  test('updateBookingStatus 应处理请求错误', async () => {
    // 模拟错误响应
    const mockError = new Error('Network error');
    axios.patch.mockRejectedValue(mockError);
    
    // 调用 updateBookingStatus 函数
    const messageId = 'msg123';
    const status = 'declined';
    
    // 使用try/catch来处理预期的错误
    let caughtError;
    try {
      await updateBookingStatus(messageId, status);
    } catch (error) {
      caughtError = error;
    }
    
    // 验证错误被捕获
    expect(caughtError).toBe(mockError);
    
    // 验证 axios.patch 被正确调用
    expect(axios.patch).toHaveBeenCalledWith(
      `/api/messages/${messageId}/booking-status`,
      { status }
    );
  });
}); 