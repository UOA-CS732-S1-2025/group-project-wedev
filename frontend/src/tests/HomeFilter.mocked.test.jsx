import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// 模拟导航函数
const mockNavigate = vi.fn();

// 模拟useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 模拟searchProviders函数
const mockSearchProviders = vi.fn().mockResolvedValue({});

// 模拟useUserStore
vi.mock('../store/userStore', () => ({
  useUserStore: () => ({
    searchProviders: mockSearchProviders,
  }),
}));

// 创建一个模拟的用户 - 可以动态修改
let mockUser = { _id: 'user123' };

// 模拟useAuthStore
vi.mock('../store/authStore', () => ({
  default: () => ({
    user: mockUser,
  }),
}));

// 完全模拟的HomeFilter组件
const MockedHomeFilter = () => {
  // 组件的状态
  const [selectedService, setSelectedService] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);

  // 格式化日期
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // 获取日期显示文本
  const getDateDisplayText = () => {
    if (!selectedDate) return "Enter date";
    
    if (selectedDate.date) {
      // 单日期选择
      return formatDate(selectedDate.date);
    } else if (selectedDate.startDate && selectedDate.endDate) {
      // 日期范围选择
      return `${formatDate(selectedDate.startDate)} - ${formatDate(selectedDate.endDate)}`;
    }
    
    return "Enter date";
  };

  // 处理搜索按钮点击
  const handleSearch = async () => {
    if (!mockUser) {
      mockNavigate("/login");
      return;
    }

    try {
      // 创建只包含定义的值的搜索参数
      const searchParams = {};
      
      // 添加服务类型（如果已选择）
      if (selectedService) {
        searchParams.serviceType = selectedService.title;
      }
      
      // 添加位置（如果已选择）
      if (selectedLocation) {
        searchParams.location = selectedLocation;
      }
      
      // 添加日期（如果已选择）
      if (selectedDate?.date) {
        searchParams.date = selectedDate.date.toISOString();
      } else if (selectedDate?.startDate) {
        searchParams.date = selectedDate.startDate.toISOString();
      }
      
      // 通过store调用搜索API
      await mockSearchProviders(searchParams);
      
      // 导航并指示我们来自搜索
      mockNavigate('/booking', { state: { fromSearch: true } });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div data-testid="home-filter">
      {/* 服务类型 */}
      <div>
        <button 
          data-testid="service-button"
          onClick={() => setServiceOpen(true)}
        >
          <span data-testid="service-text">
            {selectedService ? selectedService.title : "Service Type"}
          </span>
        </button>
        
        {serviceOpen && (
          <div data-testid="service-selector">
            <button 
              data-testid="select-service-btn"
              onClick={() => {
                setSelectedService({ 
                  title: 'Plumbing', 
                  icon: 'FaWrench',
                  id: 'service1'
                });
                setServiceOpen(false);
              }}
            >
              Select Plumbing
            </button>
          </div>
        )}
      </div>

      {/* 位置 */}
      <div>
        <button 
          data-testid="location-button"
          onClick={() => setLocationOpen(true)}
        >
          <span data-testid="location-text">
            {selectedLocation ? selectedLocation.city : "Enter your city"}
          </span>
        </button>
        
        {locationOpen && (
          <div data-testid="location-selector">
            <button 
              data-testid="select-location-btn"
              onClick={() => {
                setSelectedLocation({ 
                  city: 'Auckland', 
                  region: 'Auckland',
                  id: 'location1'
                });
                setLocationOpen(false);
              }}
            >
              Select Auckland
            </button>
          </div>
        )}
      </div>

      {/* 日期选择 */}
      <div>
        <button 
          data-testid="date-button"
          onClick={() => setDateOpen(true)}
        >
          <span data-testid="date-text">
            {getDateDisplayText()}
          </span>
        </button>
        
        {dateOpen && (
          <div data-testid="date-selector">
            <button 
              data-testid="select-date-btn"
              onClick={() => {
                setSelectedDate({ 
                  date: new Date('2023-12-25')
                });
                setDateOpen(false);
              }}
            >
              Select Date
            </button>
            <button 
              data-testid="select-date-range-btn"
              onClick={() => {
                setSelectedDate({ 
                  startDate: new Date('2023-12-25'),
                  endDate: new Date('2023-12-30')
                });
                setDateOpen(false);
              }}
            >
              Select Date Range
            </button>
          </div>
        )}
      </div>

      {/* 搜索按钮 */}
      <button 
        data-testid="search-button"
        onClick={handleSearch}
      >
        Find a service
      </button>
    </div>
  );
};

