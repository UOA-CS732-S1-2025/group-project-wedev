import React from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Heading,
  Flex,
  AvatarGroup,
  Avatar,
} from '@chakra-ui/react';
import useAuthStore from '../store/authStore';

const UserProfile = () => {
  const { user } = useAuthStore();
  
  // Get display name
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";

  return (
    <Box bg="gray.50" minH="100vh" py={8} px={4}>
      <Box 
        w={{ base: "95%", md: "85%", lg: "90%" }} 
        minH="500px"
        mx="auto" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        overflow="hidden"
        p={6}
      >
        <VStack spacing={6} align="start">
          <HStack spacing={6}>
            <AvatarGroup>
              <Avatar.Root>
                <Avatar.Fallback>{displayName.charAt(0)}</Avatar.Fallback>
                <Avatar.Image src={user?.profilePictureUrl || "https://bit.ly/sage-adebayo"} />
              </Avatar.Root>
            </AvatarGroup>
            
            <VStack align="start" spacing={2}>
              <Heading size="lg">{displayName}</Heading>
              <Text color="gray.600">{user?.email}</Text>
              <Text 
                bg="green.100" 
                color="green.700" 
                px={2} 
                py={1} 
                borderRadius="md"
                fontSize="sm"
              >
                {user?.role === 'provider' ? 'Service Provider' : (user?.role === 'customer' ? 'Customer': 'Admin') }
              </Text>
            </VStack>
          </HStack>
          
          <Box w="full" h="1px" bg="gray.200" />
          
          <Box w="full">
            <Heading size="md" mb={4}>Personal Information</Heading>
            <Flex wrap="wrap" gap={6}>
              <VStack align="start" minW="200px">
                <Text color="gray.500" fontSize="sm">Phone Number</Text>
                <Text>{user?.phoneNumber || "Not provided"}</Text>
              </VStack>
              
              <VStack align="start" minW="200px">
                <Text color="gray.500" fontSize="sm">Address</Text>
                <Text>
                  {user?.address?.city && user?.address?.country
                    ? `${user.address.city}, ${user.address.country}`
                    : "Not provided"}
                </Text>
              </VStack>
              
              {user?.role === 'provider' && (
                <>
                  <VStack align="start" minW="200px">
                    <Text color="gray.500" fontSize="sm">Service Type</Text>
                    <Text>{user?.serviceType || "Not specified"}</Text>
                  </VStack>
                  
                  <VStack align="start" minW="200px">
                    <Text color="gray.500" fontSize="sm">Hourly Rate</Text>
                    <Text>{user?.hourlyRate ? `$${user.hourlyRate.toFixed(2)}` : "Not specified"}</Text>
                  </VStack>
                </>
              )}
            </Flex>
          </Box>
          
          {user?.role === 'provider' && (
            <>
              <Box w="full" h="1px" bg="gray.200" />
              <Box w="full">
                <Heading size="md" mb={4}>Provider Information</Heading>
                <VStack align="start" spacing={4}>
                  <VStack align="start">
                    <Text color="gray.500" fontSize="sm">Bio</Text>
                    <Text>{user?.bio || "No bio provided"}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text color="gray.500" fontSize="sm">Rating</Text>
                    <Text>{user?.averageRating ? `${user.averageRating.toFixed(1)}/5.0 (${user.reviewCount} reviews)` : "No ratings yet"}</Text>
                  </VStack>
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default UserProfile;