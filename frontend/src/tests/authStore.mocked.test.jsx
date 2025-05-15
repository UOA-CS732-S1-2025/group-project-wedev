import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useAuthStore, { initAuthSync } from '../store/authStore';
import api from '../lib/api';

// Mock API requests
vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Replace native localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock event listeners
global.addEventListener = vi.fn();

describe('authStore Tests', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store
    useAuthStore.setState({
      user: null,
      token: null,
      isLoaded: false,
    });
    
    // Get store instance
    store = useAuthStore.getState();
    
    // Mock localStorage returns null
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('Initial state should be logged out', () => {
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isLoaded).toBeFalsy();
  });

  test('Successful login should update store state and localStorage', async () => {
    // Mock successful login response
    const mockUserData = {
      _id: '123',
      username: 'testuser',
      role: 'customer',
    };
    
    const mockToken = 'fake-token-123';
    
    api.post.mockResolvedValueOnce({
      data: {
        user: mockUserData,
        token: mockToken,
      },
    });
    
    // Execute login
    const result = await store.login('test@example.com', 'password123');
    
    // Verify result
    expect(result).toEqual({ success: true });
    
    // Verify API call
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Verify localStorage update
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('login', expect.any(String));
    
    // Verify store state update
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toEqual(mockUserData);
    expect(updatedStore.token).toEqual(mockToken);
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('Failed login should return error message', async () => {
    // Mock login failure
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });
    
    // Execute login
    const result = await store.login('test@example.com', 'wrongpassword');
    
    // Verify error return
    expect(result).toEqual({
      success: false,
      message: 'Invalid credentials',
    });
    
    // Verify store state has not changed
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
  });

  test('Successful registration should return success message', async () => {
    // Mock successful registration response
    api.post.mockResolvedValueOnce({
      data: {
        message: 'Registration successful',
      },
    });
    
    // Execute registration
    const result = await store.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
    });
    
    // Verify result
    expect(result).toEqual({
      success: true,
      message: 'Registration successful',
    });
    
    // Verify API call
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
      role: 'customer',
      location: {
        type: 'Point',
        coordinates: [174.7682, -36.8523],
      },
    });
  });

  test('Failed registration should return error message', async () => {
    // Mock registration failure
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Email already in use',
        },
      },
    });
    
    // Execute registration
    const result = await store.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      password: 'Password123',
    });
    
    // Verify error return
    expect(result).toEqual({
      success: false,
      message: 'Email already in use',
    });
  });

  test('Logout should clear store state and localStorage', () => {
    // First set state to simulate logged in
    useAuthStore.setState({
      user: { id: '123', name: 'John' },
      token: 'fake-token',
      isLoaded: true,
    });
    
    // Execute logout
    store.logout();
    
    // Verify localStorage is cleared
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('logout', expect.any(String));
    
    // Verify store state is reset
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('fetchCurrentUser should correctly fetch user data', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // Mock successful user data response
    const mockUserData = {
      _id: '123',
      username: 'testuser',
      role: 'customer',
    };
    
    api.get.mockResolvedValueOnce({
      data: {
        user: mockUserData,
      },
    });
    
    // Execute fetch user data
    await store.fetchCurrentUser();
    
    // Verify API call
    expect(api.get).toHaveBeenCalledWith('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
    
    // Verify store state update
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toEqual(mockUserData);
    expect(updatedStore.token).toEqual(mockToken);
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('fetchCurrentUser failure should clear token and user data', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // Mock fetch user data failure
    api.get.mockRejectedValueOnce(new Error('Fetch failed'));
    
    // Execute fetch user data
    await store.fetchCurrentUser();
    
    // Verify localStorage is cleared
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Verify store state is reset
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('initAuthSync should set up cross-tab authentication sync', () => {
    const mockToken = 'test-token';
    const mockHandler = vi.fn();
    
    // Initialize auth sync
    initAuthSync(mockHandler);
    
    // Verify event listeners are set up
    expect(global.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    
    // Simulate login event from another tab
    const storageEvent = new Event('storage');
    Object.defineProperty(storageEvent, 'key', { value: 'login' });
    
    // Mock localStorage to return token when checked
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // Trigger the event handler
    global.addEventListener.mock.calls[0][1](storageEvent);
    
    // Verify handler was called
    expect(mockHandler).toHaveBeenCalled();
  });
}); 