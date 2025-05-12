import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Grid,
  VStack,
  HStack,
  Flex,
  Button,
  Separator,
  Icon,
  Tabs,
  Avatar,
  Spinner,
  Alert,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaTools,
  FaDollarSign,
  FaExclamationCircle,
} from "react-icons/fa";
import useAuthStore from "../store/authStore";
import { format, isPast, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";

// 工具函数：格式化时间
const formatTime = (dateTime) => {
  if (!dateTime) return "N/A";
  try {
    return format(new Date(dateTime), "yyyy-MM-dd HH:mm");
  } catch (e) {
    return dateTime.toString();
  }
};

// 获取状态对应的徽章颜色和文本
const getStatusBadgeProps = (status) => {
  const statusMap = {
    pending_confirmation: { colorScheme: "yellow", text: "Pending Confirmation" },
    confirmed: { colorScheme: "green", text: "Confirmed" },
    cancelled_by_customer: { colorScheme: "red", text: "Cancelled by Customer" },
    cancelled_by_provider: { colorScheme: "red", text: "Cancelled by Provider" },
    completed: { colorScheme: "blue", text: "Completed" },
    payment_pending: { colorScheme: "orange", text: "Payment Pending" },
    paid: { colorScheme: "green", text: "Paid" },
    rescheduled_pending: { colorScheme: "purple", text: "Reschedule Pending" },
    disputed: { colorScheme: "red", text: "Disputed" },
  };
  return statusMap[status] || { colorScheme: "gray", text: status };
};

// 预订卡片组件
const BookingCard = ({ booking, isCustomer, onStatusChange }) => {
  const otherParty = isCustomer ? booking.provider : booking.customer;
  const statusProps = getStatusBadgeProps(booking.status);
  const isPastBooking = isPast(new Date(booking.endTime));
  const isTodayBooking = isToday(new Date(booking.startTime));

  // 客户可执行的操作 (根据预订状态)
  const customerActions = () => {
    if (
      booking.status === "pending_confirmation" ||
      booking.status === "confirmed"
    ) {
      return (
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => handleStatusChange("cancelled_by_customer")}
        >
          Cancel Booking
        </Button>
      );
    }
    return null;
  };

  // 服务提供者可执行的操作 (根据预订状态)
  const providerActions = () => {
    switch (booking.status) {
      case "pending_confirmation":
        return (
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => handleStatusChange("confirmed")}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleStatusChange("cancelled_by_provider")}
            >
              Decline
            </Button>
          </HStack>
        );
      case "confirmed":
        if (isPastBooking) {
          return (
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleStatusChange("completed")}
            >
              Mark Completed
            </Button>
          );
        } else {
          return (
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleStatusChange("cancelled_by_provider")}
            >
              Cancel Booking
            </Button>
          );
        }
      default:
        return null;
    }
  };

  // 处理状态变更的函数
  const handleStatusChange = async (newStatus) => {
    try {
      // 这里应该调用API更新预订状态
      // 模拟API调用，真实环境中替换为实际API请求
      console.log(`Updating booking ${booking._id} status to ${newStatus}`);

      // 成功后通知父组件更新状态
      onStatusChange(booking._id, newStatus);

      toaster.create({
        title: "Status Updated",
        description: `Booking is now ${getStatusBadgeProps(newStatus).text}`,
      });
    } catch (error) {
      toaster.create({
        title: "Update Failed",
        description: error.message || "Could not update booking status. Please try again.",
      });
    }
  };

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      position="relative"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      
    >
      {/* 状态徽章 - 右上角 */}
      <Badge
        colorScheme={statusProps.colorScheme}
        position="absolute"
        top={2}
        right={2}
        fontSize="0.8em"
        px={2}
        py={1}
        borderRadius="full"
      >
        {statusProps.text}
      </Badge>

      {/* 今日标记 */}
      {isTodayBooking && (
        <Badge
          colorScheme="blue"
          position="absolute"
          top={2}
          left={2}
          fontSize="0.8em"
          px={2}
          py={1}
          borderRadius="full"
        >
          Today
        </Badge>
      )}

      <VStack align="start" spacing={4} pt={7}>
        {/* 服务类型 */}
        <Heading size="md">
          <Icon as={FaTools} mr={2} color="blue.500" />
          {booking.serviceType}
        </Heading>

        {/* 用户/服务商信息 */}
        <HStack spacing={3}>
          <Avatar.Root>
            <Avatar.Image src={otherParty?.profilePictureUrl || null} />
          </Avatar.Root>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">{isCustomer ? "Service Provider" : "Customer"}</Text>
            <Text fontSize="sm">{otherParty?.username || "Unknown User"}</Text>
          </VStack>
        </HStack>

        <Separator />

        {/* 预订时间 */}
        <HStack spacing={3}>
          <Icon as={FaCalendarAlt} color="gray.500" />
          <Text fontSize="sm">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </Text>
        </HStack>

        {/* 地址信息 */}
        {booking.serviceAddress && (
          <HStack spacing={3}>
            <Icon as={FaMapMarkerAlt} color="gray.500" />
            <Text fontSize="sm">
              {[
                booking.serviceAddress.street,
                booking.serviceAddress.city,
                booking.serviceAddress.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </HStack>
        )}

        {/* 费用信息 */}
        <HStack spacing={3}>
          <Icon as={FaDollarSign} color="gray.500" />
          <Text fontSize="sm">
            ${booking.hourlyRate}/hr (
            {booking.estimatedTotalCost &&
              `Est. Total: $${booking.estimatedTotalCost}`}
            )
          </Text>
        </HStack>

        {/* 备注信息 */}
        {booking.notes && (
          <Box mt={2} p={3} bg="gray.50" w="100%" borderRadius="md">
            <Text fontSize="sm" fontStyle="italic">
              Notes: {booking.notes}
            </Text>
          </Box>
        )}

        {/* 操作按钮区域 */}
        <Flex w="100%" justify="flex-end" mt={3}>
          {isCustomer ? customerActions() : providerActions()}
        </Flex>
      </VStack>
    </Box>
  );
};

