import React, { useEffect, useState, useRef } from "react";
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
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Menu,
  IconButton,
  Spacer,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaTools,
  FaDollarSign,
  FaExclamationCircle,
  FaCalendarCheck,
  FaHistory,
  FaListAlt,
  FaSync,
} from "react-icons/fa";
import useAuthStore from "../store/authStore";
import { format, isPast, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import ReviewDialog from "./ReviewDialog";

// Utility function: format time
const formatTime = (dateTime) => {
  if (!dateTime) return "N/A";
  try {
    return format(new Date(dateTime), "yyyy-MM-dd HH:mm");
  } catch (e) {
    return dateTime.toString();
  }
};

// Get badge color and text based on status
const getStatusBadgeProps = (status) => {
  const statusMap = {
    pending_confirmation: {
      colorScheme: "yellow",
      text: "Pending Confirmation",
    },
    confirmed: { colorScheme: "green", text: "Confirmed" },
    cancelled_by_customer: {
      colorScheme: "red",
      text: "Cancelled by Customer",
    },
    cancelled_by_provider: {
      colorScheme: "red",
      text: "Cancelled by Provider",
    },
    completed: { colorScheme: "blue", text: "Completed" },
    rescheduled_pending: { colorScheme: "purple", text: "Reschedule Pending" },
    disputed: { colorScheme: "red", text: "Disputed" },
    reviewed: { colorScheme: "purple", text: "Reviewed" },
  };
  return statusMap[status] || { colorScheme: "gray", text: status };
};

// Get payment badge color and text based on paymentStatus
const getPaymentStatusBadgeProps = (paymentStatus) => {
  const paymentStatusMap = {
    pending: { colorScheme: "orange", text: "Payment Pending" },
    succeeded: { colorScheme: "green", text: "Paid" },
    failed: { colorScheme: "red", text: "Payment Failed" },
    refunded: { colorScheme: "blue", text: "Refunded" },
    partially_refunded: { colorScheme: "purple", text: "Partially Refunded" },
    not_applicable: { colorScheme: "gray", text: "N/A" },
  };
  return (
    paymentStatusMap[paymentStatus] || {
      colorScheme: "gray",
      text: paymentStatus || "N/A",
    }
  );
};

// Booking card component
const BookingCard = ({
  booking,
  isCustomer,
  onStatusChange,
  onPaymentSuccess,
}) => {
  const otherParty = isCustomer ? booking.provider : booking.customer;
  const statusProps = getStatusBadgeProps(booking.status);
  const paymentStatusProps = getPaymentStatusBadgeProps(
    booking.paymentDetails?.paymentStatus
  );
  const isPastBooking = isPast(new Date(booking.endTime));
  const isTodayBooking = isToday(new Date(booking.startTime));
  const [isConfirming, setIsConfirming] = useState(false);
  const reviewDialogRef = useRef();
  const navigate = useNavigate();

  // Handle payment
  const handlePayment = () => {
    // 将当前URL保存到会话存储中，以便支付完成后可以返回
    sessionStorage.setItem('returnToOrders', true);
    // Navigate to PaymentPage with the booking id
    navigate(`/payment/${booking._id}`);
  };

  // Actions available to customer (based on booking status)
  const customerActions = () => {
    // Payment button for customer when payment is pending
    if (isCustomer && booking.paymentDetails?.paymentStatus === "pending") {
      return (
        <Button
          size="sm"
          colorScheme="green"
          onClick={handlePayment}
        >
          Pay Now
        </Button>
      );
    }

    if (
      booking.status === "pending_confirmation" ||
      booking.status === "confirmed"
    ) {
      return (
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => onStatusChange(booking._id, "cancelled_by_customer")}
        >
          Cancel Booking
        </Button>
      );
    } else if (booking.status === "completed") {
      return (
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="sm" colorScheme="purple">
              Review Service
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Review Service</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <ReviewDialog
                    ref={reviewDialogRef}
                    bookingId={booking._id}
                    providerId={booking.provider._id}
                    onSuccess={() => {
                      onStatusChange(booking._id, "reviewed");
                    }}
                  />
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" mr={3}>
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>

                  <Button
                    isLoading={reviewDialogRef.current?.loading}
                    onClick={async (e) => {
                      e.preventDefault();
                      const ok = await reviewDialogRef.current?.submit();
                      if (!ok) e.stopPropagation();
                    }}
                  >
                    Submit
                  </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      );
    }
    return null;
  };

  // Actions available to service provider (based on booking status)
  const providerActions = () => {
    switch (booking.status) {
      case "pending_confirmation":
        // 检查支付状态是否为succeeded（已支付）
        const isPaymentSucceeded = booking.paymentDetails?.paymentStatus === "succeeded";
        
        return (
          <HStack spacing={3}>
            {isPaymentSucceeded ? (
              <Button
                size="sm"
                colorScheme="green"
                isLoading={isConfirming}
                loadingText="Confirming"
                onClick={async () => {
                  setIsConfirming(true);
                  await onStatusChange(booking._id, "confirmed");

                  try {
                    const res = await fetch("/api/payments", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({
                        customer: booking.customer._id,
                        provider: booking.provider._id,
                        booking: booking._id,
                        amount: booking.hourlyRate,
                        method: "credit_card",
                        status: "pending",
                      }),
                    });

                    if (!res.ok) throw new Error("Failed to create payment");
                  } catch (err) {
                  } finally {
                    setIsConfirming(false);
                  }
                }}
              >
                Confirm
              </Button>
            ) : (
              <Text fontSize="sm" color="orange.500" fontWeight="medium">
                Waiting for customer payment
              </Text>
            )}
            <Button
              size="sm"
              colorScheme="red"
              onClick={() =>
                onStatusChange(booking._id, "cancelled_by_provider")
              }
            >
              Decline
            </Button>
          </HStack>
        );
      case "confirmed":
        return (
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => onStatusChange(booking._id, "completed")}
            >
              Mark as Finished
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() =>
                onStatusChange(booking._id, "cancelled_by_provider")
              }
            >
              Cancel Booking
            </Button>
          </HStack>
        );
      default:
        return null;
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
      
        {/* Status badge - top right */}
        <Badge colorPalette={statusProps.colorScheme}
        variant={"subtle"}
        position="absolute"
        top={2}
        right={2}
        >{statusProps.text}</Badge>


      
      {/* Today marker */}
      {isTodayBooking && (
        <Badge
          colorPalette="blue"
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
        {/* Service type */}
        <Heading size="md">
          <Icon as={FaTools} mr={2} color="blue.500" />
          {booking.serviceType}
        </Heading>

        {/* User/provider information */}
        <HStack spacing={3}>
          <Avatar.Root>
            <Avatar.Image src={otherParty?.profilePictureUrl || null} />
          </Avatar.Root>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">
              {isCustomer ? "Service Provider" : "Customer"}
            </Text>
            <Text fontSize="sm">{otherParty?.username || "Unknown User"}</Text>
          </VStack>
        </HStack>

        <Separator />

        {/* Booking time */}
        <HStack spacing={3}>
          <Icon as={FaCalendarAlt} color="gray.500" />
          <Text fontSize="sm">{formatTime(booking.startTime)}</Text>
        </HStack>

        {/* Address information */}
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

        {/* Cost information */}
        <HStack spacing={3}>
          <Icon as={FaDollarSign} color="gray.500" />
          <Text fontSize="sm">${booking.hourlyRate}/hr</Text>
                  {/* Payment Status badge - top right, to the left of status badge */}
        {booking.paymentDetails?.paymentStatus && (
          <Badge colorPalette={paymentStatusProps.colorScheme} variant={"subtle"}>
            {paymentStatusProps.text}
          </Badge>
        )}
        </HStack>

        {/* Notes */}
        {booking.notes && (
          <Box mt={2} p={3} bg="gray.50" w="100%" borderRadius="md">
            <Text fontSize="sm" fontStyle="italic">
              Notes: {booking.notes}
            </Text>
          </Box>
        )}

        {/* Action buttons area */}
        <Flex w="100%" justify="flex-end" mt={3}>
          {isCustomer ? customerActions() : providerActions()}
        </Flex>
      </VStack>
    </Box>
  );
};

