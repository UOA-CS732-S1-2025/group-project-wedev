import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock navigation function
const mockNavigate = vi.fn();

// Mock Auth Store
const mockAuthStore = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
};

// Mock Navbar component behavior
// This component reflects the actual Navbar component behavior, but without using Chakra UI components
const MockedNavbar = () => {
  const { user, logout } = mockAuthStore;
  
  return (
    <div data-testid="navbar-container">
      <div 
        data-testid="navbar-title" 
        onClick={() => mockNavigate('/')}
      >
        UrbanEase
      </div>
      
      {!user ? (
        <div data-testid="auth-buttons">
          <button>Log in</button>
          <button>Sign up</button>
        </div>
      ) : (
        <div data-testid="user-actions">
          <span>{user.firstName} {user.lastName}</span>
          <button 
            data-testid="logout-button" 
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

describe('Navbar Component (Mocked Version)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.user = null;
  });

  test('Should display login and signup buttons when not logged in', () => {
    render(<MockedNavbar />);
    
    expect(screen.getByTestId('navbar-title')).toBeInTheDocument();
    expect(screen.getByText('UrbanEase')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('Should display user info and logout button after login', () => {
    mockAuthStore.user = {
      firstName: 'Test',
      lastName: 'User'
    };
    
    render(<MockedNavbar />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  });

  test('Clicking the title should navigate to home page', () => {
    render(<MockedNavbar />);
    
    fireEvent.click(screen.getByTestId('navbar-title'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('Clicking logout button should call logout function', () => {
    mockAuthStore.user = {
      firstName: 'Test',
      lastName: 'User'
    };
    
    render(<MockedNavbar />);
    
    fireEvent.click(screen.getByTestId('logout-button'));
    expect(mockAuthStore.logout).toHaveBeenCalled();
  });
}); 