import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { defaultSystem } from '@chakra-ui/react';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock window.scrollTo
global.scrollTo = vi.fn();

// 设置 Chakra UI 的默认配置
global.chakraConfig = defaultSystem;

// 清除所有 mock
afterEach(() => {
  vi.clearAllMocks();
}); 