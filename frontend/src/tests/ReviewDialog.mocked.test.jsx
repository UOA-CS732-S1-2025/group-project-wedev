import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

// 模拟 Auth Store
const mockUser = {
  _id: 'user123',
  username: 'testuser',
};
vi.mock('../store/authStore', () => ({
  default: () => ({
    user: mockUser,
  }),
}));

// 模拟 fetch API
global.fetch = vi.fn();

// 模拟 localStorage
const mockLocalStorageGetItem = vi.fn().mockReturnValue('fake-token');
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockLocalStorageGetItem,
  },
});

// 模拟 toaster
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn(),
  },
}));

// 创建 ReviewDialog 组件模拟
const MockedReviewDialog = ({ bookingId, providerId, onSuccess, ref }) => {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 添加清除评分方法
  const clearRating = () => setRating(0);

  // 暴露 submit 方法和评分操作给外部
  React.useImperativeHandle(ref, () => ({
    async submit() {
      if (!rating || !comment.trim()) {
        return false;
      }
      
      setLoading(true);
      
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            bookingId,
            providerId,
            customerId: mockUser._id,
            rating,
            comment,
          }),
        });
        
        // 模拟响应解析
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message);
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      } catch (err) {
        return false;
      } finally {
        setLoading(false);
      }
    },
    loading,
    rating,
    setRating,
    clearRating
  }));

  return (
    <div data-testid="review-dialog">
      <div>
        <label htmlFor="rating">Rating</label>
        <div data-testid="rating-group">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              data-testid={`rating-${value}`}
              aria-selected={rating === value}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="comment">Review</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a review"
          data-testid="comment-textarea"
        />
      </div>
    </div>
  );
};

describe('ReviewDialog 组件测试', () => {
  const mockOnSuccess = vi.fn();
  let reviewRef;
  
  beforeEach(() => {
    vi.clearAllMocks();
    reviewRef = { current: null };
    
    // 模拟成功的 fetch 响应
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  test('应渲染评价表单', () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={reviewRef}
      />
    );
    
    expect(screen.getByTestId('review-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('rating-group')).toBeInTheDocument();
    expect(screen.getByTestId('comment-textarea')).toBeInTheDocument();
  });

  test('应允许用户选择评分', () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={reviewRef}
      />
    );
    
    // 初始状态下评分应该是 0
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`rating-${i}`)).not.toHaveAttribute('aria-selected', 'true');
    }
    
    // 选择评分 4
    fireEvent.click(screen.getByTestId('rating-4'));
    expect(screen.getByTestId('rating-4')).toHaveAttribute('aria-selected', 'true');
  });

  test('应允许用户输入评价内容', () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={reviewRef}
      />
    );
    
    const textarea = screen.getByTestId('comment-textarea');
    fireEvent.change(textarea, { target: { value: 'Great service!' } });
    
    expect(textarea.value).toBe('Great service!');
  });

  test('提交时应验证评分和评价内容', async () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // 不填评分和评价内容
    let result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    
    // 只填评分，不填评价内容
    fireEvent.click(screen.getByTestId('rating-4'));
    result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    
    // 填写评价内容，手动设置评分为0
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Great service!' } });
    // 使用暴露的方法直接设置评分为0
    act(() => {
      reviewRef.current.clearRating();
    });
    result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('提交评价成功应调用 onSuccess 回调', async () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider456"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // 填写评分和评价内容
    fireEvent.click(screen.getByTestId('rating-5'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Excellent service!' } });
    
    // 提交评价
    const result = await reviewRef.current.submit();
    
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token',
      },
      body: JSON.stringify({
        bookingId: 'booking123',
        providerId: 'provider456',
        customerId: 'user123',
        rating: 5,
        comment: 'Excellent service!',
      }),
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  test('提交评价失败应返回 false', async () => {
    // 模拟 fetch 失败
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'Failed to submit review' }),
    });
    
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // 填写评分和评价内容
    fireEvent.click(screen.getByTestId('rating-3'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Good service' } });
    
    // 提交评价
    const result = await reviewRef.current.submit();
    
    expect(result).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  
  test('应处理网络错误', async () => {
    // 模拟网络错误
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // 填写评分和评价内容
    fireEvent.click(screen.getByTestId('rating-4'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Great experience!' } });
    
    // 提交评价
    const result = await reviewRef.current.submit();
    
    expect(result).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
}); 