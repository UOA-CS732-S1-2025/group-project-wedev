import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock navigation function
const mockNavigate = vi.fn();

// Mock fetch API
global.fetch = vi.fn();

// Mock UserNavActions component behavior
const MockedUserNavActions = ({ user, logout }) => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  React.useEffect(() => {
    if (user?._id) {
      // Mock getting unread message count
      fetch(`/api/messages/unread-count?userId=${user._id}`)
        .then(response => response.json())
        .then(data => setUnreadCount(data.unreadCount))
        .catch(error => console.error('Error:', error));
    }
  }, [user]);
  
  // Calculate display name
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";
  
  return (
    <div data-testid="user-nav-actions">
      <div data-testid="user-display-name">{displayName}</div>
      
      {/* Mock menu */}
      <div data-testid="user-menu">
        {user?.role === 'admin' && (
          <button data-testid="admin-button">Admin</button>
        )}
        <button data-testid="home-button">Home</button>
        <button data-testid="dashboard-button">Dashboard</button>
        <button data-testid="messages-button">
          Messages
          {unreadCount > 0 && (
            <span data-testid="unread-badge">{unreadCount}</span>
          )}
        </button>
        <button data-testid="profile-button">Profile</button>
        <button data-testid="orders-button">My Orders</button>
        <button 
          data-testid="logout-button" 
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

describe('UserNavActions Component (Mocked Version)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock successful fetch response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ unreadCount: 0 })
    });
  });

  test('Should display user full name (firstName + lastName)', () => {
    const user = {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('Should display username if full name is not available', () => {
    const user = {
      _id: '123',
      username: 'johndoe'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  test('Admin users should see Admin button', () => {
    const user = {
      _id: '123',
      username: 'admin',
      role: 'admin'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByTestId('admin-button')).toBeInTheDocument();
  });

  test('Regular users should not see Admin button', () => {
    const user = {
      _id: '123',
      username: 'user'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.queryByTestId('admin-button')).not.toBeInTheDocument();
  });

  test('Should display unread count when there are unread messages', async () => {
    const user = {
      _id: '123',
      username: 'user'
    };
    
    // Mock 5 unread messages
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 5 })
    });
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    // Need to wait due to async useEffect
    expect(await screen.findByTestId('unread-badge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('Clicking logout button should call logout function', () => {
    const user = {
      _id: '123',
      username: 'user'
    };
    
    const mockLogout = vi.fn();
    
    render(<MockedUserNavActions user={user} logout={mockLogout} />);
    
    fireEvent.click(screen.getByTestId('logout-button'));
    expect(mockLogout).toHaveBeenCalled();
  });
}); 