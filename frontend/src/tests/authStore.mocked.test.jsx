import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useAuthStore, { initAuthSync } from '../store/authStore';
import api from '../lib/api';

// 模拟 API 请求
vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

// 模拟 localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// 替换原生的 localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// 模拟事件监听器
global.addEventListener = vi.fn();

describe('authStore 测试', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 重置 store
    useAuthStore.setState({
      user: null,
      token: null,
      isLoaded: false,
    });
    
    // 获取 store 实例
    store = useAuthStore.getState();
    
    // 模拟 localStorage 返回 null
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('初始状态应该是未登录', () => {
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isLoaded).toBeFalsy();
  });

  test('登录成功应更新 store 状态和 localStorage', async () => {
    // 模拟成功的登录响应
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
    
    // 执行登录
    const result = await store.login('test@example.com', 'password123');
    
    // 验证结果
    expect(result).toEqual({ success: true });
    
    // 验证 API 调用
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    
    // 验证 localStorage 更新
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('login', expect.any(String));
    
    // 验证 store 状态更新
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toEqual(mockUserData);
    expect(updatedStore.token).toEqual(mockToken);
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('登录失败应返回错误消息', async () => {
    // 模拟登录失败
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });
    
    // 执行登录
    const result = await store.login('test@example.com', 'wrongpassword');
    
    // 验证返回错误
    expect(result).toEqual({
      success: false,
      message: 'Invalid credentials',
    });
    
    // 验证 store 状态没有改变
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
  });

  test('注册成功应返回成功消息', async () => {
    // 模拟成功的注册响应
    api.post.mockResolvedValueOnce({
      data: {
        message: 'Registration successful',
      },
    });
    
    // 执行注册
    const result = await store.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
    });
    
    // 验证结果
    expect(result).toEqual({
      success: true,
      message: 'Registration successful',
    });
    
    // 验证 API 调用
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
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

  test('注册失败应返回错误消息', async () => {
    // 模拟注册失败
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Email already in use',
        },
      },
    });
    
    // 执行注册
    const result = await store.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      password: 'Password123',
    });
    
    // 验证返回错误
    expect(result).toEqual({
      success: false,
      message: 'Email already in use',
    });
  });

  test('登出应清除 store 状态和 localStorage', () => {
    // 先设置状态，模拟已登录
    useAuthStore.setState({
      user: { id: '123', name: 'John' },
      token: 'fake-token',
      isLoaded: true,
    });
    
    // 执行登出
    store.logout();
    
    // 验证 localStorage 被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('logout', expect.any(String));
    
    // 验证 store 状态被重置
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('fetchCurrentUser 应正确获取用户数据', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // 模拟成功的用户数据响应
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
    
    // 执行获取用户数据
    await store.fetchCurrentUser();
    
    // 验证 API 调用
    expect(api.get).toHaveBeenCalledWith('/auth/me', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
    
    // 验证 store 状态更新
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toEqual(mockUserData);
    expect(updatedStore.token).toEqual(mockToken);
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('fetchCurrentUser 失败应清除 token 和用户数据', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // 模拟获取用户数据失败
    api.get.mockRejectedValueOnce(new Error('Fetch failed'));
    
    // 执行获取用户数据
    await store.fetchCurrentUser();
    
    // 验证 localStorage 被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    // 验证 store 状态被重置
    const updatedStore = useAuthStore.getState();
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
    expect(updatedStore.isLoaded).toBeTruthy();
  });

  test('initAuthSync 应添加事件监听器', () => {
    // 模拟 window 对象
    const windowObj = { addEventListener: vi.fn() };
    global.window = windowObj;
    
    // 执行 initAuthSync
    const mockFetchCurrentUser = vi.fn();
    initAuthSync(mockFetchCurrentUser);
    
    // 验证事件监听器被添加
    expect(windowObj.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  test('storage 事件处理函数应正确处理登出', () => {
    // 模拟 storage 事件的处理函数
    const mockStorageEventHandler = vi.fn();
    global.window = {
      addEventListener: (event, handler) => {
        if (event === 'storage') {
          mockStorageEventHandler.mockImplementation(handler);
        }
      },
      location: { href: '' },
    };
    
    // 初始化事件监听
    const mockFetchCurrentUser = vi.fn();
    initAuthSync(mockFetchCurrentUser);
    
    // 触发登出事件
    mockStorageEventHandler({ key: 'logout' });
    
    // 验证 localStorage.removeItem 被调用
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    // 验证导航到登录页面
    expect(global.window.location.href).toBe('/login');
  });
}); 