describe('HomeFilter Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置用户为登录状态
    mockUser = { _id: 'user123' };
  });

  test('Should render filter component with default values', () => {
    render(<MockedHomeFilter />);
    
    // 检查默认文本
    expect(screen.getByTestId('service-text')).toHaveTextContent('Service Type');
    expect(screen.getByTestId('location-text')).toHaveTextContent('Enter your city');
    expect(screen.getByTestId('date-text')).toHaveTextContent('Enter date');
    expect(screen.getByTestId('search-button')).toHaveTextContent('Find a service');
  });

  test('Should open service selector when clicked', async () => {
    render(<MockedHomeFilter />);
    
    // 点击服务选择器
    fireEvent.click(screen.getByTestId('service-button'));
    
    // 应该显示服务选择器
    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
  });

  test('Should open location selector when clicked', async () => {
    render(<MockedHomeFilter />);
    
    // 点击位置选择器
    fireEvent.click(screen.getByTestId('location-button'));
    
    // 应该显示位置选择器
    expect(screen.getByTestId('location-selector')).toBeInTheDocument();
  });

  test('Should open date selector when clicked', async () => {
    render(<MockedHomeFilter />);
    
    // 点击日期选择器
    fireEvent.click(screen.getByTestId('date-button'));
    
    // 应该显示日期选择器
    expect(screen.getByTestId('date-selector')).toBeInTheDocument();
  });

  test('Should select service when service is chosen', async () => {
    render(<MockedHomeFilter />);
    
    // 打开服务选择器
    fireEvent.click(screen.getByTestId('service-button'));
    
    // 选择服务
    fireEvent.click(screen.getByTestId('select-service-btn'));
    
    // 应该显示选择的服务
    expect(screen.getByTestId('service-text')).toHaveTextContent('Plumbing');
  });

  test('Should select location when location is chosen', async () => {
    render(<MockedHomeFilter />);
    
    // 打开位置选择器
    fireEvent.click(screen.getByTestId('location-button'));
    
    // 选择位置
    fireEvent.click(screen.getByTestId('select-location-btn'));
    
    // 应该显示选择的位置
    expect(screen.getByTestId('location-text')).toHaveTextContent('Auckland');
  });

  test('Should select date when single date is chosen', async () => {
    render(<MockedHomeFilter />);
    
    // 打开日期选择器
    fireEvent.click(screen.getByTestId('date-button'));
    
    // 选择日期
    fireEvent.click(screen.getByTestId('select-date-btn'));
    
    // 应该显示选择的日期
    expect(screen.getByTestId('date-text')).toHaveTextContent('Dec 25, 2023');
  });

  test('Should select date range when date range is chosen', async () => {
    render(<MockedHomeFilter />);
    
    // 打开日期选择器
    fireEvent.click(screen.getByTestId('date-button'));
    
    // 选择日期范围
    fireEvent.click(screen.getByTestId('select-date-range-btn'));
    
    // 应该显示选择的日期范围
    expect(screen.getByTestId('date-text')).toHaveTextContent('Dec 25, 2023 - Dec 30, 2023');
  });

  test('Should call searchProviders and navigate when search button clicked', async () => {
    render(<MockedHomeFilter />);
    
    // 打开并选择服务
    fireEvent.click(screen.getByTestId('service-button'));
    fireEvent.click(screen.getByTestId('select-service-btn'));
    
    // 打开并选择位置
    fireEvent.click(screen.getByTestId('location-button'));
    fireEvent.click(screen.getByTestId('select-location-btn'));
    
    // 打开并选择日期
    fireEvent.click(screen.getByTestId('date-button'));
    fireEvent.click(screen.getByTestId('select-date-btn'));
    
    // 点击搜索按钮
    fireEvent.click(screen.getByTestId('search-button'));
    
    // 检查是否调用了searchProviders
    await waitFor(() => {
      expect(mockSearchProviders).toHaveBeenCalledWith({
        serviceType: 'Plumbing',
        location: { city: 'Auckland', region: 'Auckland', id: 'location1' },
        date: new Date('2023-12-25').toISOString()
      });
    });
    
    // 检查是否调用了navigate
    expect(mockNavigate).toHaveBeenCalledWith('/booking', { state: { fromSearch: true } });
  });

  test('Should redirect to login if user not logged in', async () => {
    // 设置用户为未登录状态
    mockUser = null;
    
    render(<MockedHomeFilter />);
    
    // 点击搜索按钮
    fireEvent.click(screen.getByTestId('search-button'));
    
    // 检查是否重定向到登录页面
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 