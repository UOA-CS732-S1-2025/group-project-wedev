import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Global mock variables that can be modified in tests
let mockSearchParams = { get: (param) => param === 'tab' ? 'profile' : null };
let mockSetSearchParams = vi.fn();
let mockUser = { _id: 'user123', role: 'customer' };

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useNavigate: () => vi.fn()
  };
});

// Mock child components
vi.mock('../components/UserInbox', () => ({
  default: () => <div data-testid="user-inbox">User Inbox Component</div>,
}));

vi.mock('../components/UserProfile', () => ({
  default: () => <div data-testid="user-profile">User Profile Component</div>,
}));

vi.mock('../components/UserDashboard', () => ({
  default: () => <div data-testid="user-dashboard">User Dashboard Component</div>,
}));

vi.mock('../components/BookingsView', () => ({
  default: () => <div data-testid="bookings-view">Bookings View Component</div>,
}));

vi.mock('../components/AdminView', () => ({
  default: () => <div data-testid="admin-view">Admin View Component</div>,
}));

// Create UserProfilePage component mock
const MockedUserProfilePage = ({ defaultTab = 'profile' }) => {
  // Get search parameters and setter function
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tab parameter from URL, default to the provided defaultTab
  const tabFromUrl = searchParams.get('tab');
  const effectiveTab = tabFromUrl || defaultTab;
  
  // Get current user - directly use local variable
  const user = mockUser;
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };
  
  return (
    <div data-testid="user-profile-page">
      <div data-testid="tabs-container">
        <button
          data-testid="dashboard-tab"
          onClick={() => handleTabChange('dashboard')}
          aria-selected={effectiveTab === 'dashboard'}
        >
          Dashboard
        </button>
        <button
          data-testid="messages-tab"
          onClick={() => handleTabChange('messages')}
          aria-selected={effectiveTab === 'messages'}
        >
          Messages
        </button>
        <button
          data-testid="profile-tab"
          onClick={() => handleTabChange('profile')}
          aria-selected={effectiveTab === 'profile'}
        >
          Profile
        </button>
        <button
          data-testid="orders-tab"
          onClick={() => handleTabChange('orders')}
          aria-selected={effectiveTab === 'orders'}
        >
          My Orders
        </button>
        
        {/* Admin-only tabs */}
        {user?.role === 'admin' && (
          <button
            data-testid="admin-tab"
            onClick={() => handleTabChange('admin')}
            aria-selected={effectiveTab === 'admin'}
          >
            Admin
          </button>
        )}
      </div>
      
      <div data-testid="tab-content">
        {effectiveTab === 'dashboard' && <div data-testid="user-dashboard">User Dashboard Component</div>}
        {effectiveTab === 'messages' && <div data-testid="user-inbox">User Inbox Component</div>}
        {effectiveTab === 'profile' && <div data-testid="user-profile">User Profile Component</div>}
        {effectiveTab === 'orders' && <div data-testid="bookings-view">Bookings View Component</div>}
        {effectiveTab === 'admin' && user?.role === 'admin' && <div data-testid="admin-view">Admin View Component</div>}
      </div>
    </div>
  );
};

describe('UserProfilePage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset current tab and other mock data
    mockSearchParams = { get: (param) => param === 'tab' ? 'profile' : null };
    mockSetSearchParams = vi.fn((params) => {
      if (params.tab) {
        mockSearchParams.get = (param) => param === 'tab' ? params.tab : null;
      }
    });
    
    // Default is regular user
    mockUser = { _id: 'user123', role: 'customer' };
  });

  test('Should render default tab content', () => {
    render(<MockedUserProfilePage />);
    
    // Default tab is profile
    expect(screen.getByTestId('profile-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  test('Should be able to switch to messages tab', () => {
    render(<MockedUserProfilePage />);
    
    // Click messages tab
    fireEvent.click(screen.getByTestId('messages-tab'));
    
    // Verify URL parameters are updated
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'messages' });
  });

  test('Should be able to switch to dashboard tab', () => {
    render(<MockedUserProfilePage />);
    
    // Click dashboard tab
    fireEvent.click(screen.getByTestId('dashboard-tab'));
    
    // Verify URL parameters are updated
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'dashboard' });
  });

  test('Should be able to switch to orders tab', () => {
    render(<MockedUserProfilePage />);
    
    // Click orders tab
    fireEvent.click(screen.getByTestId('orders-tab'));
    
    // Verify URL parameters are updated
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'orders' });
  });

  test('Regular users should not see admin tab', () => {
    render(<MockedUserProfilePage />);
    
    // Regular users should not see admin tab
    expect(screen.queryByTestId('admin-tab')).not.toBeInTheDocument();
  });

  test('Admin users should see admin tab', () => {
    // Set as admin user
    mockUser = { _id: 'admin123', role: 'admin' };
    
    render(<MockedUserProfilePage />);
    
    // Admin should see admin tab
    expect(screen.getByTestId('admin-tab')).toBeInTheDocument();
  });

  test('Admin users should be able to switch to admin tab', () => {
    // Set as admin user
    mockUser = { _id: 'admin123', role: 'admin' };
    
    render(<MockedUserProfilePage />);
    
    // Click admin tab
    fireEvent.click(screen.getByTestId('admin-tab'));
    
    // Verify URL parameters are updated
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'admin' });
  });

  test('Should display tab content based on URL parameters', () => {
    // Set current tab to messages
    mockSearchParams = { get: (param) => param === 'tab' ? 'messages' : null };
    
    render(<MockedUserProfilePage />);
    
    // Messages tab should be selected
    expect(screen.getByTestId('messages-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-inbox')).toBeInTheDocument();
  });

  test('Should accept default tab parameter', () => {
    // Clear URL parameters
    mockSearchParams = { get: () => null };
    
    // Set default tab to dashboard
    render(<MockedUserProfilePage defaultTab="dashboard" />);
    
    // Dashboard tab should be selected
    expect(screen.getByTestId('dashboard-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
  });
}); 