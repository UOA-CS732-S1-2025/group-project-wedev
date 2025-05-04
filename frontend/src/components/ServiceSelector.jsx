import React from 'react';
import { 
  SimpleGrid, 
  Box, 
  VStack, 
  Text, 
  Icon} from '@chakra-ui/react';
import { FaWrench, FaLeaf, FaTools, FaBroom, FaPaintRoller } from 'react-icons/fa';

const ServiceSelector = ({ onSelect }) => {
  // Services data with icons, titles and short descriptions
  const services = [
    {
      icon: FaWrench,
      title: "Plumbing",
      description: "Fix leaks and pipe issues"
    },
    {
      icon: FaLeaf,
      title: "Garden & Lawn",
      description: "Landscaping and maintenance"
    },
    {
      icon: FaTools,
      title: "Home Repairs",
      description: "General home fixing services"
    },
    {
      icon: FaBroom,
      title: "House Cleaning",
      description: "Professional cleaning services"
    },
    {
      icon: FaPaintRoller,
      title: "Painting",
      description: "Interior & exterior painting"
    },
    {
      icon: FaWrench,
      title: "Appliance Repair",
      description: "Fix household appliances"
    }
  ];



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
            bg: 'blue.50',
          }}
          _active={{
            bg: 'blue.100',
            transform: 'scale(0.98)',
          }}
          transition="all 0.2s ease-in-out"
        >
          <VStack spacing={1} align="start">
            <Icon as={service.icon} boxSize={5} color="blue.500" />
            <Text fontWeight="bold" fontSize="sm">{service.title}</Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {service.description}
            </Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ServiceSelector;