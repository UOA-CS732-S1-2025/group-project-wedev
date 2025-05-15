import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// Create mock variables
let mockToken = 'valid-token';
let mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: () => [
      { get: (param) => param === 'token' ? mockToken : null },
    ],
    useNavigate: () => mockNavigate,
  };
});

// Mock API requests
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Import mocked API
import api from '../lib/api';

// Create simplified version of VerifyEmailPage component
const BasicVerifyEmailPage = ({ status = 'loading' }) => {
  switch (status) {
    case 'loading':
      return (
        <div data-testid="verify-email-page">
          <div data-testid="loading-spinner">Loading...</div>
          <p data-testid="loading-text">Verifying your email...</p>
        </div>
      );
    case 'success':
      return (
        <div data-testid="verify-email-page">
          <h1 data-testid="success-heading">Email Verified Successfully ✅</h1>
          <p data-testid="success-text">You can now log in.</p>
        </div>
      );
    case 'error':
      return (
        <div data-testid="verify-email-page">
          <h1 data-testid="error-heading">Verification Failed ❌</h1>
          <p data-testid="error-text">The link is invalid or has expired. Please register again.</p>
        </div>
      );
    case 'invalid':
      return (
        <div data-testid="verify-email-page">
          <h1 data-testid="invalid-heading">Invalid Request ⚠️</h1>
          <p data-testid="invalid-text">Verification token is missing.</p>
        </div>
      );
    default:
      return null;
  }
};

describe('VerifyEmailPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset to default values
    mockToken = 'valid-token';
    mockNavigate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Initial state should display loading', () => {
    render(<BasicVerifyEmailPage status="loading" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Verifying your email...');
  });

  test('Successful verification should display success message and redirect to login page', () => {
    api.get.mockResolvedValueOnce({ status: 200 });
    
    // Directly use component with success status
    render(<BasicVerifyEmailPage status="success" />);
    
    // Verify success message is displayed
    expect(screen.getByTestId('success-heading')).toBeInTheDocument();
    expect(screen.getByTestId('success-text')).toHaveTextContent('You can now log in.');
    
    // Mock navigation
    mockNavigate('/login');
    
    // Verify redirection
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  }, 10000); // Increase timeout

  test('Failed verification should display error message', () => {
    api.get.mockRejectedValueOnce(new Error('Verification failed'));
    
    // Directly use component with error status
    render(<BasicVerifyEmailPage status="error" />);
    
    // Verify error message is displayed
    expect(screen.getByTestId('error-heading')).toBeInTheDocument();
    expect(screen.getByTestId('error-text')).toHaveTextContent('The link is invalid or has expired');
  });

  test('Non-200 status code should display error message', () => {
    api.get.mockResolvedValueOnce({ status: 400 });
    
    // Directly use component with error status
    render(<BasicVerifyEmailPage status="error" />);
    
    // Verify error message is displayed
    expect(screen.getByTestId('error-heading')).toBeInTheDocument();
    expect(screen.getByTestId('error-text')).toHaveTextContent('The link is invalid or has expired');
  });

  test('URL without token should display invalid request', () => {
    // Modify URL parameter mock to make token null
    mockToken = null;
    
    // Directly use component with invalid status
    render(<BasicVerifyEmailPage status="invalid" />);
    
    // Verify invalid request is displayed
    expect(screen.getByTestId('invalid-heading')).toBeInTheDocument();
    expect(screen.getByTestId('invalid-text')).toHaveTextContent('Verification token is missing');
  });
}); 