// Main component
const BookingsView = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'upcoming', 'past'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Determine user role (simplified - in a real app this would come from auth store)
  const userRole = user?.role || "customer"; // Default to customer if role not specified

  // 获取预订数据的函数
  const fetchBookings = async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get booking data based on user role
      const endpoint =
        user.role === "provider"
          ? "/api/bookings/provider-bookings"
          : "/api/bookings/my-bookings";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch bookings");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message || "Could not load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, [user]);

  // 刷新预订列表
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBookings();
      toaster.create({
        title: "Refreshed",
        description: "Booking list has been refreshed",
      });
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      toaster.create({
        title: "Refresh Failed",
        description: "Could not refresh booking list. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startTime);
    if (activeTab === "upcoming") {
      return !isPast(bookingDate);
    } else if (activeTab === "past") {
      return isPast(bookingDate);
    }
    return true; // 'all' tab
  });

  // Sort bookings by start time from earliest to latest
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime);
  });

  // Filter bookings based on user role
  const asCustomerBookings = sortedBookings.filter(
    (booking) => booking.customer._id === user?._id
  );
  const asProviderBookings = sortedBookings.filter(
    (booking) => booking.provider._id === user?._id
  );

  // Handle status change function
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Call API to update booking status
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update booking status");
      }

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      toaster.create({
        title: "Status Updated",
        description: `Booking is now ${getStatusBadgeProps(newStatus).text}`,
      });
    } catch (error) {
      toaster.create({
        title: "Update Failed",
        description:
          error.message || "Could not update booking status. Please try again.",
      });
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (bookingId, paymentDetails) => {
    setBookings(
      bookings.map((b) =>
        b._id === bookingId
          ? {
              ...b,
              paymentDetails: {
                ...b.paymentDetails,
                ...paymentDetails,
              },
            }
          : b
      )
    );
  };

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
        <Alert.Description>
          Please login to view your bookings.
        </Alert.Description>
        <Button ml={4} onClick={() => navigate("/login")}>
          Login
        </Button>
      </Alert>
    );
  }

  // No bookings found message
  const noBookingsMessage = (role) => (
    <Box p={5} textAlign="center">
      <Heading size="md" mb={4}>
        No Bookings Found
      </Heading>
      <Text mb={4}>You don't have any bookings yet.</Text>
      {role === "customer" && (
        <Button  onClick={() => navigate("/booking")}>
          Book a Service
        </Button>
      )}
    </Box>
  );

  return (
    <Box p={4}>

      {/* Filter controls using Menu */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} gap={3}>
        <Menu.Root closeOnSelect={true} >
          <Menu.Trigger asChild>
            <Button 
              variant="outline" 
              size="md" 
              rightIcon={<Icon as={FaCalendarAlt} />}
              px={4}
              w="200px"
            >
              {activeTab === "all" && "All Bookings"}
              {activeTab === "upcoming" && "Upcoming Bookings"}
              {activeTab === "past" && "Past Bookings"}
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="200px">
                <Menu.Item 
                  value="all" 
                  onClick={() => setActiveTab("all")}
                >
                  <Flex align="center">
                    <Icon as={FaListAlt} color="gray.500" mr={2} />
                    All Bookings
                  </Flex>
                </Menu.Item>
                <Menu.Item 
                  value="upcoming" 
                  onClick={() => setActiveTab("upcoming")}
                >
                  <Flex align="center">
                    <Icon as={FaCalendarCheck} color="green.500" mr={2} />
                    Upcoming Bookings
                  </Flex>
                </Menu.Item>
                <Menu.Item 
                  value="past" 
                  onClick={() => setActiveTab("past")}
                >
                  <Flex align="center">
                    <Icon as={FaHistory} color="purple.500" mr={2} />
                    Past Bookings
                  </Flex>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        <IconButton
          aria-label="Refresh bookings"
          onClick={handleRefresh}
          colorPalette="white"
          variant="outline"
          size="md"
          title="Refresh booking list"
          isDisabled={isRefreshing}
        >
        <FaSync />
        </IconButton>
        <Spacer />

      </Flex>

      {/* Display bookings based on user role */}
      {userRole === "customer" ? (
        // Customer view
        <Box mb={10}>

          {asCustomerBookings.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {asCustomerBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  isCustomer={true}
                  onStatusChange={handleStatusChange}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              ))}
            </SimpleGrid>
          ) : (
            noBookingsMessage("customer")
          )}
        </Box>
      ) : (
        // Provider view
        <Box mb={10}>

          {asProviderBookings.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {asProviderBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  isCustomer={false}
                  onStatusChange={handleStatusChange}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              ))}
            </SimpleGrid>
          ) : (
            noBookingsMessage("provider")
          )}
        </Box>
      )}
    </Box>
  );
};

export default BookingsView;