// 主组件
const BookingsView = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'upcoming', 'past'
  const navigate = useNavigate();

  // 获取预订记录
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 模拟API请求，实际应用中替换为真实的API调用
        // 如: const response = await api.get('/bookings/my-bookings');
        // const providerResponse = await api.get('/bookings/provider-bookings');

        // 模拟数据
        const mockBookings = [
          {
            _id: "1",
            customer: {
              _id: user._id,
              username: "测试客户",
              profilePictureUrl: "",
            },
            provider: {
              _id: "681b52440af860bb5c6aee1f",
              username: "Provider19 Auckland19",
              profilePictureUrl: "",
            },
            serviceType: "Plumbing",
            startTime: new Date(new Date().setDate(new Date().getDate() - 7)),
            endTime: new Date(
              new Date().setDate(new Date().getDate() - 7) + 2 * 60 * 60 * 1000
            ),
            status: "paid",
            hourlyRate: 65,
            estimatedTotalCost: 130,
            serviceAddress: {
              street: "7 New Windsor Road",
              city: "Auckland",
              state: "Auckland",
              postalCode: "0600",
              country: "New Zealand",
            },
            notes: "水龙头修理工作",
          },
          {
            _id: "2",
            customer: {
              _id: "681b55fd0af860bb5c6aee37",
              username: "admin one",
              profilePictureUrl: "",
            },
            provider: {
              _id: user._id,
              username: "测试服务商",
              profilePictureUrl: "",
            },
            serviceType: "Gardening",
            startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
            endTime: new Date(
              new Date().setDate(new Date().getDate() + 1) + 3 * 60 * 60 * 1000
            ),
            status: "confirmed",
            hourlyRate: 50,
            estimatedTotalCost: 150,
            serviceAddress: {
              street: "45 Garden Street",
              city: "Auckland",
              state: "Auckland",
              postalCode: "0615",
              country: "New Zealand",
            },
            notes: "花园修剪和除草服务",
          },
          {
            _id: "3",
            customer: {
              _id: user._id,
              username: "测试客户",
              profilePictureUrl: "",
            },
            provider: {
              _id: "681b52440af860bb5c6aee1f",
              username: "Provider19 Auckland19",
              profilePictureUrl: "",
            },
            serviceType: "Cleaning",
            startTime: new Date(new Date().setDate(new Date().getDate() + 3)),
            endTime: new Date(
              new Date().setDate(new Date().getDate() + 3) + 4 * 60 * 60 * 1000
            ),
            status: "pending_confirmation",
            hourlyRate: 45,
            estimatedTotalCost: 180,
            serviceAddress: {
              street: "12 Clean Avenue",
              city: "Auckland",
              state: "Auckland",
              postalCode: "0620",
              country: "New Zealand",
            },
            notes: "全屋清洁",
          },
        ];

        setBookings(mockBookings);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("获取预订记录失败，请重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // 处理状态变更
  const handleStatusChange = (bookingId, newStatus) => {
    // 在实际应用中，这里应该调用API更新状态
    // 现在我们只是更新本地状态
    setBookings(
      bookings.map((booking) =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  // 根据tab过滤预订
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startTime);
    if (activeTab === "upcoming") {
      return !isPast(bookingDate);
    } else if (activeTab === "past") {
      return isPast(bookingDate);
    }
    return true; // 'all' tab
  });

  // 根据用户角色分类预订
  const asCustomerBookings = filteredBookings.filter(
    (booking) => booking.customer._id === user?._id
  );
  const asProviderBookings = filteredBookings.filter(
    (booking) => booking.provider._id === user?._id
  );

  if (isLoading) {
    return (
      <Box textAlign="center" my={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading bookings...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" my={5}>
        <Alert.Icon />
        <Alert.Title mr={2}>Loading Failed</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert status="warning" borderRadius="md" my={5}>
        <Icon as={FaExclamationCircle} mr={2} />
        <Alert.Title mr={2}>Login Required</Alert.Title>
        <Alert.Description>Please login to view your bookings.</Alert.Description>
        <Button ml={4} onClick={() => navigate("/login")}>
          Login
        </Button>
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box p={5} textAlign="center">
        <Heading size="md" mb={4}>
          No Bookings Found
        </Heading>
        <Text mb={4}>You don't have any bookings yet.</Text>
        <Button colorScheme="blue" onClick={() => navigate("/booking")}>
          Book a Service
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>
        My Bookings
      </Heading>

      {/* Tab 控制 */}
      <Tabs.Root defaultValue="all" mb={6}>
        <Tabs.List>
          <Tabs.Trigger value="all" onClick={() => setActiveTab("all")}>
            All
          </Tabs.Trigger>
          <Tabs.Trigger
            value="upcoming"
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </Tabs.Trigger>
          <Tabs.Trigger value="past" onClick={() => setActiveTab("past")}>
            Past
          </Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.Root>

      {/* 作为客户的预订 */}
      {asCustomerBookings.length > 0 && (
        <Box mb={10}>
          <Heading size="md" mb={5}>
            Services I Booked
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {asCustomerBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                isCustomer={true}
                onStatusChange={handleStatusChange}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* 作为服务提供者的预订 */}
      {asProviderBookings.length > 0 && (
        <Box>
          <Heading size="md" mb={5}>
            Bookings I Received
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {asProviderBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                isCustomer={false}
                onStatusChange={handleStatusChange}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default BookingsView;
