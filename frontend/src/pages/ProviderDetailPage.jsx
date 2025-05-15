import {
  Box,
  Button,
  Container,
  Separator,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
  Input,
  Field,
  NumberInput
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useChatDialogStore } from "../store/chatDialogStore";
import { useConversationStore } from "../store/conversationStore";
import {
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaRegClock,
  FaEnvelope,
  FaPhone,
  FaStarHalfAlt,
  FaRegStar,
  FaCalendarAlt,
  FaClock,
  FaUser,
} from "react-icons/fa";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import AvailabilitySetting from "../components/AvailabilitySetting";
import { toaster } from "@/components/ui/toaster";

export default function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { openDialog } = useChatDialogStore();
  const { fetchConversations: refreshUserConversations } =
    useConversationStore();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("9"); // Default booking time to 9 AM
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  let error = null;

  // Color mode values
  const bgColor = "white";
  const borderColor = "gray.200";
  const highlightColor = "blue.500";
  const cardBgColor = "gray.50";

  useEffect(() => {
    if (id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/users/providers/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProvider(data.provider || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching provider:", err);
          setLoading(false);
          toaster.create({
            title: err.message || "Failed to load provider information",
          });
        });
    }
  }, [id]);

  // Get provider reviews
  useEffect(() => {
    if (id) {
      setReviewsLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/reviews/provider/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReviews(data.data.reviews || []);
            setAverageRating(data.data.averageRating || 0);
            setReviewCount(data.data.count || 0);
          } else {
            console.error("Failed to fetch reviews:", data.message);
          }
          setReviewsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching reviews:", err);
          setReviewsLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Flex>
    );
  }

  if (error || !provider) {
    toaster.create({ title: error || "Provider information not found" });
    return null;
  }

  const handleContactProvider = async () => {
    if (!currentUser || !provider || !provider._id) {
      toaster.create({ title: "User or provider information is missing" });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/find-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId1: currentUser._id,
          userId2: provider._id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create conversation");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create conversation");
      }

      openDialog(data.conversationId, data.otherUser);

      if (data.isNew && currentUser?._id) {
        await refreshUserConversations(currentUser._id);
      }

      navigate("/profile?tab=messages");
    } catch (error) {
      toaster.create({
        title:
          error.message ||
          "An error occurred while trying to contact the provider",
      });
    }
  };

  const handleBooking = async () => {
    // Validate date
    if (!bookingDate) {
      toaster.create({ title: "Please select a booking date" });
      return;
    }

    // Validate time
    if (!bookingTime || bookingTime === "") {
      toaster.create({ title: "Please enter booking time" });
      return;
    }

    // Validate time is between 0-24
    const timeValue = parseInt(bookingTime, 10);
    console.log("[DEBUG] timeValue:", timeValue, "bookingTime:", bookingTime);
    if (isNaN(timeValue) || timeValue < 0 || timeValue > 24) {
      toaster.create({ title: "Booking time must be between 0-24" });
      return;
    }

    if (!currentUser || !provider || !provider._id) {
      toaster.create({
        title: "Please login or provider information is missing",
      });
      return;
    }

    if (!currentUser._id) {
      toaster.create({
        title: "User authentication failed, please login again",
      });
      return;
    }

    // Validate address information
    if (
      !currentUser.address ||
      !currentUser.address.city ||
      !currentUser.address.street
    ) {
      toaster.create({
        title: "Missing address information",
        description:
          "Please update your address in your profile before booking",
      });
      navigate("/profile?tab=profile");
      return;
    }

    // Validate service type
    if (!provider.serviceType) {
      toaster.create({ title: "Provider has not set a service type" });
      return;
    }

    // Validate hourly rate
    if (
      provider.hourlyRate == null ||
      provider.hourlyRate === undefined ||
      isNaN(parseFloat(provider.hourlyRate))
    ) {
      toaster.create({ title: "Provider has not set a valid hourly rate" });
      return;
    }

    try {
      // Prepare booking time information
      const selectedDate = new Date(bookingDate);

      // Use user input time to set start time
      const startTime = new Date(selectedDate);
      startTime.setHours(timeValue, 0, 0);

      // End time is default 2 hours after start time
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

      // Validate that end time is after start time
      if (endTime <= startTime) {
        toaster.create({
          title: "Invalid time range",
          description: "End time must be after start time",
        });
        return;
      }

      console.log("[DEBUG] Booking times:", {
        bookingDate,
        selectedDate,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeValue,
      });

      // Build serviceAddress object, ensure all required fields have values
      const serviceAddress = {
        street: currentUser.address?.street || "Default Street",
        city: currentUser.address?.city || "Default City",
        state:
          currentUser.address?.state ||
          currentUser.address?.city ||
          "Default State",
        postalCode: currentUser.address?.postalCode || "00000",
        country: currentUser.address?.country || "New Zealand",
        additionalDetails: currentUser.address?.additionalDetails || "",
      };

      // Prepare the booking data
      const bookingData = {
        providerId: provider._id,
        serviceType: provider.serviceType,
        serviceAddress,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        hourlyRate: parseFloat(provider.hourlyRate) || 0,
        notes: `Booking created on ${new Date().toLocaleString()}`,
      };

      console.log("Creating booking with data:", bookingData);

      // 1. Create booking record
      const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log(
        "[DEBUG] Booking response status:",
        bookingResponse.status,
        bookingResponse.ok
      );

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error("Booking creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create booking");
      }

      const bookingResult = await bookingResponse.json();
      console.log("[DEBUG] Booking data:", bookingResult);

      if (!bookingResult.success) {
        console.error(
          "Booking creation returned failure status:",
          bookingResult
        );
        throw new Error(bookingResult.message || "Failed to create booking");
      }

      // Verify that we have a proper booking ID
      if (!bookingResult.booking || !bookingResult.booking._id) {
        console.error("Missing booking ID in response:", bookingResult);
        throw new Error("Server did not return a valid booking ID");
      }

      console.log("Booking created successfully:", bookingResult);

      // Added: Create payment record
      try {
        const paymentData = {
          provider: provider._id,
          booking: bookingResult.booking._id,
          amount: parseFloat(provider.hourlyRate) || 0,
          method: "credit_card" // Default payment method
        };
        
        console.log("Creating payment record with data:", paymentData);
        
        const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(paymentData),
        });
        
        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          console.error("Payment record creation failed:", errorData);
          // Continue with the process, don't interrupt
          console.warn("Continuing without payment record");
        } else {
          const paymentResult = await paymentResponse.json();
          console.log("Payment record created successfully:", paymentResult);
        }
      } catch (error) {
        console.error("Error creating payment record:", error);
        // Continue with the process, don't interrupt
        console.warn("Continuing without payment record");
      }

      // 2. Create conversation
      const conversationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conversations/find-or-create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId1: currentUser._id,
            userId2: provider._id,
          }),
        }
      );

      console.log(
        "[DEBUG] Conversation response status:",
        conversationResponse.status,
        conversationResponse.ok
      );

      if (!conversationResponse.ok) {
        const errData = await conversationResponse.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create conversation");
      }
      const conversationData = await conversationResponse.json();
      console.log("[DEBUG] Conversation data:", conversationData);

      if (!conversationData.success) {
        throw new Error(
          conversationData.message || "Failed to create conversation"
        );
      }

      // 3. Prepare booking message content
      const formattedDate = new Date(bookingDate).toLocaleDateString();
      const formattedTime = `${timeValue}:00`;

      // Add customer address information to booking message
      const customerAddress = currentUser.address
        ? `${currentUser.address.street || ""}, ${currentUser.address.suburb || ""}, ${currentUser.address.city || ""}, ${currentUser.address.state || ""}, ${currentUser.address.postalCode || ""}, ${currentUser.address.country || ""}`
        : "No address provided";

      const bookingMessage =
        `Booking Confirmation:\n` +
        `Booking ID: ${bookingResult.booking._id}\n` +
        `Customer: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})\n` +
        `Service Provider: ${provider.firstName} ${provider.lastName}\n` +
        `Service Type: ${formatServiceType(provider.serviceType)}\n` +
        `Booking Date: ${formattedDate}\n` +
        `Booking Time: ${formattedTime}\n` +
        `Customer Address: ${customerAddress}\n` +
        `Rate: $${provider.hourlyRate || "Not specified"}/hour`;

      // 4. Send booking message
      const messageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          senderId: currentUser._id,
          recipientId: provider._id,
          content: bookingMessage,
          messageType: "booking",
          bookingStatus: "pending",
          senderDisplayText: `You have sent a booking request to ${provider.firstName} ${provider.lastName}, waiting for confirmation.`,
          receiverDisplayText: `${currentUser.firstName} ${currentUser.lastName} has sent you a booking request, please review.`,
        }),
      });

      console.log(
        "[DEBUG] Message response status:",
        messageResponse.status,
        messageResponse.ok
      );

      if (!messageResponse.ok) {
        const errData = await messageResponse.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to send booking message");
      }

      // 5. Open dialog
      if (conversationData.conversationId && conversationData.otherUser) {
        openDialog(conversationData.conversationId, conversationData.otherUser);
      } else {
        console.error("Missing conversation data:", conversationData);
      }

      // 6. Refresh conversation list
      if (conversationData.isNew && currentUser?._id) {
        await refreshUserConversations(currentUser._id);
      }

      // 7. Show success message
      toaster.create({
        title: "Booking Created Successfully",
        description:
          "Your booking has been created and a message has been sent to the service provider. Please complete the payment.",
      });

      // Clear form fields after successful booking
      setBookingTime("");

      // 8. Navigate to payment page instead of orders page
      navigate(`/payment/${bookingResult.booking._id}`);
    } catch (error) {
      console.error("Error during booking process:", error);
      toaster.create({
        title: error.message || "Error occurred during booking",
      });
    }
  };

  // Helper function to get time slots for a date
  const getTimeSlotsForDate = (date) => {
    if (!date) return [];

    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split("T")[0];

    // 1. Check special date settings
    const specialDates = provider.specialDates || [];
    const specialDate = specialDates.find((sd) => {
      const sdDate = sd.date ? new Date(sd.date) : null;
      return sdDate && sdDate.toISOString().split("T")[0] === dateString;
    });

    if (specialDate) {
      if (specialDate.isAvailable === false) return []; // Marked as unavailable
      if (specialDate.startTime && specialDate.endTime) {
        return [{ start: specialDate.startTime, end: specialDate.endTime }];
      }
    }

    // 2. Check date range settings
    const dateRanges = provider.dateRanges || [];
    for (const range of dateRanges) {
      if (!range.startDate || !range.endDate) continue;

      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      const currentDate = new Date(date);

      // Reset time part for date comparison only
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      currentDate.setHours(12, 0, 0, 0);

      if (currentDate >= startDate && currentDate <= endDate) {
        if (range.isAvailable === false) return []; // Marked as unavailable
        if (range.startTime && range.endTime) {
          return [{ start: range.startTime, end: range.endTime }];
        }
      }
    }

    // 3. Check weekly availability settings
    const availability = provider.availability || [];
    const weeklyAvailability = availability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );
    if (weeklyAvailability) {
      if (weeklyAvailability.isAvailable === false) return []; // Marked as unavailable
      if (weeklyAvailability.startTime && weeklyAvailability.endTime) {
        return [
          {
            start: weeklyAvailability.startTime,
            end: weeklyAvailability.endTime,
          },
        ];
      }
    }

    // 4. If none of the above matched or no settings, use default time slot
    // Default working hours 9:00 - 17:00
    return [{ start: "09:00", end: "17:00" }];
  };

  // Format service type display
  const formatServiceType = (type) => {
    if (!type) return "Service Provider";
    return (
      type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  const formatAvailability = () => {
    if (!provider.availability || provider.availability.length === 0) {
      return "No availability information";
    }

    const daysMap = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return provider.availability
      .filter((slot) => slot.isAvailable)
      .map((slot) => {
        return `${daysMap[slot.dayOfWeek]}: ${slot.startTime} - ${slot.endTime}`;
      })
      .join("\n");
  };

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (roundedRating >= i) {
        stars.push(<Icon as={FaStar} key={i} color="yellow.400" />);
      } else if (roundedRating + 0.5 === i) {
        stars.push(<Icon as={FaStarHalfAlt} key={i} color="yellow.400" />);
      } else {
        stars.push(<Icon as={FaRegStar} key={i} color="gray.300" />);
      }
    }

    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 8 }}>
      {/* Main content */}
      <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={8}>
        {/* Left main content area */}
        <GridItem>
          <Box
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            boxShadow="md"
            mb={8}
          >
            {/* Profile and basic info area */}
            <Flex
              direction={{ base: "column", md: "row" }}
              align="start"
              p={6}
              gap={6}
            >
              <Box flexShrink={0} position="relative">
                <Image
                  borderRadius="full"
                  boxSize={{ base: "120px", md: "160px" }}
                  src={
                    provider.profilePictureUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt={`${provider.firstName} ${provider.lastName}`}
                  border="4px solid white"
                  boxShadow="lg"
                  objectFit="cover"
                />
              </Box>

              <VStack align="start" spacing={1} pt={{ base: 0, md: 2 }}>
                <Heading size="xl">
                  {provider.firstName} {provider.lastName}
                </Heading>

                <Badge colorScheme="blue" fontSize="md" px={2} py={1} mt={1}>
                  {formatServiceType(provider.serviceType)}
                </Badge>

                <HStack mt={2} align="center">
                  {renderStarRating(averageRating)}
                  <Text fontWeight="bold" ml={2}>
                    {averageRating.toFixed(1) || "New"}
                  </Text>
                  <Text color="gray.500">
                    ({reviewCount || 0} reviews)
                  </Text>
                </HStack>

                {provider.address && provider.address.city && (
                  <HStack mt={1}>
                    <Icon as={FaMapMarkerAlt} color="gray.500" />
                    <Text>
                      {provider.address.city}, {provider.address.country}
                    </Text>
                  </HStack>
                )}

                <Text color="gray.500" mt={2}>
                  Member since:{" "}
                  {new Date(provider.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </Text>
              </VStack>
            </Flex>

            <Separator />

            {/* Provider details area */}
            <Box p={6}>
              {/* About section */}
              <Box mb={10}>
                <Heading size="md" mb={4}>
                  About {provider.firstName}
                </Heading>
                <Text mb={6}>
                  {provider.bio ||
                    `${provider.firstName} hasn't added a bio yet.`}
                </Text>

                <Heading size="md" mb={4}>
                  Address
                </Heading>
                <Box bg={cardBgColor} mb={6} p={4} borderRadius="md">
                  <HStack>
                    <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={5} />
                    <Text>
                      {provider.address?.street || ""},{" "}
                      {provider.address?.suburb || ""},
                      {provider.address?.city || ""},{" "}
                      {provider.address?.state || ""},
                      {provider.address?.postalCode || ""},{" "}
                      {provider.address?.country || "No address provided"}
                    </Text>
                  </HStack>
                </Box>

                {/* Availability Calendar or Setting */}
                <Heading size="md" mb={4}>
                  Availability
                </Heading>
                {currentUser?._id === provider._id ? (
                  <AvailabilitySetting
                    providerId={provider._id}
                    providerData={provider}
                  />
                ) : (
                  <AvailabilityCalendar
                    providerId={provider._id}
                    currentUser={currentUser}
                    providerData={provider}
                    selectedDate={bookingDate}
                    setSelectedDate={setBookingDate}
                  />
                )}

                <Heading size="md" mt={8} mb={4}>
                  Contact Information
                </Heading>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                  mb={6}
                >
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <HStack>
                      <Icon as={FaEnvelope} color="blue.500" boxSize={5} />
                      <Text>{provider.email || "No email provided"}</Text>
                    </HStack>
                  </Box>
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <HStack>
                      <Icon as={FaPhone} color="blue.500" boxSize={5} />
                      <Text>{provider.phoneNumber || "No phone provided"}</Text>
                    </HStack>
                  </Box>
                </Grid>
              </Box>

              <Separator my={6} />


              <Separator my={6} />

              {/* Reviews section */}
              <Box mb={6}>
                <Heading size="md" mb={4}>
                  Reviews
                </Heading>
                {/* New combined display for average rating and review count */}
                <Box
                  p={4}
                  bg={cardBgColor}
                  borderRadius="md"
                  boxShadow="sm"
                  mb={4}
                >
                  <HStack
                    spacing={{ base: 4, md: 8 }} // Responsive spacing
                    align="center"
                    justify="space-around" // Distribute space evenly
                  >
                    {/* Part 1: Average Rating */}
                    <VStack spacing={1} align="center" flex="1">
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Average Rating
                      </Text>
                      <HStack justify="center">
                        {renderStarRating(averageRating)}
                      </HStack>
                      <Heading size="lg" color={highlightColor}>
                        {averageRating.toFixed(1) || "-"}
                      </Heading>
                    </VStack>

                    <Separator orientation="vertical" h={{ base: "40px", md: "60px" }} borderColor={borderColor} />

                    {/* Part 2: Number of Reviews */}
                    <VStack spacing={1} align="center" flex="1">
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Total Reviews
                      </Text>
                      <Heading size="lg" color={highlightColor}>
                        {reviewCount || 0}
                      </Heading>
                    </VStack>
                  </HStack>
                </Box>

                {reviewsLoading ? (
                  <Flex justify="center" py={6}>
                    <Spinner size="md" />
                  </Flex>
                ) : reviews.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {reviews.map((review) => (
                      <Box 
                        key={review._id} 
                        bg={cardBgColor} 
                        p={4} 
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Flex mb={2} justify="space-between" align="center">
                          <HStack>
                            <Avatar.Root size="sm">
                              <Avatar.Fallback name={review.customerName} />
                            </Avatar.Root>
                            <Text fontWeight="bold">{review.customerName || "Anonymous User"}</Text>
                          </HStack>
                          <HStack>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Icon 
                                key={i} 
                                as={i < review.rating ? FaStar : FaRegStar} 
                                color={i < review.rating ? "yellow.400" : "gray.300"} 
                              />
                            ))}
                          </HStack>
                        </Flex>
                        
                        <HStack color="gray.600" fontSize="sm" mb={2} spacing={4}>
                          <HStack>
                            <Icon as={FaCalendarAlt} />
                            <Text>{formatDate(review.createdAt)}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FaUser} />
                            <Text>{formatServiceType(review.serviceType) || "Service"}</Text>
                          </HStack>
                        </HStack>
                        
                        <Text mt={2}>{review.comment || "No comment provided"}</Text>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <Text color="gray.500">This provider has not received any reviews yet</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </GridItem>

        {/* Right sidebar */}
        <GridItem>
          {/* Booking and contact card */}
          <Box
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            boxShadow="md"
            position="sticky"
            top="20px"
            minH="600px"
          >
            <Box p={6}>
              <Heading size="md" mb={4}>
                Book Service
              </Heading>

              {provider.hourlyRate && (
                <HStack mb={4}>
                  <Heading size="lg" color={highlightColor}>
                    ${provider.hourlyRate}
                  </Heading>
                  <Text color="gray.600">/hour</Text>
                </HStack>
              )}

              <Box mb={6}>
                <Field.Root mb={4}>
                  <Field.Label>
                    Booking Date{" "}
                    <Box as="span" color="red.500">
                      *
                    </Box>
                  </Field.Label>
                  <Input
                    type="text"
                    value={
                      bookingDate
                        ? new Date(bookingDate).toLocaleDateString()
                        : ""
                    }
                    readOnly
                    placeholder="Please select a date from the calendar"
                  />
                  {!bookingDate && (
                    <Field.ErrorText>
                      Date selection is required
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root mb={4}>
                  <Field.Label>
                    Booking Time (hour, 0-24){" "}
                    <Box as="span" color="red.500">
                      *
                    </Box>
                  </Field.Label>

                  <NumberInput.Root onChange={(e) => {
                      setBookingTime(e.target.value);
                    }} max={24} min={0} w={"100%"}>
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                  {bookingTime &&
                    (parseInt(bookingTime, 10) < 0 ||
                      parseInt(bookingTime, 10) > 24 ||
                      isNaN(parseInt(bookingTime, 10))) && (
                      <Field.ErrorText>
                        Please enter an integer between 0-24
                      </Field.ErrorText>
                    )}
                </Field.Root>

                <Button
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  onClick={handleBooking}
                  leftIcon={<FaRegCalendarAlt />}
                >
                  Confirm Booking
                </Button>
              </Box>

              <Separator my={4} />

              <Button
                variant="outline"
                colorScheme="blue"
                width="100%"
                onClick={handleContactProvider}
                isDisabled={
                  !currentUser ||
                  !provider?._id ||
                  currentUser?._id === provider?._id
                }
                leftIcon={<FaEnvelope />}
              >
                Contact {provider.firstName}
              </Button>

              {currentUser?._id === provider?._id && (
                <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
                  You cannot start a conversation with yourself.
                </Text>
              )}

              {/* Moderate Cancellation Policy */}
              <Box mt={8} p={4} bg="yellow.50" borderRadius="lg" boxShadow="sm">
                <Heading size="sm" mb={2}>
                  Moderate Cancellation Policy
                </Heading>
                <Text fontSize="sm" color="gray.700">
                  You will receive a full refund if you cancel before 12:00 pm,
                  7 days prior to your scheduled booking.
                  <br />
                  <br />
                </Text>
              </Box>

              {/* Payment Methods */}
              <Box
                mt={6}
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                textAlign="center"
              >
                <Text fontWeight="medium" mb={2}>
                  We accept
                </Text>
                <Image
                  src="https://t4.ftcdn.net/jpg/05/44/11/61/240_F_544116186_wMwylR2U7NpAx90eZJlAyLkbnravVpCW.jpg"
                  alt="Payment Methods"
                  borderRadius="md"
                  mx="auto"
                  maxH="48px"
                  objectFit="contain"
                  bg="white"
                  p={1}
                />
              </Box>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
