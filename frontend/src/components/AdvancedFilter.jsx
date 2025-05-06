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
  Code,
} from "@chakra-ui/react";
import { FaBriefcase, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useUserStore } from "../store/user";
import ServiceSelector from "./ServiceSelector";
import LocationSelector from "./LocationSelector";
import DateSelector from "./DateSelector";

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

const parsePriceParam = (priceString) => {
  if (!priceString) return null;
  const price = parseInt(priceString);
  return !isNaN(price) ? { price } : null; // Return in { price: number } format
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

  // State for Popover open/close status
  const [isServiceOpen, setServiceOpen] = useState(false);
  const [isLocationOpen, setLocationOpen] = useState(false);
  const [isDateOpen, setDateOpen] = useState(false);

  // Ref to track if it's the initial render/sync phase
  const isInitialMount = useRef(true);

  // Price Filter
  const slider = useSlider({
    defaultValue: [40],
    thumbAlignment: "center",
  })

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
    searchProviders(searchParams);
  }, [selectedService, selectedLocation, selectedDate, searchProviders]);

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

  return (
    <VStack
      spacing={3}
      align="stretch"
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      shadow="base"
    >
      {/* Service Type Filter */}
      <Box>
        <Popover.Root
          open={isServiceOpen}
          onOpenChange={(e) => setServiceOpen(e.open)}
          positioning={{ placement: "right-start", gutter: 8 }}
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
            >
              <Icon
                as={selectedService?.icon || FaBriefcase}
                mr={2}
                color="blue.500"
                boxSize={4}
              />
              <Box flex="1" minWidth="0">
                <Text fontSize="xs" color="gray.500" userSelect="none">
                  Service
                </Text>
                <Text
                  fontWeight="medium"
                  isTruncated
                  userSelect="none"
                  fontSize="sm"
                >
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
      </Box>

      {/* Location Filter */}
      <Box>
        <Popover.Root
          open={isLocationOpen}
          onOpenChange={(e) => setLocationOpen(e.open)}
          positioning={{ placement: "right-start", gutter: 8 }}
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
            >
              <Icon as={FaMapMarkerAlt} mr={2} color="blue.500" boxSize={4} />
              <Box flex="1" minWidth="0">
                <Text fontSize="xs" color="gray.500" userSelect="none">
                  Location
                </Text>
                <Text
                  fontWeight="medium"
                  isTruncated
                  userSelect="none"
                  fontSize="sm"
                >
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
      </Box>

      {/* Date Filter */}
      <Box>
        <Popover.Root
          open={isDateOpen}
          onOpenChange={(e) => setDateOpen(e.open)}
          positioning={{ placement: "right-start", gutter: 8 }}
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
            >
              <Icon as={FaCalendarAlt} mr={2} color="blue.500" boxSize={4} />
              <Box flex="1" minWidth="0">
                <Text fontSize="xs" color="gray.500" userSelect="none">
                  Date
                </Text>
                <Text
                  fontWeight="medium"
                  isTruncated
                  userSelect="none"
                  fontSize="sm"
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

      {/* Price Filter */}

      <Stack align="flex-start">
      <Code>current: {slider.value}</Code>
      <Slider.RootProvider value={slider} width="200px">
        <Slider.Label>Slider</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
      </Slider.RootProvider>
    </Stack>
    </VStack>
  );
};

export default AdvancedFilter;
