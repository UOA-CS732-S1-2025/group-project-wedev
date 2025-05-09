import {
  Box,
  Heading,
  Text,
  Image,
  Stack,
  VStack,
  HStack,
  Textarea,
  Button,
  Input,
  Spinner,
  Alert,
  SimpleGrid
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

export default function ProviderDetailPage() {
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [bookingDate, setBookingDate] = useState('');

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
        });
    }
  }, [id]);

  if (loading) return <Spinner size="xl" label="Loading..." m={10} />;
  if (!provider) {
    return (
      <Alert status="error" m={10}>
        Provider information not found.
      </Alert>
    );
  }

  return (
    <Box maxW="900px" mx="auto" p={6}>
      <HStack spacing={6} align="start" mb={6}>
        <Image
          borderRadius="full"
          boxSize="150px"
          src={provider.profilePictureUrl}
          alt="Profile"
        />
        <VStack align="start" spacing={1}>
          <Heading size="lg">
            {provider.firstName} {provider.lastName}
          </Heading>
          <Text fontSize="md" color="gray.600">Role: {provider.role}</Text>
          <Text fontSize="sm">📧 {provider.email}</Text>
          <Text fontSize="sm">📱 {provider.phoneNumber}</Text>
        </VStack>
      </HStack>

      <Box borderBottom="1px" borderColor="gray.200" my={4} />

      <Box mb={6}>
        <Heading size="md" mb={2}>Address</Heading>
        <Text>
          {provider.address.street}, {provider.address.suburb},<br />
          {provider.address.city}, {provider.address.state}, {provider.address.postalCode}, {provider.address.country}
        </Text>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={2}>Ratings & Reviews</Heading>
        <Text>⭐ Average Rating: {provider.averageRating} / 5</Text>
        <Text>📝 Number of Reviews: {provider.reviewCount}</Text>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={2}>Portfolio</Heading>
        {provider.portfolioMedia.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {provider.portfolioMedia.map((media, idx) => (
              <Image key={idx} src={media.url} alt={`Portfolio ${idx + 1}`} borderRadius="md" />
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500">No portfolio available.</Text>
        )}
      </Box>

      <Box borderBottom="1px" borderColor="gray.200" my={6} />

      <Box mb={6}>
        <Heading size="md" mb={2}>Send a Message</Heading>
        <Textarea
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          mb={2}
        />
        <Button colorScheme="blue" onClick={() => {
          alert(`Message sent: ${message}`);
          setMessage('');
        }}>
          Send
        </Button>
      </Box>

      <Box>
        <Heading size="md" mb={2}>Book Now</Heading>
        <HStack spacing={4}>
          <Input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
          <Button colorScheme="green" onClick={() => {
            alert(`Booking date: ${bookingDate}`);
            setBookingDate('');
          }}>
            Confirm Booking
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
