import React from 'react';
import { 
  SimpleGrid, 
  Box, 
  VStack, 
  HStack,
  Text, 
  Icon} from '@chakra-ui/react';
import { FaWrench, FaLeaf, FaTools, FaBroom, FaPaintRoller } from 'react-icons/fa';

const ServiceSelector = ({ onSelect }) => {
  // Services data with icons, titles and short descriptions
  const services = [
    {
      icon: FaWrench,
      title: "Plumbing",
      description: "Fix leaks and pipe issues",
      color: "teal.400"
    },
    {
      icon: FaLeaf,
      title: "Garden & Lawn",
      description: "Landscaping and maintenance",
      color: "green.400"
    },
    {
      icon: FaTools,
      title: "Home Repairs",
      description: "General home fixing services",
      color: "purple.400"
    },
    {
      icon: FaBroom,
      title: "House Cleaning",
      description: "Professional cleaning services",
      color: "teal.400"
    },
    {
      icon: FaPaintRoller,
      title: "Painting",
      description: "Interior & exterior painting",
      color: "green.400"
    },
    {
      icon: FaWrench,
      title: "Appliance Repair",
      description: "Fix household appliances",
      color: "purple.400"
    }
  ];

  // Get hover color based on index
  const getHoverColor = (index) => {
    switch (index % 3) {
      case 0: return 'teal.100';
      case 1: return 'green.100';
      case 2: return 'purple.100';
      default: return 'blue.100';
    }
  };

  // Get active color based on index
  const getActiveColor = (index) => {
    switch (index % 3) {
      case 0: return 'teal.100';
      case 1: return 'green.100';
      case 2: return 'purple.100';
      default: return 'blue.100';
    }
  };

  return (
    <SimpleGrid columns={2} spacing={3} width="100%" p={2}>
      {services.map((service, index) => (
        <Box
          key={index}
          p={3}
          borderRadius="md"
          cursor="pointer"
          onClick={() => onSelect && onSelect(service)}
          _hover={{
            bg: getHoverColor(index),
          }}
          _active={{
            bg: getActiveColor(index),
            transform: 'scale(0.98)',
          }}
          transition="all 0.2s ease-in-out"
        >
          <VStack spacing={2} align="start">
            <HStack spacing={3} align="center">
              <Box 
                p={2} 
                borderRadius="md" 
                bg={service.color} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Icon as={service.icon} boxSize={4} color="white" />
              </Box>
              <Text fontWeight="bold" fontSize="sm">{service.title}</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" noOfLines={1} ml="40px">
              {service.description}
            </Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ServiceSelector;