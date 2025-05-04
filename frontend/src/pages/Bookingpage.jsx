import React, { useEffect } from "react";
import {
  Container,
  SimpleGrid,
  Text,
  Button,
  Box,
  HStack,
  VStack,
  Card,
  CardBody,
  Heading,
  Spinner,
  Alert,
  Center
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import ProviderCard from "../components/ProviderCard";
import { useLocation } from "react-router-dom";

const BookingPage = () => {
  const { users, loading, error, fetchProviders } = useUserStore();
  const location = useLocation();

  // Determine if we came from a search or direct navigation
  const isFromSearch = location.state?.fromSearch;

  useEffect(() => {
    // If navigating directly to page, fetch all providers
    if (!isFromSearch && users.length === 0) {
      fetchProviders();
    }
  }, [fetchProviders, isFromSearch, users.length]);

  if (loading) {
    return (
      <Container maxW="container.sm" py={6} centerContent>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4}>Loading service providers...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.sm" py={6}>
        <Alert status="error" borderRadius="md">
          <Text fontSize="lg">Error fetching service providers: {error.message}</Text>
        </Alert>
        <Button mt={4} onClick={fetchProviders} colorScheme="blue">
          Retry
        </Button>
      </Container>
    );
  }

  if (users.length === 0) {
    return (
      <Container maxW="container.sm" py={6}>

        <Card.Root>
          <Card.Header />
          <CardBody textAlign="center">
            <Heading size="md" mb={4}>No service providers found</Heading>
            <Text>Try adjusting your search criteria or check back later.</Text>
          </CardBody>
          <Card.Footer />
        </Card.Root>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={6}>
      <Heading size="md" mb={4}>
        {users.length} Service {users.length === 1 ? 'Provider' : 'Providers'} Available
      </Heading>
      <VStack spacing={3} align="stretch">
        {users.map((user) => (
          <ProviderCard
            key={user._id}
            user={user}
          />
        ))}
      </VStack>
    </Container>
  );
};

export default BookingPage;