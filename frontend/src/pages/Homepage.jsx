import React from 'react';
import {
  Flex,
  Center,
  Box,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Container,
  Icon,
  Button,
  VStack,
  HStack,
  Badge,
  Avatar
} from "@chakra-ui/react";
import HomeFilter from '../components/HomeFilter';
import { FaTools, FaBroom, FaLeaf, FaWrench, FaPaintRoller, FaStar } from 'react-icons/fa';

const Homepage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgImage="url('https://urbaneaseproject.s3.us-east-1.amazonaws.com/ubbb.svg')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        h="750px"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.6)"
        >
          <Center h="100%">
            <VStack spacing={6} textAlign="center">
              <Heading size="2xl" color="white">Home Services Made Simple</Heading>
              <Text fontSize="xl" color="white" maxW="700px" px={4}>
                Find reliable professionals for all your home maintenance needs in just a few clicks
              </Text>
              <HomeFilter />
            </VStack>
          </Center>
        </Box>
      </Box>



      {/* Services Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Box textAlign="center" mb={8}>
              <Heading mb={4}>Our Services</Heading>
              <Text fontSize="lg" color="gray.600" maxW="700px" mx="auto">
                Whatever your home needs, we've got you covered with our extensive range of professional services.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="40px">
              <ServiceCard
                icon={FaWrench}
                title="Plumbing"
                description="From leaky faucets to complete pipe replacements, our licensed plumbers solve all your water problems."
              />
              <ServiceCard
                icon={FaLeaf}
                title="Garden & Lawn Care"
                description="Keep your outdoor space beautiful with our expert gardening, landscaping, and lawn maintenance services."
              />
              <ServiceCard
                icon={FaTools}
                title="Home Repairs"
                description="Quick and efficient repair services for all areas of your home by skilled handymen."
              />
              <ServiceCard
                icon={FaBroom}
                title="House Cleaning"
                description="Professional deep cleaning services that leave your home spotless and fresh."
              />
              <ServiceCard
                icon={FaPaintRoller}
                title="Painting"
                description="Transform your space with our expert painting services for interior and exterior walls."
              />
              <ServiceCard
                icon={FaWrench}
                title="Appliance Repair"
                description="Fast, reliable repairs for all major household appliances by certified technicians."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading textAlign="center">How It Works</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="40px">
              <StepCard
                number="1"
                title="Choose Your Service"
                description="Browse our extensive selection of home services and select what you need."
              />
              <StepCard
                number="2"
                title="Book a Professional"
                description="Select a time that works for you and book a verified professional."
              />
              <StepCard
                number="3"
                title="Get the Job Done"
                description="Relax while our experts take care of your home service needs efficiently."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading textAlign="center">What Our Customers Say</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="40px">
              <TestimonialCard
                name="Sarah Johnson"
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                text="The plumber was professional and fixed our leak in no time. Great service!"
                rating={5}
              />
              <TestimonialCard
                name="Mark Thompson"
                image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                text="I've been using their gardening services for months. My yard has never looked better!"
                rating={5}
              />
              <TestimonialCard
                name="Emily Chen"
                image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                text="Quick booking, fair prices, and excellent house cleaning service. Highly recommend!"
                rating={4}
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16} bg="blue.700" color="white">
        <Container maxW="container.xl">
          <Center>
            <VStack spacing={6} textAlign="center">
              <Heading>Ready to Transform Your Home?</Heading>
              <Text fontSize="lg" maxW="700px">
                Book your first service today and experience the convenience of professional home services at your fingertips.
              </Text>
              <Button colorScheme="whiteAlpha" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Book a Service Now</Button>
            </VStack>
          </Center>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg="gray.800" color="white">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="flex-start">
              <Heading size="md" mb={4}>WeServe</Heading>
              <Text>Your one-stop solution for all home services.</Text>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md" mb={4}>Services</Heading>
              <Text>Plumbing</Text>
              <Text>Gardening</Text>
              <Text>House Cleaning</Text>
              <Text>Home Repairs</Text>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md" mb={4}>Company</Heading>
              <Text>About Us</Text>
              <Text>Careers</Text>
              <Text>Contact Us</Text>
              <Text>Blog</Text>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md" mb={4}>Support</Heading>
              <Text>FAQ</Text>
              <Text>Terms of Service</Text>
              <Text>Privacy Policy</Text>
              <Text>Help Center</Text>
            </VStack>
          </SimpleGrid>
          <Center mt={12}>
            <Text fontSize="sm">© 2025 WeServe. All rights reserved.</Text>
          </Center>
        </Container>
      </Box>
    </Box>
  );
};

// Helper Components
const ServiceCard = ({ icon, title, description }) => {
  return (
    <VStack
      p={8}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="start"
      _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
      transition="all 0.3s"
      minH="300px"

    >
      <Box >
      <Icon as={icon} boxSize={10} color="blue.500"  />
      <Heading size="md" >{title}</Heading>
      <Text color="gray.600">{description}</Text>
      </Box>
      <Box mt="auto" w="100%" textAlign="right" >
        <Button variant="link" colorScheme="blue" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Learn More →
        </Button>
      </Box>
    </VStack>
  );
};

const StepCard = ({ number, title, description }) => {
  return (
    <VStack
      p={8}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="center"
    >
      <Center
        bg="blue.500"
        color="white"
        h="60px"
        w="60px"
        borderRadius="full"
        fontSize="2xl"
        fontWeight="bold"
      >
        {number}
      </Center>
      <Heading size="md">{title}</Heading>
      <Text color="gray.600" textAlign="center">{description}</Text>
    </VStack>
  );
};

const TestimonialCard = ({ name, image, text, rating }) => {
  return (
    <VStack
      p={8}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="start"
    >
      <Text fontSize="lg" fontStyle="italic">"{text}"</Text>
      <HStack spacing={4}>
        <Avatar.Root>
          <Avatar.Fallback name={name} />
          <Avatar.Image src={image} />
        </Avatar.Root>
        <Box>
          <Text fontWeight="bold">{name}</Text>
          <HStack>
            {Array(5)
              .fill("")
              .map((_, i) => (
                <Icon
                  key={i}
                  color={i < rating ? "yellow.400" : "gray.300"}
                >
                  <FaStar />
                </Icon>
              ))}
          </HStack>
        </Box>
      </HStack>
    </VStack>
  );
};

export default Homepage;