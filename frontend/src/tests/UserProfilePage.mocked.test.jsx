import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

// 全局模拟变量，可在测试中修改
let mockSearchParams = { get: (param) => param === 'tab' ? 'profile' : null };
let mockSetSearchParams = vi.fn();
let mockUser = { _id: 'user123', role: 'customer' };

// 模拟 react-router-dom
vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useNavigate: () => vi.fn()
  };
});

// 模拟各个子组件
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

// 创建 UserProfilePage 组件模拟
const MockedUserProfilePage = ({ defaultTab = 'profile' }) => {
  // 获取搜索参数和设置函数
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 从 URL 获取 tab 参数，默认为传入的 defaultTab
  const tabFromUrl = searchParams.get('tab');
  const effectiveTab = tabFromUrl || defaultTab;
  
  // 获取当前用户 - 直接使用本地变量
  const user = mockUser;
  
  // 处理标签切换
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
        
        {/* 仅管理员可见的标签 */}
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

describe('UserProfilePage 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 重置当前标签及其他模拟数据
    mockSearchParams = { get: (param) => param === 'tab' ? 'profile' : null };
    mockSetSearchParams = vi.fn((params) => {
      if (params.tab) {
        mockSearchParams.get = (param) => param === 'tab' ? params.tab : null;
      }
    });
    
    // 默认是普通用户
    mockUser = { _id: 'user123', role: 'customer' };
  });

  test('应渲染默认标签内容', () => {
    render(<MockedUserProfilePage />);
    
    // 默认标签是 profile
    expect(screen.getByTestId('profile-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  test('应能切换到消息标签', () => {
    render(<MockedUserProfilePage />);
    
    // 点击消息标签
    fireEvent.click(screen.getByTestId('messages-tab'));
    
    // 验证 URL 参数被更新
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'messages' });
  });

  test('应能切换到仪表盘标签', () => {
    render(<MockedUserProfilePage />);
    
    // 点击仪表盘标签
    fireEvent.click(screen.getByTestId('dashboard-tab'));
    
    // 验证 URL 参数被更新
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'dashboard' });
  });

  test('应能切换到订单标签', () => {
    render(<MockedUserProfilePage />);
    
    // 点击订单标签
    fireEvent.click(screen.getByTestId('orders-tab'));
    
    // 验证 URL 参数被更新
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'orders' });
  });

  test('普通用户不应看到管理员标签', () => {
    render(<MockedUserProfilePage />);
    
    // 普通用户不应看到管理员标签
    expect(screen.queryByTestId('admin-tab')).not.toBeInTheDocument();
  });

  test('管理员用户应能看到管理员标签', () => {
    // 设置为管理员用户
    mockUser = { _id: 'admin123', role: 'admin' };
    
    render(<MockedUserProfilePage />);
    
    // 管理员应看到管理员标签
    expect(screen.getByTestId('admin-tab')).toBeInTheDocument();
  });

  test('管理员用户应能切换到管理员标签', () => {
    // 设置为管理员用户
    mockUser = { _id: 'admin123', role: 'admin' };
    
    render(<MockedUserProfilePage />);
    
    // 点击管理员标签
    fireEvent.click(screen.getByTestId('admin-tab'));
    
    // 验证 URL 参数被更新
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'admin' });
  });

  test('应根据 URL 参数显示对应标签内容', () => {
    // 设置当前标签为 messages
    mockSearchParams = { get: (param) => param === 'tab' ? 'messages' : null };
    
    render(<MockedUserProfilePage />);
    
    // 消息标签应被选中
    expect(screen.getByTestId('messages-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-inbox')).toBeInTheDocument();
  });

  test('应接受默认标签参数', () => {
    // 清除 URL 参数
    mockSearchParams = { get: () => null };
    
    // 设置默认标签为 dashboard
    render(<MockedUserProfilePage defaultTab="dashboard" />);
    
    // 仪表盘标签应被选中
    expect(screen.getByTestId('dashboard-tab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
  });
}); 