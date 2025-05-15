import { SystemProvider, createSystem } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import React from 'react';

// Mock UserNavActions component
vi.mock("../components/UserNavActions", () => ({
  default: () => <div data-testid="user-nav-actions">User Nav Actions</div>
}));

// 创建测试用的系统配置
const system = createSystem({
  theme: {
    styles: {
      global: {
        '*': {
          boxSizing: 'border-box',
        },
      },
    },
    components: {
      Button: {
        defaultProps: {
          colorPalette: 'gray',
        },
      },
      Container: {
        defaultProps: {
          maxW: '1920px',
        },
      },
    },
  },
});

/**
 * 自定义渲染函数，包装了必要的 providers
 * @param {React.ReactElement} ui - 要渲染的组件
 * @param {Object} options - 配置选项
 * @param {string} options.route - 初始路由路径
 * @returns {Object} 渲染结果和其他工具函数
 */
export function renderWithProviders(ui, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);

  return {
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <SystemProvider value={system}>
          {ui}
        </SystemProvider>
      </MemoryRouter>
    ),
    system,
  };
} 