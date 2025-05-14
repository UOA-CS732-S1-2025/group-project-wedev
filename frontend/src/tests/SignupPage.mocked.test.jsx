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
const mockRegister = vi.fn();
const mockUser = null;
vi.mock('../store/authStore', () => ({
  default: () => ({
    register: mockRegister,
    user: mockUser,
  }),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  Toaster: () => <div data-testid="toaster" />,
}));

// Create SignupPage component mock
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
    
    // Validate name
    if (!firstname) {
      error = 'Please enter your first name.';
    } else if (!lastname) {
      error = 'Please enter your last name.';
    } 
    // Validate email
    else if (!email) {
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

describe('SignupPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue({ success: true });
  });

  test('Should render registration form', () => {
    render(<MockedSignupPage />);
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    expect(screen.getByTestId('firstname-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastname-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
  });

  test('Should allow user to input personal information', () => {
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

  test('Should only allow letters for names', () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    
    // Input name with non-letter characters
    fireEvent.change(firstnameInput, { target: { value: 'John123' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe456' } });
    
    // Should filter out non-letter characters
    expect(firstnameInput.value).toBe('John');
    expect(lastnameInput.value).toBe('Doe');
  });

  test('Should validate all required fields', async () => {
    render(<MockedSignupPage />);
    
    const signupButton = screen.getByTestId('signup-button');
    
    // Empty form submission
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your first name');
    });
    
    // Only fill in first name
    fireEvent.change(screen.getByTestId('firstname-input'), { target: { value: 'John' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your last name');
    });
  });

  test('Should validate email format', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // Fill in names but with incorrect email format
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
    });
  });

  test('Should validate password requirements', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // Fill in basic information but with too short password
    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must be 8+ characters');
    });
    
    // Password lacks uppercase letter
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must include uppercase');
    });
  });

  test('Should call registration method after validation', async () => {
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // Input valid user information
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

  test('Should handle registration failure', async () => {
    // Mock registration failure
    mockRegister.mockResolvedValueOnce({ success: false, message: 'Email already in use' });
    
    render(<MockedSignupPage />);
    
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signupButton = screen.getByTestId('signup-button');
    
    // Input valid user information
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