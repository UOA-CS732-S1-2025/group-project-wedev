import React, { useEffect } from "react";
import {
  Text,
  Box,
  VStack,
  Heading,
  Spinner,
  Alert,
  Center,
  Flex
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import ProviderCard from "../components/ProviderCard";
import AdvancedFilter from "../components/AdvancedFilter";
<<<<<<< HEAD
import { useLocation } from "react-router-dom";

const BookingPage = () => {
  const { 
    users: searchResults, 
    loading, 
    error, 
    fetchProviders, 
    lastSearchParams,
    selectedProviderId 
  } = useUserStore();
  const location = useLocation();

  // 在用户进入页面时清除任何选中的Provider
  useEffect(() => {
    return () => {
      // 组件卸载时清除选中状态
      useUserStore.getState().setSelectedProviderId(null);
    };
  }, []);

=======
import { useLocation, useNavigate  } from "react-router-dom";

const BookingPage = () => {
  const { users: searchResults, loading, error, fetchProviders, lastSearchParams } = useUserStore();
  const location = useLocation();

>>>>>>> origin/develop
  return (
    <Box px={4} maxW="container.xl" mx="auto">
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        py={6} 
        gap={{ base: 4, md: 6 }}
        align="flex-start"
        height={{ base: 'auto', md: '100vh' }}
      >
        {/* Left Column - Filters and Map */}
        <Box 
          w={{ base: 'full', md: '500px', lg: '580px' }} 
          flexShrink={0}
          position="sticky"
          top="20px"
        > 
          <AdvancedFilter />
        </Box>

        {/* Right Column - Results with scroll */}
        <Box 
          flex="1" 
          maxH={{ base: 'auto', md: 'calc(100vh - 40px)' }}
<<<<<<< HEAD
          height="100%"
=======
>>>>>>> origin/develop
          overflow="hidden"
          display="flex"
          flexDirection="column"
        > 
          {/* Loading Indicator */}
          {loading && (
            <Center py={4} mb={4} flexShrink={0}>
              <Spinner size="md" color="blue.500" thickness="3px" mr={3} />
              <Text>Loading service providers...</Text>
            </Center>
          )}

          {/* Error Message */}
          {error && (
            <Alert status="error" borderRadius="md" mb={4} flexShrink={0}>
              <Text fontSize="sm">Error fetching service providers: {error.message}</Text>
            </Alert>
          )}

          {/* Results Content - Scrollable */}
          {!loading && !error && (
            <Box 
              overflowY="auto" 
              flex="1"
              pr={2}
<<<<<<< HEAD
              id="results-container"
              height="100%"
=======
>>>>>>> origin/develop
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '8px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '24px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '24px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <VStack spacing={4} align="stretch" pb={4}>
                {searchResults.length === 0 ? (
                  <Box textAlign="center" py={10} borderWidth="1px" borderRadius="lg" shadow="base">
                    <VStack spacing={3}>
                      <Heading size="md">No service providers found</Heading>
                      <Text>Try adjusting your search criteria using the filters on the left.</Text>
                    </VStack>
                  </Box>
                ) : (
<<<<<<< HEAD
                  <>
                    {searchResults.map((user) => (
                      <ProviderCard
                        key={user._id}
                        user={user}
                      />
                    ))}
                    {/* 额外的底部空间 */}
                    <Box height="40px" />
                  </>
=======
                  searchResults.map((user) => (
                    <ProviderCard
                      key={user._id}
                      user={user}
                    />
                  ))
>>>>>>> origin/develop
                )}
              </VStack>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default BookingPage;