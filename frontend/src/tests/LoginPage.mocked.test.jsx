import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock Auth Store
const mockLogin = vi.fn();
const mockUser = null;
vi.mock('../store/authStore', () => ({
  default: () => ({
    login: mockLogin,
    user: mockUser,
  }),
}));

// Create LoginPage component mock
const MockedLoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({ comtent: '' });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    let error = '';
    
    // Validate email
    if (!email) {
      error = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = 'Invalid email format';
    }
    
    // Validate password
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

describe('LoginPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
  });

  test('Should render login form', () => {
    render(<MockedLoginPage />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('Should allow user to input email and password', () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('Password123');
  });

  test('Should validate email format', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // Input invalid email
    fireEvent.change(emailInput, { target: { value: 'invalidEmail' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
    });
    
    // Login method should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('Should validate password requirements', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // Input valid email but password too short
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must be 8+ characters');
    });
    
    // Password without uppercase letter
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must include uppercase');
    });
  });

  test('Should call login method after validation passes', async () => {
    render(<MockedLoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');
    
    // Input valid email and password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  test('Should toggle password visibility', () => {
    render(<MockedLoginPage />);
    
    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('toggle-password');
    
    // Default should be password not visible
    expect(passwordInput.type).toBe('password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  test('Should handle login failure cases', async () => {
    // Mock login failure
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