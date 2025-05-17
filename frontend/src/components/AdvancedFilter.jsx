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
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDollarSign,
} from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { useUserStore } from "../store/userStore";
import ServiceSelector from "./ServiceSelector";
import LocationSelector from "./LocationSelector";
import DateSelector from "./DateSelector";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

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

// Default map center location (Auckland)
const DEFAULT_CENTER = { lat: -36.8485, lng: 174.7633 };
const DEFAULT_ZOOM = 12;

// Helper function to check if latitude and longitude float values differ significantly
const isSignificantChange = (value1, value2, threshold = 0.0001) => {
  return Math.abs(value1 - value2) > threshold;
};

const AdvancedFilter = () => {
  const { searchProviders, lastSearchParams, users, setSelectedProviderId } =
    useUserStore();

  // Map-related state
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  // Used to track whether a programmatic update of the map state is in progress
  const isUpdatingMapProgrammatically = useRef(false);

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
  }, [
    selectedService,
    selectedLocation,
    selectedDate,
    selectedPrice,
    searchProviders,
  ]);

  // Update map center and zoom level based on search results
  useEffect(() => {
    if (users && users.length > 0) {
      // Set flag to start programmatic marker update
      isUpdatingMapProgrammatically.current = true;

      // Collect all valid coordinate points
      const validLocations = users
        .filter(
          (user) =>
            user.location &&
            user.location.coordinates &&
            Array.isArray(user.location.coordinates) &&
            user.location.coordinates.length === 2
        )
        .map((user) => ({
          lng: user.location.coordinates[0],
          lat: user.location.coordinates[1],
        }));

      if (validLocations.length > 0) {
        // If there is only one location, directly set the map center to that location
        if (validLocations.length === 1) {
          setMapCenter(validLocations[0]);
          setMapZoom(14); // Zoom in a bit for a clearer view of the single location
        } else {
          // Calculate the bounds of all locations, then adjust the map to show all locations
          // Since we are not using Google Maps API bounds, we simply calculate the average coordinates as a workaround
          const sumLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0);
          const sumLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0);

          setMapCenter({
            lat: sumLat / validLocations.length,
            lng: sumLng / validLocations.length,
          });

          // Adjust zoom level based on the number of results, using a simple heuristic here
          if (validLocations.length <= 3) {
            setMapZoom(12);
          } else if (validLocations.length <= 8) {
            setMapZoom(11);
          } else {
            setMapZoom(10);
          }
        }
      } else {
        // If no valid locations, use default center and zoom level
        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      }

      // Set a short delay to ensure map updates complete before allowing user interaction updates
      setTimeout(() => {
        isUpdatingMapProgrammatically.current = false;
      }, 300);
    } else {
      // If there are no search results, use default center and zoom level
      isUpdatingMapProgrammatically.current = true;
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);

      setTimeout(() => {
        isUpdatingMapProgrammatically.current = false;
      }, 300);
    }
  }, [users]);

  // Handle map camera change events
  const handleCameraChange = (ev) => {
    // Ignore camera changes caused by user interaction if a programmatic update is in progress
    if (isUpdatingMapProgrammatically.current) return;

    const { center, zoom } = ev.detail;
    const newCenter = { lat: center.lat, lng: center.lng };
    const newZoom = zoom;

    // Check if the center point has changed significantly to avoid unnecessary re-rendering caused by floating-point precision issues
    if (
      isSignificantChange(newCenter.lat, mapCenter.lat) ||
      isSignificantChange(newCenter.lng, mapCenter.lng) ||
      newZoom !== mapZoom
    ) {
      setMapCenter(newCenter);
      setMapZoom(newZoom);
    }
  };

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
    if (!selectedDate) return "Date";

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

    return "Date";
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

  // Handle marker click events
  const handleMarkerClick = (userId) => {
    // Set the selected provider ID, which will be used in BookingPage to highlight the corresponding ProviderCard
    // Pass true to indicate the selection was triggered by a map marker click
    setSelectedProviderId(userId, true);
  };

  return (
    <VStack spacing={4} align="stretch" ml={4}>
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
                    <Text
                      fontWeight="medium"
                      isTruncated
                      userSelect="none"
                      fontSize="md"
                    >
                      {selectedService ? selectedService.title : "Service"}
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
                  <Icon
                    as={FaMapMarkerAlt}
                    mr={2}
                    color="blue.500"
                    boxSize={5}
                  />
                  <Box flex="1" minWidth="0">
                    <Text
                      fontWeight="medium"
                      isTruncated
                      userSelect="none"
                      fontSize="md"
                    >
                      {selectedLocation ? selectedLocation.city : "City"}
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
                  <Icon
                    as={FaCalendarAlt}
                    mr={2}
                    color="blue.500"
                    boxSize={5}
                  />
                  <Box flex="1" minWidth="0">
                    <Text
                      fontWeight="medium"
                      isTruncated
                      userSelect="none"
                      fontSize="md"
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
          </GridItem>
        </Grid>

        {/* Second Row - Price Range Slider and Clear All Button */}
        <Box px={4} pb={4} pt={1}>
          <Flex justifyContent="space-between" alignItems="center">
            
            <HStack flex={1} spacing={6} width="full">
            <Flex
                  p={3}
                  align="center"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  height="48px"
                  width="350px"
                >
              <Flex alignItems="center" minWidth="140px" >
                <Icon as={FaDollarSign} color="blue.500" boxSize={5} mr={2} />
                <Text fontSize="sm" fontWeight="medium" >
                  Price/Hour: {slider.value[0]}
                </Text>
              </Flex>


              <HStack spacing={3} flex={1} minWidth="250px" ml={8}>
                
                <Slider.RootProvider value={slider} width="140px">
                  <Slider.Control height="20px">
                    <Slider.Track height="8px">
                      <Slider.Range bg="blue.500" />
                    </Slider.Track>
                    <Slider.Thumbs boxSize="16px" />
                  </Slider.Control>
                </Slider.RootProvider>
              </HStack>
              </Flex>

              <Spacer />

              {/* Clear All Button moved to second row */}
              <Flex
                  p={3}
                  align="center"
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  borderWidth="1px"
                  borderColor="gray.200"
                  height="48px"
                onClick={handleClearAll}
                width="190px"
              >
                <Icon as={MdClear} mr={2} color="blue.500" boxSize={5} />
                <Box flex="1" minWidth="0">
                    <Text
                      fontWeight="medium"
                      isTruncated
                      userSelect="none"
                      fontSize="md"
                    >Clear All</Text>
                </Box>
              </Flex>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Map region */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        shadow="base"
        height="510px"
        position="relative"
        overflow="hidden"
      >
          <Map
            mapId="d792ca0a8995a3f5"
            center={mapCenter}
            zoom={mapZoom}
            onCameraChanged={handleCameraChange}
            style={{ width: "100%", height: "100%" }}
            disableDefaultUI={true} // Disable all default Google Maps UI controls
            zoomControl={true} // Enable zoom control only
          >
            {/* Iterate over all search results and display markers */}
            {users &&
              users.length > 0 &&
              users.map((user) => {
                // Ensure the user has location information
                if (
                  user.location &&
                  user.location.coordinates &&
                  Array.isArray(user.location.coordinates) &&
                  user.location.coordinates.length === 2
                ) {
                  const position = {
                    lng: user.location.coordinates[0],
                    lat: user.location.coordinates[1],
                  };

                  return (
                    <AdvancedMarker
                      key={user._id}
                      position={position}
                      onClick={() => handleMarkerClick(user._id)}
                    >
                      <Pin
                        background={"#B0E0E6"} // Light blue
                        borderColor={"#6495ED"} // Medium blue
                        glyphColor={"#F0F8FF"} // Alice Blue
                      />
                    </AdvancedMarker>
                  );
                }
                return null;
              })}
          </Map>
        
      </Box>
    </VStack>
  );
};

export default AdvancedFilter;
