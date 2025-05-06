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
  Center,
  Flex
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import ProviderCard from "../components/ProviderCard";
import AdvancedFilter from "../components/AdvancedFilter";
import { useLocation } from "react-router-dom";

const BookingPage = () => {
  const { users: searchResults, loading, error, fetchProviders, lastSearchParams } = useUserStore();
  const location = useLocation();

  return (
    <Flex direction={{ base: 'column', md: 'row' }} maxW="container.xl" mx="auto" py={6} gap={6}>
      
      <Box w={{ base: 'full', md: '300px' }} flexShrink={0}> 
        <AdvancedFilter />
      </Box>

      <Box flex="1"> 
        {loading && (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text ml={4}>Loading service providers...</Text>
          </Center>
        )}

        {error && (
          <VStack spacing={4} >
            <Alert status="error" borderRadius="md">
              <Text fontSize="lg">Error fetching service providers: {error.message}</Text>
            </Alert>
          </VStack>
        )}

        {!loading && !error && (
          <> 
            {searchResults.length === 0 ? (
              <Box textAlign="center" py={10} borderWidth="1px" borderRadius="lg" shadow="base">
                <VStack spacing={4}>
                  <Heading size="md">No service providers found</Heading>
                  <Text>Try adjusting your search criteria using the filters on the left.</Text>
                </VStack>
              </Box>
            ) : (
              <VStack spacing={4} >
                <Heading size="lg" mb={2}>
                  {searchResults.length} Service {searchResults.length === 1 ? 'Provider' : 'Providers'} Found
                </Heading>
                {searchResults.map((user) => (
                  <ProviderCard
                    key={user._id}
                    user={user}
                  />
                ))}
              </VStack>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
};

export default BookingPage;