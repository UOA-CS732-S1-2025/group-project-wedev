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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from '../store/authStore';
import { useChatDialogStore } from '../store/chatDialogStore';
import { useConversationStore } from '../store/conversationStore';
import { FaRegCalendarAlt, FaMapMarkerAlt, FaStar, FaRegClock, FaEnvelope, FaPhone, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import AvailabilitySetting from '../components/AvailabilitySetting';
import { toaster } from "@/components/ui/toaster";

export default function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { openDialog } = useChatDialogStore();
  const { fetchConversations: refreshUserConversations } = useConversationStore();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  let error = null;
  
  // Color mode values
  const bgColor = 'white';
  const borderColor = 'gray.200';
  const highlightColor = 'blue.500';
  const cardBgColor = 'gray.50';

  useEffect(() => {
    if (id) {
      fetch(`/api/users/providers/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProvider(data.provider || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching provider:', err);
          setLoading(false);
          toaster.create({ title: err.message || 'Failed to load provider information' });
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
    toaster.create({ title: error || 'Provider information not found' });
    return null;
  }

  const handleContactProvider = async () => {
    if (!currentUser || !provider || !provider._id) {
      toaster.create({ title: "User or provider information is missing" });
      return;
    }

    try {
      const response = await fetch('/api/conversations/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId1: currentUser._id, userId2: provider._id }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create conversation');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create conversation');
      }

      openDialog(data.conversationId, data.otherUser);

      if (data.isNew && currentUser?._id) {
        await refreshUserConversations(currentUser._id);
      }
      
      navigate('/profile?tab=messages');

    } catch (error) {
      toaster.create({ title: error.message || "An error occurred while trying to contact the provider" });
    }
  };

  const handleBooking = async () => {
    if (!bookingDate) {
      toaster.create({ title: 'Please select a date first' });
      return;
    }

    if (!currentUser || !provider || !provider._id) {
      toaster.create({ title: 'Please log in first or provider information is missing' });
      return;
    }

    try {
      // 1. Find or create conversation
      const conversationResponse = await fetch('/api/conversations/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId1: currentUser._id, userId2: provider._id }),
      });

      if (!conversationResponse.ok) {
        const errData = await conversationResponse.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create conversation');
      }
      const conversationData = await conversationResponse.json();
      if (!conversationData.success) {
        throw new Error(conversationData.message || 'Failed to create conversation');
      }
      
      // 2. Prepare booking message content
      const formattedDate = new Date(bookingDate).toLocaleDateString();
      const formattedTime = getTimeSlotsForDate(new Date(bookingDate))
        .map(slot => `${slot.start} - ${slot.end}`)
        .join(', ');
      
      const bookingMessage = `Booking Confirmation:\n` +
        `Customer: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})\n` +
        `Provider: ${provider.firstName} ${provider.lastName}\n` +
        `Service Type: ${formatServiceType(provider.serviceType)}\n` +
        `Booking Date: ${formattedDate}\n` +
        (formattedTime ? `Booking Time: ${formattedTime}\n` : '') +
        `Rate: $${provider.hourlyRate || 'Not specified'}/hour`;

      // 3. Send booking message
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          senderId: currentUser._id,
          recipientId: provider._id,
          content: bookingMessage,
          messageType: 'booking',
          bookingStatus: 'pending',
          senderDisplayText: `You have sent a booking request to ${provider.firstName} ${provider.lastName}, waiting for confirmation.`,
          receiverDisplayText: `${currentUser.firstName} ${currentUser.lastName} has sent you a booking request, please review it.`
        })
      });
      if (!messageResponse.ok) {
        const errData = await messageResponse.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to send booking message');
      }
      // 4. Open the conversation
      openDialog(conversationData.conversationId, conversationData.otherUser);

      // 5. Refresh conversation list if needed
      if (conversationData.isNew && currentUser?._id) {
        await refreshUserConversations(currentUser._id);
      }
      
      // 6. Navigate to inbox
      navigate('/profile?tab=messages');

    } catch (error) {
      toaster.create({ title: error.message || "An error occurred during booking" });
    }
  };

  // Helper function to get time slots for a date
  const getTimeSlotsForDate = (date) => {
    if (!date) return [];
    
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // Check special dates
    const specialDates = provider.specialDates || [];
    const specialDate = specialDates.find(sd => 
      new Date(sd.date).toISOString().split('T')[0] === dateString
    );
    
    if (specialDate) {
      if (!specialDate.isAvailable) return [];
      if (specialDate.startTime && specialDate.endTime) {
        return [{ start: specialDate.startTime, end: specialDate.endTime }];
      }
    }
    
    // Check date ranges
    const dateRanges = provider.dateRanges || [];
    for (const range of dateRanges) {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      if (date >= startDate && date <= endDate) {
        if (!range.isAvailable) return [];
        if (range.startTime && range.endTime) {
          return [{ start: range.startTime, end: range.endTime }];
        }
      }
    }
    
    // Check weekly availability
    const availability = provider.availability || [];
    const weeklyAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    if (weeklyAvailability && weeklyAvailability.isAvailable) {
      return [{ 
        start: weeklyAvailability.startTime, 
        end: weeklyAvailability.endTime 
      }];
    }
    
    return [];
  };

  // Format service type display
  const formatServiceType = (type) => {
    if (!type) return 'Service Provider';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const formatAvailability = () => {
    if (!provider.availability || provider.availability.length === 0) {
      return 'No availability information';
    }

    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return provider.availability
      .filter(slot => slot.isAvailable)
      .map(slot => {
        return `${daysMap[slot.dayOfWeek]}: ${slot.startTime} - ${slot.endTime}`;
      })
      .join('\n');
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

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 8 }}>
      {/* Main content */}
      <Grid
        templateColumns={{ base: "1fr", lg: "3fr 1fr" }}
        gap={8}
      >
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
                  src={provider.profilePictureUrl || "https://via.placeholder.com/150"}
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
                  {renderStarRating(provider.averageRating)}
                  <Text fontWeight="bold" ml={2}>{provider.averageRating?.toFixed(1) || 'New'}</Text>
                  <Text color="gray.500">({provider.reviewCount || 0} reviews)</Text>
                </HStack>
                
                {provider.address && provider.address.city && (
                  <HStack mt={1}>
                    <Icon as={FaMapMarkerAlt} color="gray.500" />
                    <Text>{provider.address.city}, {provider.address.country}</Text>
                  </HStack>
                )}
                
                <Text color="gray.500" mt={2}>
                  Member since: {new Date(provider.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}
                </Text>
              </VStack>
            </Flex>

            <Separator />

            {/* Provider details area */}
            <Box p={6}>
              {/* About section */}
              <Box mb={10}>
                <Heading size="md" mb={4}>About {provider.firstName}</Heading>
                <Text mb={6}>
                  {provider.bio || `${provider.firstName} hasn't added a bio yet.`}
                </Text>

                <Heading size="md" mb={4}>Address</Heading>
                <Box bg={cardBgColor} mb={6} p={4} borderRadius="md">
                  <HStack>
                    <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={5} />
                    <Text>
                      {provider.address?.street || ''}, {provider.address?.suburb || ''},
                      {provider.address?.city || ''}, {provider.address?.state || ''}, 
                      {provider.address?.postalCode || ''}, {provider.address?.country || 'No address provided'}
                    </Text>
                  </HStack>
                </Box>

                {/* Availability Calendar or Setting */}
                <Heading size="md" mb={4}>Availability</Heading>
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
                
                <Heading size="md" mt={8} mb={4}>Contact Information</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={6}>
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <HStack>
                      <Icon as={FaEnvelope} color="blue.500" boxSize={5} />
                      <Text>{provider.email || 'No email provided'}</Text>
                    </HStack>
                  </Box>
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <HStack>
                      <Icon as={FaPhone} color="blue.500" boxSize={5} />
                      <Text>{provider.phoneNumber || 'No phone provided'}</Text>
                    </HStack>
                  </Box>
                </Grid>
              </Box>

              <Separator my={6} />

              {/* Portfolio section */}
              <Box mb={10}>
                <Heading size="md" mb={4}>Portfolio</Heading>
                {provider.portfolioMedia && provider.portfolioMedia.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                    {provider.portfolioMedia.map((media, idx) => (
                      <Box key={idx} borderRadius="md" overflow="hidden" boxShadow="md">
                        <Image 
                          src={media.url} 
                          alt={media.caption || `Portfolio ${idx + 1}`}
                          width="100%"
                          height="200px"
                          objectFit="cover"
                        />
                        {media.caption && (
                          <Box p={2} bg={cardBgColor}>
                            <Text fontSize="sm">{media.caption}</Text>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box bg={cardBgColor} p={4} borderRadius="md">
                    <Text color="gray.500">No portfolio available.</Text>
                  </Box>
                )}
              </Box>

              <Separator my={6} />

              {/* Reviews section */}
              <Box mb={6}>
                <Heading size="md" mb={4}>Reviews</Heading>
                <HStack mb={4}>
                  <Box 
                    p={4} 
                    bg={cardBgColor} 
                    borderRadius="md" 
                    boxShadow="sm" 
                    textAlign="center"
                    flex="1"
                  >
                    <HStack justify="center" mb={2}>
                      {renderStarRating(provider.averageRating)}
                    </HStack>
                    <Heading size="xl" color="blue.500">{provider.averageRating?.toFixed(1) || '-'}</Heading>
                    <Text>Average Rating</Text>
                  </Box>
                  <Box 
                    p={4} 
                    bg={cardBgColor} 
                    borderRadius="md" 
                    boxShadow="sm" 
                    textAlign="center"
                    flex="1"
                  >
                    <Heading size="xl" color="blue.500">{provider.reviewCount || 0}</Heading>
                    <Text>Number of Reviews</Text>
                  </Box>
                </HStack>
                
                <Box bg={cardBgColor} p={4} borderRadius="md">
                  <Text color="gray.500">{provider.reviewCount ? 'Loading reviews...' : 'No reviews yet'}</Text>
                </Box>
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
                <Input
                  type="text"
                  value={bookingDate ? new Date(bookingDate).toLocaleDateString() : ''}
                  readOnly
                  mb={4}
                  placeholder="Please select a date from the calendar"
                />
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
                isDisabled={!currentUser || !provider?._id || currentUser?._id === provider?._id}
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
                <Heading size="sm" mb={2}>Moderate Cancellation Policy</Heading>
                <Text fontSize="sm" color="gray.700">
                You will receive a full refund if you cancel before 12:00 pm, 7 days prior to your scheduled booking.<br/>
                  <br/>
                </Text>
              </Box>

              {/* Payment Methods */}
              <Box mt={6} p={4} borderRadius="lg" boxShadow="sm" textAlign="center">
                <Text fontWeight="medium" mb={2}>We accept</Text>
                <Image src="https://t4.ftcdn.net/jpg/05/44/11/61/240_F_544116186_wMwylR2U7NpAx90eZJlAyLkbnravVpCW.jpg" alt="Payment Methods" borderRadius="md" mx="auto" maxH="48px" objectFit="contain" bg="white" p={1} />
              </Box>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
