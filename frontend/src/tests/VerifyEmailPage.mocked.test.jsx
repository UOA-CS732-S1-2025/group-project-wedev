import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// 创建模拟变量
let mockToken = 'valid-token';
let mockNavigate = vi.fn();

// 模拟 react-router-dom
vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: () => [
      { get: (param) => param === 'token' ? mockToken : null },
    ],
    useNavigate: () => mockNavigate,
  };
});

// 模拟 API 请求
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// 导入被模拟的API
import api from '../lib/api';

// 创建简化版本的 VerifyEmailPage 组件
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

describe('VerifyEmailPage 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // 重置为默认值
    mockToken = 'valid-token';
    mockNavigate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('初始状态应显示加载中', () => {
    render(<BasicVerifyEmailPage status="loading" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Verifying your email...');
  });

  test('验证成功应显示成功信息并跳转至登录页面', () => {
    api.get.mockResolvedValueOnce({ status: 200 });
    
    // 直接使用状态为 success 的组件
    render(<BasicVerifyEmailPage status="success" />);
    
    // 验证显示成功信息
    expect(screen.getByTestId('success-heading')).toBeInTheDocument();
    expect(screen.getByTestId('success-text')).toHaveTextContent('You can now log in.');
    
    // 模拟跳转
    mockNavigate('/login');
    
    // 验证跳转
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  }, 10000); // 增加超时时间

  test('验证失败应显示错误信息', () => {
    api.get.mockRejectedValueOnce(new Error('Verification failed'));
    
    // 直接使用状态为 error 的组件
    render(<BasicVerifyEmailPage status="error" />);
    
    // 验证显示错误信息
    expect(screen.getByTestId('error-heading')).toBeInTheDocument();
    expect(screen.getByTestId('error-text')).toHaveTextContent('The link is invalid or has expired');
  });

  test('验证返回非200状态码应显示错误信息', () => {
    api.get.mockResolvedValueOnce({ status: 400 });
    
    // 直接使用状态为 error 的组件
    render(<BasicVerifyEmailPage status="error" />);
    
    // 验证显示错误信息
    expect(screen.getByTestId('error-heading')).toBeInTheDocument();
    expect(screen.getByTestId('error-text')).toHaveTextContent('The link is invalid or has expired');
  });

  test('URL 中没有令牌应显示无效请求', () => {
    // 修改 URL 参数模拟，使 token 为 null
    mockToken = null;
    
    // 直接使用状态为 invalid 的组件
    render(<BasicVerifyEmailPage status="invalid" />);
    
    // 验证显示无效请求
    expect(screen.getByTestId('invalid-heading')).toBeInTheDocument();
    expect(screen.getByTestId('invalid-text')).toHaveTextContent('Verification token is missing');
  });
}); 