import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Separator,
  Center
} from '@chakra-ui/react';
import {
  FaUserEdit,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaClipboardList,
  FaLightbulb,
  FaComments,
  FaStar
} from 'react-icons/fa';

const OnboardingStepCard = ({ number, title, description, icon }) => {
  return (
    <Flex
      direction="column"
      p={{ base: 5, md: 8 }}
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      gap={5}
      alignItems="center"
      textAlign="center"
      h="100%"
      borderWidth="1px"
      borderColor="gray.100"
      transition="transform 0.3s ease-out, box-shadow 0.3s ease-out"
      _hover={{
        transform: 'scale(1.03)',
        boxShadow: 'xl',
      }}
    >
      <Flex
        as="span"
        w={16}
        h={16}
        borderRadius="full"
        bg="blue.500"
        color="white"
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Heading size="md" color="gray.700">{`Step ${number}: ${title}`}</Heading>
      <Text color="gray.600" fontSize="sm" px={2}>{description}</Text>
    </Flex>
  );
};

const ActionCard = ({ icon, title, description }) => {
  return (
    <VStack
      p={{ base: 5, md: 6 }}
      bg="gray.50"
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="start"
      textAlign="left"
      h="100%"
      borderWidth="1px"
      borderColor="gray.200"
      transition="transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
      }}
    >
      <Icon as={icon} w={10} h={10} color="blue.600" />
      <Heading size="sm" color="gray.700" mt={2}>{title}</Heading>
      <Text color="gray.500" fontSize="xs" flexGrow={1}>{description}</Text>
    </VStack>
  );
};

const UserDashboard = () => {
  return (
    <Box 
      py={4} 
      position="relative"
      zIndex={1} 
    >
      <Box 
        w="100%" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        overflow="hidden"
        minH="1250px" 
        maxH={{ base: "auto", md: "calc(100vh - 200px)" }} 
        p={{base: 5, md: 8}}
      >
        <VStack spacing={{base: 8, md: 12}} align="stretch">
          <Box textAlign="center" py={6} bg="blue.50" borderRadius="xl">
            <Heading as="h1" size="xl" color="blue.700" mb={3}>
              Everything you need to manage your services and profile, all in one place.
            </Heading>

          </Box>

          <VStack spacing={5} align="stretch">
            <Heading size="lg" color="gray.700" mb={2} textAlign={{base: "center", md: "left"}}>
              Getting Started
            </Heading>
            <Text color="gray.500" mb={6} textAlign={{base: "center", md: "left"}}>
              Follow these steps to make the most of our platform:
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 1, md: 3 }} spacing={{ base: 6, md: 8 }} gap={6}>
              <OnboardingStepCard
                number="1"
                icon={FaUserEdit}
                title="Complete Your Profile"
                description="Keep your contact details (email, phone) and address information accurate for smooth communication and service delivery."
              />
              <OnboardingStepCard
                number="2"
                icon={FaMapMarkedAlt}
                title="Set Up Service Preferences"
                description="Specify your primary service locations or any preferences that help us tailor services to your needs better."
              />
              <OnboardingStepCard
                number="3"
                icon={FaCalendarCheck}
                title="Book Your First Service"
                description="Explore a wide range of professional services and make your first booking with confidence and ease."
              />
            </SimpleGrid>
          </VStack>
          
          <Separator my={8} borderColor="gray.300" />

          <VStack spacing={5} align="stretch">
            <Heading size="lg" color="gray.700" mb={2} textAlign={{base: "center", md: "left"}}>
              Quick Access
            </Heading>
             <Text color="gray.500" mb={6} textAlign={{base: "center", md: "left"}}>
              Jump directly to important sections or find helpful information.
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 5, md: 6 }} gap={6}>
              <ActionCard
                icon={FaClipboardList}
                title="My Bookings"
                description="View and manage your past and upcoming service appointments."
              />
              <ActionCard
                icon={FaStar}
                title="Featured Services"
                description="Discover popular or newly added services that might interest you."
              />
              <ActionCard
                icon={FaComments}
                title="Messages"
                description="Check your inbox for communications with service providers."
              />
              <ActionCard
                icon={FaLightbulb}
                title="Help & FAQ"
                description="Find answers to common questions and learn more about using our platform."
              />
            </SimpleGrid>
          </VStack>

          <Separator my={8} borderColor="gray.300" />

          <Box p={8} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
            <Flex direction={{base: "column", md: "row"}} alignItems="center" gap={6}>
                <Icon as={FaLightbulb} w={16} h={16} color="yellow.400" />
                <Box>
                    <Heading size="md" color="gray.700" mb={3}>Pro Tip!</Heading>
                    <Text color="gray.600" fontSize="sm">
                        Keep your profile information and service addresses up-to-date to ensure a seamless experience. Regularly check your messages for updates from service providers. Consider enabling notifications so you don't miss important updates about your bookings.
                    </Text>
                </Box>
            </Flex>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default UserDashboard;
