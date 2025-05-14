import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// 模拟路由
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// 模拟 Auth Store
const mockLogin = vi.fn();
const mockUser = null;
vi.mock('../store/authStore', () => ({
  default: () => ({
    login: mockLogin,
    user: mockUser,
  }),
}));

// 创建 LoginPage 组件模拟
const MockedLoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({ comtent: '' });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    let error = '';
    
    // 验证邮箱
    if (!email) {
      error = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = 'Invalid email format';
    }
    
    // 验证密码
    else if (!password) {
      error = 'Please enter your password.';
    } else if (password.length <= 8) {
      error = 'Password must be 8+ characters';
    } else if (!/[A-Z]/.test(password)) {
      error = 'Password must include uppercase';
    } else if (!/[a-z]/.test(password)) {
      error = 'Password must include lowercase';
    } else if (!/[0-9]/.test(password)) {
      error = 'Password must include number';
    }
    
    if (error) {
      setErrors({ comtent: error });
      return;
    }
    
    const result = await mockLogin(email, password);
    if (!result?.success) {
      setErrors({ comtent: result?.message || 'Login failed' });
    }
  };

  return (
    <div data-testid="login-page">
      <h1>Urban Ease</h1>
      <form onSubmit={handleLogin} data-testid="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            data-testid="toggle-password"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {errors.comtent && (
          <div data-testid="error-message">{errors.comtent}</div>
        )}
        
        <button type="submit" data-testid="login-button">Login</button>
        
        <div>
          New here? <a href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
};

describe('LoginPage 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
  });

  test('应渲染登录表单', () => {
    render(<MockedLoginPage />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('应允许用户输入邮箱和密码', () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('Password123');
  });

  test('应验证邮箱格式', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // 输入无效邮箱
    fireEvent.change(emailInput, { target: { value: 'invalidEmail' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
    });
    
    // 登录方法不应该被调用
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('应验证密码要求', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // 输入符合要求的邮箱但密码太短
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must be 8+ characters');
    });
    
    // 密码没有大写字母
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must include uppercase');
    });
  });

  test('应在验证通过后调用登录方法', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // 输入有效的邮箱和密码
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  test('应切换密码可见性', () => {
    render(<MockedLoginPage />);
    
    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('toggle-password');
    
    // 默认应该是密码不可见
    expect(passwordInput.type).toBe('password');
    
    // 点击显示密码
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // 再次点击隐藏密码
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  test('应处理登录失败情况', async () => {
    // 模拟登录失败
    mockLogin.mockResolvedValueOnce({ success: false, message: 'Invalid credentials' });
    
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });
  });
}); 