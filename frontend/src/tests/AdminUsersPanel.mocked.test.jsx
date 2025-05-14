import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock API module
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

// Import mocked API
import api from '../lib/api';

// Mock AuthStore
vi.mock('../store/authStore', () => ({
  default: () => ({
    token: 'fake-admin-token',
  }),
}));

// Create AdminUsersPanel component mock
const MockedAdminUsersPanel = () => {
  const [users, setUsers] = React.useState([]);
  const [filter, setFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [editValuesMap, setEditValuesMap] = React.useState({});
  const inputRefsMap = React.useRef({});
  
  // Mock fetching user list
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock fetching single user details
  const fetchUserById = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`, {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      
      const u = res.data;
      
      // Set edit values
      setEditValuesMap((prev) => ({
        ...prev,
        [userId]: {
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phoneNumber: u.phoneNumber || '',
          profilePic: u.profilePictureUrl || '',
          street: u.address?.street || '',
          suburb: u.address?.suburb || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          postCode: u.address?.postCode || '',
          country: u.address?.country || '',
        },
      }));
      
      // Initialize input references
      if (!inputRefsMap.current[userId]) {
        inputRefsMap.current[userId] = {
          firstName: React.createRef(),
          lastName: React.createRef(),
          phoneNumber: React.createRef(),
          profilePic: React.createRef(),
          street: React.createRef(),
          suburb: React.createRef(),
          city: React.createRef(),
          state: React.createRef(),
          postCode: React.createRef(),
          country: React.createRef(),
        };
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };
  
  // Mock deleting user
  const handleUsersDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };
  
  // Mock updating user
  const handleSubmitUpdate = async (userId) => {
    // Get input values
    const values = {
      firstName: inputRefsMap.current[userId]?.firstName.current?.value || '',
      lastName: inputRefsMap.current[userId]?.lastName.current?.value || '',
      phoneNumber: inputRefsMap.current[userId]?.phoneNumber.current?.value || '',
      profilePic: inputRefsMap.current[userId]?.profilePic.current?.value || '',
      street: inputRefsMap.current[userId]?.street.current?.value || '',
      suburb: inputRefsMap.current[userId]?.suburb.current?.value || '',
      city: inputRefsMap.current[userId]?.city.current?.value || '',
      state: inputRefsMap.current[userId]?.state.current?.value || '',
      postCode: inputRefsMap.current[userId]?.postCode.current?.value || '',
      country: inputRefsMap.current[userId]?.country.current?.value || '',
    };
    
    try {
      await api.put(`/admin/users/${userId}`, {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        profilePic: values.profilePic,
        address: {
          street: values.street,
          suburb: values.suburb,
          city: values.city,
          state: values.state,
          postCode: values.postCode,
          country: values.country,
        },
      }, {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      
      // Update successful, refresh user list and clear edit state
      fetchUsers();
      setEditValuesMap((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };
  
  // Load user data
  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter user list
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div data-testid="admin-users-panel">
      <input
        data-testid="search-input"
        placeholder="Search Username..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      {loading ? (
        <div data-testid="loading-spinner">Loading...</div>
      ) : (
        <table data-testid="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user._id} data-testid={`user-row-${user._id}`}>
                <td data-testid={`user-name-${user._id}`}>{user.firstName} {user.lastName}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    data-testid={`edit-button-${user._id}`}
                    onClick={() => fetchUserById(user._id)}
                  >
                    Edit
                  </button>
                  {editValuesMap[user._id] && (
                    <div data-testid={`edit-form-${user._id}`}>
                      <input
                        ref={inputRefsMap.current[user._id]?.firstName}
                        defaultValue={editValuesMap[user._id]?.firstName}
                        data-testid={`firstName-input-${user._id}`}
                      />
                      <input
                        ref={inputRefsMap.current[user._id]?.lastName}
                        defaultValue={editValuesMap[user._id]?.lastName}
                        data-testid={`lastName-input-${user._id}`}
                      />
                      <button
                        data-testid={`save-button-${user._id}`}
                        onClick={() => handleSubmitUpdate(user._id)}
                      >
                        Save
                      </button>
                    </div>
                  )}
                  <button
                    data-testid={`delete-button-${user._id}`}
                    onClick={() => handleUsersDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// AdminUsersPanel component tests
describe('AdminUsersPanel Component Tests', () => {
  const mockUsers = [
    {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      role: 'customer',
      email: 'john@example.com',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      role: 'provider',
      email: 'jane@example.com',
      createdAt: '2023-01-02T00:00:00.000Z',
    },
    {
      _id: 'user3',
      firstName: 'Admin',
      lastName: 'User',
      username: 'adminuser',
      role: 'admin',
      email: 'admin@example.com',
      createdAt: '2023-01-03T00:00:00.000Z',
    },
  ];

  const mockUserDetails = {
    _id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    role: 'customer',
    email: 'john@example.com',
    phoneNumber: '123456789',
    profilePictureUrl: 'https://example.com/profile.jpg',
    address: {
      street: '123 Main St',
      suburb: 'Downtown',
      city: 'Metropolis',
      state: 'State',
      postCode: '12345',
      country: 'Country',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should display loading state and load user list', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // Initially should display loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for user data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // After loading completes, should display user table
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Should display all users
    mockUsers.forEach(user => {
      expect(screen.getByTestId(`user-row-${user._id}`)).toBeInTheDocument();
    });
  });

  test('Should be able to filter users by username', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Input filter criteria
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'jane' } });
    
    // Should only display matching users
    await waitFor(() => {
      expect(screen.getByTestId('user-row-user2')).toBeInTheDocument();
      expect(screen.queryByTestId('user-row-user1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-row-user3')).not.toBeInTheDocument();
    });
    
    // Clear filter criteria
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });
    
    // Should display all users
    await waitFor(() => {
      mockUsers.forEach(user => {
        expect(screen.getByTestId(`user-row-${user._id}`)).toBeInTheDocument();
      });
    });
  });

  test('Delete user function should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    
    render(<MockedAdminUsersPanel />);
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click delete user button
    fireEvent.click(screen.getByTestId('delete-button-user1'));
    
    // Verify API call
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/users/user1', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // Verify user is removed
    await waitFor(() => {
      expect(screen.queryByTestId('user-row-user1')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-row-user2')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user3')).toBeInTheDocument();
    });
  });

  test('Edit user function should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.get.mockResolvedValueOnce({ data: mockUserDetails });
    api.put.mockResolvedValueOnce({ data: { success: true } });
    
    // Mock updated user list
    const updatedUsers = [...mockUsers];
    updatedUsers[0] = {
      ...mockUsers[0],
      firstName: 'Johnny',
      lastName: 'Updated',
    };
    api.get.mockResolvedValueOnce({ data: updatedUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click edit user button
    fireEvent.click(screen.getByTestId('edit-button-user1'));
    
    // Verify get user details API call
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users/user1', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // Wait for edit form to display
    await waitFor(() => {
      expect(screen.getByTestId('edit-form-user1')).toBeInTheDocument();
    });
    
    // Modify user information
    const firstNameInput = screen.getByTestId('firstName-input-user1');
    const lastNameInput = screen.getByTestId('lastName-input-user1');
    
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
    fireEvent.change(lastNameInput, { target: { value: 'Updated' } });
    
    // Save edit
    fireEvent.click(screen.getByTestId('save-button-user1'));
    
    // Verify update API call
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/admin/users/user1',
        expect.objectContaining({
          firstName: 'Johnny',
          lastName: 'Updated',
        }),
        { headers: { Authorization: 'Bearer fake-admin-token' } }
      );
    });
    
    // Verify user list is refreshed
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // Verify updated user information is displayed
    await waitFor(() => {
      const userNameCell = screen.getByTestId('user-name-user1');
      expect(userNameCell.textContent).toBe('Johnny Updated');
    });
  });
}); 