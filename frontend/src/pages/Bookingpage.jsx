import React, { useEffect } from "react";
import { Box, VStack, Heading, Spinner, Alert, Center, Flex, Text } from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import ProviderCard from "../components/ProviderCard";
import AdvancedFilter from "../components/AdvancedFilter";
import { useLocation } from "react-router-dom";

const BookingPage = () => {
  const {
    users: searchResults,
    loading,
    error,
    fetchProviders,
    lastSearchParams,
    selectedProviderId,
  } = useUserStore();
  const location = useLocation();

  // Clear selected provider when the component is unmounted
  useEffect(() => {
    return () => {
      // Reset the selectedProviderId when the component is unmounted
      useUserStore.getState().setSelectedProviderId(null);
    };
  }, []);

  // 禁用浏览器最外层滚动，只保留右侧结果区滚动
  useEffect(() => {
    // 保存原始 overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <Box px={4} maxW="container.xl" mx="auto">
      <Flex direction={{ base: 'column', md: 'row' }} py={6} gap={{ base: 4, md: 6 }} align="flex-start" height={{ base: 'auto', md: '100vh' }}>
        {/* Left Column - Filters */}
        <Box w={{ base: 'full', md: '500px', lg: '580px' }} flexShrink={0} position="sticky" top="20px">
          <AdvancedFilter />
        </Box>

        {/* Right Column - Results */}
        <Box flex="1" maxH={{ base: 'auto', md: 'calc(100vh - 40px)' }} height="100%" overflow="hidden" display="flex" flexDirection="column">
          {/* Loading State */}
          {loading && (
            <Center py={4} mb={4} flexShrink={0}>
              <Spinner size="md" color="blue.500" thickness="3px" mr={3} />
              <Text>Loading service providers...</Text>
            </Center>
          )}

          {/* Error State */}
          {error && (
            <Alert status="error" borderRadius="md" mb={4} flexShrink={0}>
              <Text fontSize="sm">Error fetching service providers: {error.message}</Text>
            </Alert>
          )}

          {/* Search Results */}
          {!loading && !error && (
            <Box
              overflowY="auto"
              flex="1"
              pr={2}
              id="results-container"
              height="100%"
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
                  <>
                    {searchResults.map((user) => (
                      <ProviderCard key={user._id} user={user} />
                    ))}
                    {/* Extra space at the bottom */}
                    <Box height="40px" />
                  </>
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
