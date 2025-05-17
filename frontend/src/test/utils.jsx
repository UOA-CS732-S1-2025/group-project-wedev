import { SystemProvider, createSystem } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import React from 'react';

// Mock UserNavActions component
vi.mock("../components/UserNavActions", () => ({
  default: () => <div data-testid="user-nav-actions">User Nav Actions</div>
}));

// Create system configuration for testing
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
 * Custom render function wrapping necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Configuration options
 * @param {string} options.route - Initial route path
 * @returns {Object} Render result and other utility functions
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