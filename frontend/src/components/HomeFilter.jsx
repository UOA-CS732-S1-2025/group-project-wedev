import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';

const HomeFilter = () => {
  return (
    <Box px={4} py={8} position="relative">
      <Box 
        width="1200px"
        mx="auto"
        bg="white" 
        borderRadius="2xl" 
        overflow="hidden"
        boxShadow="xl"
        height="auto"
        my={8}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          align="stretch"
          minH={{ md: "80px" }}
        >
          {/* Service Type */}
          <Box 
            flex="1.2" 
            position="relative" 
            borderRight={{ base: 'none', md: '1px solid' }} 
            borderBottom={{ base: '1px solid', md: 'none' }}
            borderColor="gray.200"
          >
            <Flex 
              p={4} 
              align="center" 
              h="full" 
              cursor="pointer"
              role="group"
              _hover={{ bg: 'gray.50' }}
            >
              <Icon as={FaBriefcase} mr={3} color="green.500" boxSize={5} />
              <Box>
                <Text fontSize="xs" color="gray.500">I'm looking for</Text>
                <Text fontWeight="medium">Service Type</Text>
              </Box>
            </Flex>
          </Box>
          
          {/* Location */}
          <Box 
            flex="1.2" 
            position="relative" 
            borderRight={{ base: 'none', md: '1px solid' }}
            borderBottom={{ base: '1px solid', md: 'none' }}
            borderColor="gray.200"
          >
            <Flex 
              p={4} 
              align="center" 
              h="full" 
              cursor="pointer"
              role="group"
              _hover={{ bg: 'gray.50' }}
            >
              <Icon as={FaMapMarkerAlt} mr={3} color="green.500" boxSize={5} />
              <Box>
                <Text fontSize="xs" color="gray.500">Near</Text>
                <Text fontWeight="medium">Enter your city</Text>
              </Box>
            </Flex>
          </Box>
          
          {/* Date Selection */}
          <Box 
            flex="1.2" 
            position="relative" 
            borderRight={{ base: 'none', md: '1px solid' }}
            borderBottom={{ base: '1px solid', md: 'none' }}
            borderColor="gray.200"
          >
            <Flex 
              p={4} 
              align="center" 
              h="full" 
              cursor="pointer"
              role="group"
              _hover={{ bg: 'gray.50' }}
            >
              <Icon as={FaCalendarAlt} mr={3} color="green.500" boxSize={5} />
              <Box>
                <Text fontSize="xs" color="gray.500">On</Text>
                <Text fontWeight="medium">Enter date</Text>
              </Box>
            </Flex>
          </Box>
          
          {/* Search Button */}
          <Box flex={{ base: '1', md: '0.8' }}>
            <Button
              h="full"
              w="full"
              colorScheme="green"
              borderRadius={{ base: 'md', md: '0' }}
              px={{ base: 4, md: 6 }}
              py={{ base: 4, md: 6 }}
              _hover={{ bg: 'green.600' }}
            >
              <HStack>
                <Icon as={FaSearch} />
                <Text>Find a service</Text>
              </HStack>
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default HomeFilter;