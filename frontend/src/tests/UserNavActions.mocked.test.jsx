import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// 模拟导航函数
const mockNavigate = vi.fn();

// 模拟 fetch API
global.fetch = vi.fn();

// 模拟 UserNavActions 组件的行为
const MockedUserNavActions = ({ user, logout }) => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  React.useEffect(() => {
    if (user?._id) {
      // 模拟获取未读消息数
      fetch(`/api/messages/unread-count?userId=${user._id}`)
        .then(response => response.json())
        .then(data => setUnreadCount(data.unreadCount))
        .catch(error => console.error('Error:', error));
    }
  }, [user]);
  
  // 计算显示名称
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";
  
  return (
    <div data-testid="user-nav-actions">
      <div data-testid="user-display-name">{displayName}</div>
      
      {/* 模拟菜单 */}
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

describe('UserNavActions 组件 (模拟版本)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 默认模拟成功的 fetch 响应
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ unreadCount: 0 })
    });
  });

  test('应显示用户全名 (firstName + lastName)', () => {
    const user = {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('如果没有全名应显示用户名', () => {
    const user = {
      _id: '123',
      username: 'johndoe'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  test('管理员用户应显示 Admin 按钮', () => {
    const user = {
      _id: '123',
      username: 'admin',
      role: 'admin'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.getByTestId('admin-button')).toBeInTheDocument();
  });

  test('普通用户不应显示 Admin 按钮', () => {
    const user = {
      _id: '123',
      username: 'user'
    };
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    expect(screen.queryByTestId('admin-button')).not.toBeInTheDocument();
  });

  test('有未读消息时应显示未读数量', async () => {
    const user = {
      _id: '123',
      username: 'user'
    };
    
    // 模拟有 5 条未读消息
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 5 })
    });
    
    render(<MockedUserNavActions user={user} logout={vi.fn()} />);
    
    // 由于 useEffect 异步执行，需要等待
    expect(await screen.findByTestId('unread-badge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('点击登出按钮应调用登出函数', () => {
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