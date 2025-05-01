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
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import ProviderCard from "../components/ProviderCard";
const BookingPage = () => {
  const { users, fetchProviders } = useUserStore();
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <Container maxW="container.sm" py={6}>
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
