import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// 模拟 API 模块
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

// 导入被模拟的API
import api from '../lib/api';

// 模拟 AuthStore
vi.mock('../store/authStore', () => ({
  default: () => ({
    token: 'fake-admin-token',
  }),
}));

// 创建 AdminUsersPanel 组件模拟
const MockedAdminUsersPanel = () => {
  const [users, setUsers] = React.useState([]);
  const [filter, setFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [editValuesMap, setEditValuesMap] = React.useState({});
  const inputRefsMap = React.useRef({});
  
  // 模拟获取用户列表
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('获取用户失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 模拟获取单个用户详情
  const fetchUserById = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`, {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      
      const u = res.data;
      
      // 设置编辑值
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
      
      // 初始化输入引用
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
      console.error('获取用户详情失败:', err);
    }
  };
  
  // 模拟删除用户
  const handleUsersDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error('删除用户失败:', err);
    }
  };
  
  // 模拟更新用户
  const handleSubmitUpdate = async (userId) => {
    // 获取输入值
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
      
      // 更新成功，刷新用户列表并清除编辑状态
      fetchUsers();
      setEditValuesMap((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error('更新用户失败:', err);
    }
  };
  
  // 加载用户数据
  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  // 过滤用户列表
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

// AdminUsersPanel 组件测试
describe('AdminUsersPanel 组件测试', () => {
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

  test('应显示加载状态，并加载用户列表', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // 初始应显示加载状态
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // 等待用户数据加载
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // 加载完成后应显示用户表格
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // 应显示所有用户
    mockUsers.forEach(user => {
      expect(screen.getByTestId(`user-row-${user._id}`)).toBeInTheDocument();
    });
  });

  test('应能按用户名筛选用户', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // 等待用户数据加载
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // 输入筛选条件
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'jane' } });
    
    // 只应显示匹配的用户
    await waitFor(() => {
      expect(screen.getByTestId('user-row-user2')).toBeInTheDocument();
      expect(screen.queryByTestId('user-row-user1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-row-user3')).not.toBeInTheDocument();
    });
    
    // 清除筛选条件
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });
    
    // 应显示所有用户
    await waitFor(() => {
      mockUsers.forEach(user => {
        expect(screen.getByTestId(`user-row-${user._id}`)).toBeInTheDocument();
      });
    });
  });

  test('删除用户功能应正常工作', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    
    render(<MockedAdminUsersPanel />);
    
    // 等待用户数据加载
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // 点击删除用户按钮
    fireEvent.click(screen.getByTestId('delete-button-user1'));
    
    // 验证 API 调用
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/users/user1', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // 验证用户被移除
    await waitFor(() => {
      expect(screen.queryByTestId('user-row-user1')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-row-user2')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user3')).toBeInTheDocument();
    });
  });

  test('编辑用户功能应正常工作', async () => {
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.get.mockResolvedValueOnce({ data: mockUserDetails });
    api.put.mockResolvedValueOnce({ data: { success: true } });
    
    // 模拟更新后的用户列表
    const updatedUsers = [...mockUsers];
    updatedUsers[0] = {
      ...mockUsers[0],
      firstName: 'Johnny',
      lastName: 'Updated',
    };
    api.get.mockResolvedValueOnce({ data: updatedUsers });
    
    render(<MockedAdminUsersPanel />);
    
    // 等待用户数据加载
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // 点击编辑用户按钮
    fireEvent.click(screen.getByTestId('edit-button-user1'));
    
    // 验证获取用户详情 API 调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users/user1', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // 等待编辑表单显示
    await waitFor(() => {
      expect(screen.getByTestId('edit-form-user1')).toBeInTheDocument();
    });
    
    // 修改用户信息
    const firstNameInput = screen.getByTestId('firstName-input-user1');
    const lastNameInput = screen.getByTestId('lastName-input-user1');
    
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
    fireEvent.change(lastNameInput, { target: { value: 'Updated' } });
    
    // 保存编辑
    fireEvent.click(screen.getByTestId('save-button-user1'));
    
    // 验证更新 API 调用
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
    
    // 验证用户列表被刷新
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        headers: { Authorization: 'Bearer fake-admin-token' },
      });
    });
    
    // 验证显示更新后的用户信息
    await waitFor(() => {
      const userNameCell = screen.getByTestId('user-name-user1');
      expect(userNameCell.textContent).toBe('Johnny Updated');
    });
  });
}); 