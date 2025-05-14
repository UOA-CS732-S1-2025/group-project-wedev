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

// 默认的地图中心位置（奥克兰）
const DEFAULT_CENTER = { lat: -36.8485, lng: 174.7633 };
<<<<<<< HEAD
const DEFAULT_ZOOM = 10;
=======
const DEFAULT_ZOOM = 12;
>>>>>>> origin/main

// 用于检查经纬度浮点值是否有显著差异的辅助函数
const isSignificantChange = (value1, value2, threshold = 0.0001) => {
  return Math.abs(value1 - value2) > threshold;
};

const AdvancedFilter = () => {
  const { searchProviders, lastSearchParams, users, setSelectedProviderId } =
    useUserStore();

  // 地图相关状态
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  // 用于跟踪是否正在进行编程式更新地图状态
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

  // 根据搜索结果更新地图中心点和缩放级别
  useEffect(() => {
    if (users && users.length > 0) {
      // 设置标记开始进行编程式更新
      isUpdatingMapProgrammatically.current = true;

      // 收集所有有效的坐标点
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
        // 如果只有一个位置，直接将地图中心设置为该位置
        if (validLocations.length === 1) {
          setMapCenter(validLocations[0]);
          setMapZoom(14); // 放大一点以便清晰查看单个位置
        } else {
          // 计算所有位置的边界，然后调整地图以显示所有位置
          // 由于我们没有使用 Google Maps API 的 bounds，我们通过计算平均坐标简单实现
          const sumLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0);
          const sumLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0);

          setMapCenter({
            lat: sumLat / validLocations.length,
            lng: sumLng / validLocations.length,
          });

          // 根据结果数量调整缩放级别，这里使用一个简单的启发式方法
          if (validLocations.length <= 3) {
            setMapZoom(12);
          } else if (validLocations.length <= 8) {
            setMapZoom(11);
          } else {
            setMapZoom(10);
          }
        }
      } else {
        // 如果没有有效位置，使用默认中心和缩放级别
        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      }

      // 设置一个短暂的延时，确保地图更新完成后再允许用户交互更新
      setTimeout(() => {
        isUpdatingMapProgrammatically.current = false;
      }, 300);
    } else {
      // 如果没有搜索结果，使用默认中心和缩放级别
      isUpdatingMapProgrammatically.current = true;
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);

      setTimeout(() => {
        isUpdatingMapProgrammatically.current = false;
      }, 300);
    }
  }, [users]);

  // 处理地图相机变化事件
  const handleCameraChange = (ev) => {
    // 如果正在进行编程式更新，则忽略用户交互引起的相机变化
    if (isUpdatingMapProgrammatically.current) return;

    const { center, zoom } = ev.detail;
    const newCenter = { lat: center.lat, lng: center.lng };
    const newZoom = zoom;

    // 检查中心点是否有显著变化，避免浮点数精度问题导致不必要的重渲染
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

  // 处理标记点点击事件
  const handleMarkerClick = (userId) => {
    // 设置选中的 provider ID，这将在 BookingPage 中用于高亮显示对应的 ProviderCard
    // 传递 true 表示这是通过地图标记点击触发的选中
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

      {/* 地图区域 */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        shadow="base"
        height="510px"
        position="relative"
        overflow="hidden"
      >
<<<<<<< HEAD
        <APIProvider apiKey={"AIzaSyDoqQIS7SoRqv-mCcaid5cIxk7jdw2u_OE"}>
=======
>>>>>>> origin/main
          <Map
            mapId="d792ca0a8995a3f5"
            center={mapCenter}
            zoom={mapZoom}
            onCameraChanged={handleCameraChange}
            style={{ width: "100%", height: "100%" }}
            disableDefaultUI={true} // 禁用所有默认的Google Maps UI控件
            zoomControl={true} // 单独启用缩放按钮
          >
            {/* 遍历所有查询结果，显示标记点 */}
            {users &&
              users.length > 0 &&
              users.map((user) => {
                // 确保用户有位置信息
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
                        background={"#B0E0E6"} // 淡蓝色
                        borderColor={"#6495ED"} // 中蓝色
                        glyphColor={"#F0F8FF"} // 爱丽丝蓝
                      />
                    </AdvancedMarker>
                  );
                }
                return null;
              })}
          </Map>
<<<<<<< HEAD
        </APIProvider>
=======
        
>>>>>>> origin/main
      </Box>
    </VStack>
  );
};

export default AdvancedFilter;
