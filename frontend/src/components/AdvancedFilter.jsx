import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Popover,
  Portal,
  VStack,
  Slider,
  useSlider,
  Stack,
  HStack,
  Button,
  Grid,
  GridItem,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import { FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { useUserStore } from "../store/user";
import ServiceSelector from "./ServiceSelector";
import LocationSelector from "./LocationSelector";
import DateSelector from "./DateSelector";
import { APIProvider, Map, Marker} from "@vis.gl/react-google-maps";

// Helper function to format date (copied from HomeFilter)
const formatDate = (date) => {
  if (!date) return "";
  // Check if date is a string (ISO format) and convert if necessary
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return ""; // Invalid date

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Temporary data for services - needed for mapping title back to icon/object
// In a real app, this might come from a shared config or context
const servicesData = [
  {
    icon: FaBriefcase,
    title: "Plumbing",
    description: "Fix leaks and pipe issues",
  },
  {
    icon: FaBriefcase,
    title: "Garden & Lawn",
    description: "Landscaping and maintenance",
  },
  {
    icon: FaBriefcase,
    title: "Home Repairs",
    description: "General home fixing services",
  },
  {
    icon: FaBriefcase,
    title: "House Cleaning",
    description: "Professional cleaning services",
  },
  {
    icon: FaBriefcase,
    title: "Painting",
    description: "Interior & exterior painting",
  },
  {
    icon: FaBriefcase,
    title: "Appliance Repair",
    description: "Fix household appliances",
  },
];

const findServiceByTitle = (title) => {
  return servicesData.find((s) => s.title === title) || null;
};

// Helper to parse date param from store (ISO string) back to a Date object
// or null if invalid/missing
const parseDateParam = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? { date } : null; // Return in { date: Date } format
};

// Helper to parse price param from store
const parsePriceParam = (priceString) => {
  if (!priceString) return 100; // Default to 100 if no price filter
  const price = parseInt(priceString);
  return !isNaN(price) ? price : 100; // Return parsed price or default
};

const AdvancedFilter = () => {
  const { searchProviders, lastSearchParams } = useUserStore();

  // Local state for filter values initialized from store
  const [selectedService, setSelectedService] = useState(() =>
    findServiceByTitle(lastSearchParams?.serviceType)
  );
  const [selectedLocation, setSelectedLocation] = useState(
    () => lastSearchParams?.location || null
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    parseDateParam(lastSearchParams?.date)
  );
  const [selectedPrice, setSelectedPrice] = useState(() =>
    parsePriceParam(lastSearchParams?.maxHourlyRate)
  );

  // State for Popover open/close status
  const [isServiceOpen, setServiceOpen] = useState(false);
  const [isLocationOpen, setLocationOpen] = useState(false);
  const [isDateOpen, setDateOpen] = useState(false);

  // Ref to track if it's the initial render/sync phase
  const isInitialMount = useRef(true);

  // Price Filter using Slider
  const slider = useSlider({
    defaultValue: [selectedPrice],
    min: 10,
    max: 100,
    step: 1,
    thumbAlignment: "center",
  });

  // Effect to update selectedPrice when slider value changes
  useEffect(() => {
    // Skip initial render to avoid duplicate search
    if (isInitialMount.current) return;
    
    const sliderValue = slider.value[0];
    if (sliderValue !== selectedPrice) {
      setSelectedPrice(sliderValue);
    }
  }, [slider.value]);

  // Effect to trigger search when local filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const searchParams = {};
    if (selectedService) {
      searchParams.serviceType = selectedService.title;
    }
    if (selectedLocation) {
      searchParams.location = selectedLocation.city
        ? { city: selectedLocation.city }
        : selectedLocation;
    }
    if (selectedDate?.date) {
      searchParams.date = selectedDate.date.toISOString();
    } else if (selectedDate?.startDate) {
      searchParams.date = selectedDate.startDate.toISOString();
    }
    
    // Add price filter
    searchParams.maxHourlyRate = selectedPrice;

    // Call searchProviders with the current combined filters
    searchProviders(searchParams);

  }, [selectedService, selectedLocation, selectedDate, selectedPrice, searchProviders]);

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

  // Get display text for date selection
  const getDateDisplayText = () => {
    if (!selectedDate) return "Any Date";

    if (selectedDate.date) {
      return formatDate(selectedDate.date);
    } else if (selectedDate.startDate && selectedDate.endDate) {
      return `${formatDate(selectedDate.startDate)} - ${formatDate(
        selectedDate.endDate
      )}`;
    } else if (selectedDate.startDate) {
      // Handle potential case where only start date exists briefly
      return formatDate(selectedDate.startDate);
    }

    return "Any Date";
  };

  // Function to clear all filters
  const handleClearAll = () => {
    setSelectedService(null);
    setSelectedLocation(null);
    setSelectedDate(null);
    // Reset slider to default value (100)
    slider.setValue([100]);
    
    // Trigger search with empty params
    searchProviders({});
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Filter Section */}
      <Box borderWidth="1px" borderRadius="lg" shadow="base" overflow="hidden">
        {/* First Row - Service, Location, Date */}
        <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4}>
          {/* Service Type Filter */}
          <GridItem colSpan={1}>
            <Popover.Root
              open={isServiceOpen}
              onOpenChange={(e) => setServiceOpen(e.open)}
              positioning={{ placement: "bottom-start", gutter: 8 }}
              size={"lg"}
            >
              <Popover.Trigger asChild>
                <Flex
                  p={3}
                  align="center"
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  borderWidth="1px"
                  borderColor="gray.200"
                  height="48px"
                >
                  <Icon
                    as={selectedService?.icon || FaBriefcase}
                    mr={2}
                    color="blue.500"
                    boxSize={5}
                  />
                  <Box flex="1" minWidth="0">
                    <Text fontWeight="medium" isTruncated userSelect="none" fontSize="md">
                      {selectedService ? selectedService.title : "Any Service"}
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
          </GridItem>

          {/* Location Filter */}
          <GridItem colSpan={1}>
            <Popover.Root
              open={isLocationOpen}
              onOpenChange={(e) => setLocationOpen(e.open)}
              positioning={{ placement: "bottom-start", gutter: 8 }}
              size={"lg"}
            >
              <Popover.Trigger asChild>
                <Flex
                  p={3}
                  align="center"
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  borderWidth="1px"
                  borderColor="gray.200"
                  height="48px"
                >
                  <Icon as={FaMapMarkerAlt} mr={2} color="blue.500" boxSize={5} />
                  <Box flex="1" minWidth="0">
                    <Text fontWeight="medium" isTruncated userSelect="none" fontSize="md">
                      {selectedLocation ? selectedLocation.city : "Any Location"}
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
          </GridItem>

          {/* Date Filter */}
          <GridItem colSpan={1}>
            <Popover.Root
              open={isDateOpen}
              onOpenChange={(e) => setDateOpen(e.open)}
              positioning={{ placement: "bottom-start", gutter: 8 }}
              size={"lg"}
            >
              <Popover.Trigger asChild>
                <Flex
                  p={3}
                  align="center"
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  borderWidth="1px"
                  borderColor="gray.200"
                  height="48px"
                >
                  <Icon as={FaCalendarAlt} mr={2} color="blue.500" boxSize={5} />
                  <Box flex="1" minWidth="0">
                    <Text fontWeight="medium" isTruncated userSelect="none" fontSize="md">
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
          </GridItem>
        </Grid>

        {/* Second Row - Price Range Slider and Clear All Button */}
        <Box px={4} pb={4} pt={1}>
          <Flex justifyContent="space-between" alignItems="center">
            <HStack flex={1} spacing={6} width="full">
              <Flex alignItems="center" minWidth="140px">
                <Icon as={FaDollarSign} color="blue.500" boxSize={5} mr={2} />
                <Text fontSize="md" fontWeight="medium">
                  Price/Hour: {slider.value[0]}
                </Text>
              </Flex>
              
              <HStack spacing={3} flex={1} minWidth="250px">
                <Slider.RootProvider value={slider} width="160px">
                  <Slider.Control height="20px" >
                    <Slider.Track height="8px" >
                      <Slider.Range bg="blue.500" />
                    </Slider.Track>
                    <Slider.Thumbs boxSize="16px" />
                  </Slider.Control>
                </Slider.RootProvider>
              </HStack>
              
              <Spacer />
              
              {/* Clear All Button moved to second row */}
              <Button 
                size="md" 
                colorScheme="blue" 
                variant="outline"
                onClick={handleClearAll}
                minWidth="100px"
                height="40px"
              >
                Clear All
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Map Area Placeholder */}
      <Box 
  borderWidth="1px" 
  borderRadius="lg" 
  shadow="base" 
  height="510px" 
  position="relative"
  overflow="hidden"
>
  <APIProvider apiKey={'AIzaSyDoqQIS7SoRqv-mCcaid5cIxk7jdw2u_OE'}>
    <Map
      center={{ lat: -36.8485, lng: 174.7633 }} // 奥克兰的经纬度
      zoom={10}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 示例标记 */}
      <Marker position={{lat: -36.8485, lng: 174.7633}} />
    </Map>
  </APIProvider>
</Box>
    </VStack>
  );
};

export default AdvancedFilter;
