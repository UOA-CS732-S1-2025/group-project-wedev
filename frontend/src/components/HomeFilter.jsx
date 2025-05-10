import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Icon,
  Popover, Portal, Input
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceSelector from './ServiceSelector';
import LocationSelector from './LocationSelector';
import DateSelector from './DateSelector';
import { useUserStore } from '../store/user';

const HomeFilter = () => {
  const navigate = useNavigate();
  const { searchProviders } = useUserStore();
  
  const [serviceOpen, setServiceOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Separate press states for each component
  const [servicePressed, setServicePressed] = useState(false);
  const [serviceHovered, setServiceHovered] = useState(false);
  const [locationPressed, setLocationPressed] = useState(false);
  const [locationHovered, setLocationHovered] = useState(false);
  const [datePressed, setDatePressed] = useState(false);
  const [dateHovered, setDateHovered] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setServiceOpen(false);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationOpen(false);
  };
  
  const handleDateSelect = (dateSelection) => {
    setSelectedDate(dateSelection);
    setDateOpen(false);
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get display text for date selection
  const getDateDisplayText = () => {
    if (!selectedDate) return "Enter date";
    
    if (selectedDate.date) {
      // Single date selection
      return formatDate(selectedDate.date);
    } else if (selectedDate.startDate && selectedDate.endDate) {
      // Date range selection
      return `${formatDate(selectedDate.startDate)} - ${formatDate(selectedDate.endDate)}`;
    }
    
    return "Enter date";
  };

  // Handle the search button click
  const handleSearch = async () => {
    try {
      // Create search params with only defined values
      const searchParams = {};
      
      // Add service type if selected
      if (selectedService) {
        searchParams.serviceType = selectedService.title;
      }
      
      // Add location if selected
      if (selectedLocation) {
        searchParams.location = selectedLocation;
      }
      
      // Add date if selected (keeping your existing logic)
      if (selectedDate?.date) {
        searchParams.date = selectedDate.date.toISOString();
      } else if (selectedDate?.startDate) {
        searchParams.date = selectedDate.startDate.toISOString();
      }
      
      // Call the search API through the store
      await searchProviders(searchParams);
      
      // Navigate with state to indicate we're coming from search
      navigate('/booking', { state: { fromSearch: true } });
    } catch (error) {
      // Handle error without toast
      console.error("Search error:", error);
    }
  };

  return (
    <Box px={4} py={8} position="relative">
      <Box
        width="1100px"
        mx="auto"
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="xl"
        height="auto"
        my={8}
        mt={30}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="stretch"
          minH={{ md: "80px" }}
          p={4}
          gap={4}
        >
          {/* Service Type */}
          <Box
            flex="1.2"
            bg="transparent"
            boxShadow="none"
            border="none"
          >
            <Popover.Root
              positioning={{ offset: { crossAxis: 100, mainAxis: 10 } }}
              size={'lg'}
              open={serviceOpen}
              onOpenChange={(e) => setServiceOpen(e.open)}
            >
              <Popover.Trigger asChild transition="all 0.2s ease-in-out">
                <Flex
                  p={4}
                  align="center"
                  h="full"
                  cursor="pointer"
                  role="group"
                  borderRadius="md"
                  transition="background-color 0.2s ease, transform 0.1s ease"
                  onMouseEnter={() => setServiceHovered(true)}
                  onMouseLeave={() => {
                    setServiceHovered(false);
                    setServicePressed(false);
                  }}
                  onMouseDown={() => setServicePressed(true)}
                  onMouseUp={() => setServicePressed(false)}
                  bg={
                    servicePressed
                      ? 'gray.400'
                      : serviceHovered
                        ? 'gray.200'
                        : 'transparent'
                  }
                  transform={servicePressed ? 'scale(0.98)' : 'none'}
                >

                <Icon
                  as={selectedService?.icon || FaBriefcase}
                  mr={3}
                  color="green.500"
                  boxSize={5}
                />
                <Box minWidth="120px" height="42px">
                  <Text fontSize="xs" color="gray.500" userSelect="none" textAlign="left">I'm looking for</Text>
                  <Text fontWeight="medium" isTruncated userSelect="none" textAlign="left">
                    {selectedService ? selectedService.title : "Service Type"}
                  </Text>
                </Box>
              </Flex>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content width="550px">
                  <Popover.Body p={3}>
                    <ServiceSelector onSelect={handleServiceSelect} />
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
      </Box>

      {/* Location */}
      <Box
        flex="1.2"
        bg="transparent"
        boxShadow="none"
        border="none"
      >
        <Popover.Root
          positioning={{ offset: { crossAxis: 20, mainAxis: 10 } }}
          size={'lg'}
          open={locationOpen}
          onOpenChange={(e) => setLocationOpen(e.open)}
        >
          <Popover.Trigger asChild transition="all 0.2s ease-in-out">
            <Flex
              p={4}
              align="center"
              h="full"
              cursor="pointer"
              role="group"
              borderRadius="md"
              transition="background-color 0.2s ease, transform 0.1s ease"
              onMouseEnter={() => setLocationHovered(true)}
              onMouseLeave={() => {
                setLocationHovered(false);
                setLocationPressed(false);
              }}
              onMouseDown={() => setLocationPressed(true)}
              onMouseUp={() => setLocationPressed(false)}
              bg={
                locationPressed
                  ? 'gray.400'
                  : locationHovered
                    ? 'gray.200'
                    : 'transparent'
              }
              transform={locationPressed ? 'scale(0.98)' : 'none'}
            >
              <Icon as={FaMapMarkerAlt} mr={3} color="green.500" boxSize={5} />
              <Box minWidth="120px" height="42px">
                <Text fontSize="xs" color="gray.600" userSelect="none" textAlign="left">Near</Text>
                <Text fontWeight="medium" isTruncated userSelect="none" textAlign="left">
                  {selectedLocation ? selectedLocation.city : "Enter your city"}
                </Text>
              </Box>
            </Flex>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Body p={3}>
                  <LocationSelector onSelect={handleLocationSelect} />
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Box>

      {/* Date Selection */}
      <Box
        flex="1.2"
        bg="transparent"
        boxShadow="none"
        border="none"
      >
        <Popover.Root
          positioning={{ offset: { crossAxis: 20, mainAxis: 10 } }}
          size={'lg'}
          open={dateOpen}
          onOpenChange={(e) => setDateOpen(e.open)}
        >
          <Popover.Trigger asChild transition="all 0.2s ease-in-out">
            <Flex
              p={4}
              align="center"
              h="full"
              cursor="pointer"
              role="group"
              borderRadius="md"
              transition="background-color 0.2s ease, transform 0.1s ease"
              onMouseEnter={() => setDateHovered(true)}
              onMouseLeave={() => {
                setDateHovered(false);
                setDatePressed(false);
              }}
              onMouseDown={() => setDatePressed(true)}
              onMouseUp={() => setDatePressed(false)}
              bg={
                datePressed
                  ? 'gray.400'
                  : dateHovered
                    ? 'gray.200'
                    : 'transparent'
              }
              transform={datePressed ? 'scale(0.98)' : 'none'}
            >
              <Icon as={FaCalendarAlt} mr={3} color="green.500" boxSize={5} />
              <Box minWidth="120px" height="42px">
                <Text fontSize="xs" color="gray.500" userSelect="none" textAlign="left">On</Text>
                <Text 
                  fontSize="md" 
                  fontWeight="medium" 
                  isTruncated 
                  whiteSpace="nowrap" 
                  overflow="hidden" 
                  textOverflow="ellipsis"
                  maxW="100%"
                  userSelect="none"
                  textAlign="left"
                >
                  {getDateDisplayText()}
                </Text>
              </Box>
            </Flex>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Body p={3}>
                  <DateSelector onSelect={handleDateSelect} />
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Box>

      {/* Search Button */}
      <Box 
        flex={{ base: '1', md: '0.8' }} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Button
          minH={"50px"}
          maxW={"150px"}
          colorScheme="green"
          borderRadius="md"
          px={6}
          py={2}
          size="md"
          height="auto"
          _hover={{ bg: 'green.600' }}
          _active={{
            bg: 'green.700',
            transform: 'scale(0.98)'
          }}
          transition="all 0.2s ease-in-out"
          onClick={handleSearch}
        >
          <HStack spacing={2}>
            <Icon as={FaSearch} boxSize={4} />
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