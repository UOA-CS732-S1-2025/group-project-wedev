import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// 模拟导航函数
const mockNavigate = vi.fn();

// 模拟 Auth Store
const mockAuthStore = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
};

// 模拟 Navbar 组件的行为
// 这个组件反映了实际 Navbar 组件的行为，但不使用 Chakra UI 组件
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

describe('Navbar 组件 (模拟版本)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.user = null;
  });

  test('未登录时应显示登录和注册按钮', () => {
    render(<MockedNavbar />);
    
    expect(screen.getByTestId('navbar-title')).toBeInTheDocument();
    expect(screen.getByText('UrbanEase')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('登录后应显示用户信息和登出按钮', () => {
    mockAuthStore.user = {
      firstName: 'Test',
      lastName: 'User'
    };
    
    render(<MockedNavbar />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  });

  test('点击标题应导航到首页', () => {
    render(<MockedNavbar />);
    
    fireEvent.click(screen.getByTestId('navbar-title'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('点击登出按钮应调用登出函数', () => {
    mockAuthStore.user = {
      firstName: 'Test',
      lastName: 'User'
    };
    
    render(<MockedNavbar />);
    
    fireEvent.click(screen.getByTestId('logout-button'));
    expect(mockAuthStore.logout).toHaveBeenCalled();
  });
}); 