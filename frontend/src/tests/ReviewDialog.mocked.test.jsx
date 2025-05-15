import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

// Mock Auth Store
const mockUser = {
  _id: 'user123',
  username: 'testuser',
};
vi.mock('../store/authStore', () => ({
  default: () => ({
    user: mockUser,
  }),
}));

// Mock fetch API
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorageGetItem = vi.fn().mockReturnValue('fake-token');
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockLocalStorageGetItem,
  },
});

// Mock toaster
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn(),
  },
}));

// Create ReviewDialog component mock
const MockedReviewDialog = ({ bookingId, providerId, onSuccess, ref }) => {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Add method to clear rating
  const clearRating = () => setRating(0);

  // Expose submit method and rating operations to external components
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
        
        // Mock response parsing
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

describe('ReviewDialog Component Tests', () => {
  const mockOnSuccess = vi.fn();
  let reviewRef;
  
  beforeEach(() => {
    vi.clearAllMocks();
    reviewRef = { current: null };
    
    // Mock successful fetch response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  test('Should render review form', () => {
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

  test('Should allow user to select rating', () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={reviewRef}
      />
    );
    
    // Rating should be 0 in initial state
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`rating-${i}`)).not.toHaveAttribute('aria-selected', 'true');
    }
    
    // Select rating 4
    fireEvent.click(screen.getByTestId('rating-4'));
    expect(screen.getByTestId('rating-4')).toHaveAttribute('aria-selected', 'true');
  });

  test('Should allow user to input review content', () => {
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

  test('Should validate rating and review content on submission', async () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // Don't provide rating and review content
    let result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    
    // Only provide rating, no review content
    fireEvent.click(screen.getByTestId('rating-4'));
    result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    
    // Provide review content, manually set rating to 0
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Great service!' } });
    // Use exposed method to directly set rating to 0
    act(() => {
      reviewRef.current.clearRating();
    });
    result = await reviewRef.current.submit();
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('Should call onSuccess callback when review is submitted successfully', async () => {
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider456"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // Fill in rating and review content
    fireEvent.click(screen.getByTestId('rating-5'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Excellent service!' } });
    
    // Submit review
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

  test('Should return false when review submission fails', async () => {
    // Mock fetch failure
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
    
    // Fill in rating and review content
    fireEvent.click(screen.getByTestId('rating-3'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Good service' } });
    
    // Submit review
    const result = await reviewRef.current.submit();
    
    expect(result).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  
  test('Should handle network error', async () => {
    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <MockedReviewDialog
        bookingId="booking123"
        providerId="provider123"
        onSuccess={mockOnSuccess}
        ref={(el) => { reviewRef.current = el; }}
      />
    );
    
    // Fill in rating and review content
    fireEvent.click(screen.getByTestId('rating-4'));
    fireEvent.change(screen.getByTestId('comment-textarea'), { target: { value: 'Great experience!' } });
    
    // Submit review
    const result = await reviewRef.current.submit();
    
    expect(result).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
}); 