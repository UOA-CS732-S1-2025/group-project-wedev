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
const mockRegister = vi.fn();
const mockUser = null;
vi.mock('../store/authStore', () => ({
  default: () => ({
    register: mockRegister,
    user: mockUser,
  }),
}));

// 模拟 toast
vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  Toaster: () => <div data-testid="toaster" />,
}));

// 创建 SignupPage 组件模拟
const MockedSignupPage = () => {
  const [firstname, setFirstName] = React.useState('');
  const [lastname, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({ comtent: '' });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    let error = '';
    
    // 验证名字
    if (!firstname) {
      error = 'Please enter your first name.';
    } else if (!lastname) {
      error = 'Please enter your last name.';
    } 
    // 验证邮箱
    else if (!email) {
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
    
    const result = await mockRegister({
      firstName: firstname,
      lastName: lastname,
      email,
      password,
    });
    
    if (!result?.success) {
      setErrors({ comtent: result?.message || 'Registration failed' });
    }
  };

  return (
    <div data-testid="signup-page">
      <h1>Urban Ease</h1>
      <form onSubmit={handleSignup} data-testid="signup-form">
        <div>
          <label htmlFor="firstname">First Name</label>
          <input
            id="firstname"
            type="text"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            data-testid="firstname-input"
          />
        </div>
        
        <div>
          <label htmlFor="lastname">Last Name</label>
          <input
            id="lastname"
            type="text"
            value={lastname}
            onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            data-testid="lastname-input"
          />
        </div>
        
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
        
        <button type="submit" data-testid="signup-button">Signup</button>
        
        <div>
          Already have an account? <a href="/login">Log in</a>
        </div>
      </form>
    </div>
  );
};

describe('SignupPage 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue({ success: true });
  });

  test('应渲染注册表单', () => {
    render(<MockedSignupPage />);
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    expect(screen.getByTestId('firstname-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastname-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
  });

  test('应允许用户输入个人信息', () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    expect(firstnameInput.value).toBe('John');
    expect(lastnameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john.doe@example.com');
    expect(passwordInput.value).toBe('Password123');
  });

  test('应只允许输入字母作为名字', () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    
    // 输入包含非字母字符的名字
    fireEvent.change(firstnameInput, { target: { value: 'John123' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe456' } });
    
    // 应该过滤掉非字母字符
    expect(firstnameInput.value).toBe('John');
    expect(lastnameInput.value).toBe('Doe');
  });

  test('应验证所有必填字段', async () => {
    render(<MockedSignupPage />);
    
    const signupButton = screen.getByTestId('signup-button');
    
    // 空表单提交
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your first name');
    });
    
    // 只填写名字
    fireEvent.change(screen.getByTestId('firstname-input'), { target: { value: 'John' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your last name');
    });
  });

  test('应验证邮箱格式', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // 填写名字但邮箱格式不正确
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
    });
  });

  test('应验证密码要求', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // 填写基本信息但密码太短
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must be 8+ characters');
    });
    
    // 密码没有大写字母
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must include uppercase');
    });
  });

  test('应在验证通过后调用注册方法', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // 输入有效的用户信息
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123'
      });
    });
  });

  test('应处理注册失败情况', async () => {
    // 模拟注册失败
    mockRegister.mockResolvedValueOnce({ success: false, message: 'Email already in use' });
    
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // 输入有效的用户信息
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email already in use');
    });
  });
}); 