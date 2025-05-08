import React, { useRef, useEffect } from "react";
import { Box, Flex, Image, Text, Badge, Icon, VStack, HStack } from "@chakra-ui/react";
import { FaStar, FaSyncAlt, FaCalendar, FaEnvelope } from "react-icons/fa";
import { useUserStore } from "../store/user";
import { useNavigate } from "react-router-dom";

// 
const formatAvailability = (availability) => {
  if (!availability || typeof availability !== "object") return "Unavailable";

  // 
  if (Array.isArray(availability)) {
    return availability.map((slot) => {
      const { dayOfWeek, startTime, endTime, isAvailable } = slot;
      return isAvailable
        ? `${dayOfWeek}: ${startTime} - ${endTime}`
        : `${dayOfWeek}: Unavailable`;
    }).join(" | ");
  }

  // 
  const { dayOfWeek, startTime, endTime, isAvailable } = availability;
  return isAvailable
    ? `${dayOfWeek}: ${startTime} - ${endTime}`
    : `${dayOfWeek}: Unavailable`;
};

const ProviderCard = ({ user }) => {
  const { selectedProviderId, setSelectedProviderId, isMarkerSelect } = useUserStore();
  const isSelected = selectedProviderId === user._id;
  const isEffectivelyMarkerSelected = isSelected && isMarkerSelect;
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/providerDetail/${user._id}`);
  };

  useEffect(() => {
    if (isEffectivelyMarkerSelected && cardRef.current) {
      const resultsContainer = document.getElementById('results-container');
      if (!resultsContainer) return;

      const containerRect = resultsContainer.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();

      const isFullyVisible = (
        cardRect.top >= containerRect.top &&
        cardRect.bottom <= containerRect.bottom
      );

      if (!isFullyVisible) {
        const cardTopRelativeToContainer = cardRect.top - containerRect.top + resultsContainer.scrollTop;
        const scrollTarget = cardTopRelativeToContainer - (containerRect.height - cardRect.height) / 2;

        resultsContainer.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [isSelected, isMarkerSelect]);

  useEffect(() => {
    if (isEffectivelyMarkerSelected && cardRef.current) {
      const handleOutsideClick = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          setSelectedProviderId(null, false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isEffectivelyMarkerSelected, setSelectedProviderId]);

  const handleMouseLeave = () => {
    if (isEffectivelyMarkerSelected) {
      setSelectedProviderId(null, false);
    }
  };

  return (
    <Box
      ref={cardRef}
      onClick={handleCardClick}
      cursor="pointer"
      w="600px"
      mx="auto"
      p={4}
      my={2}
      borderWidth="1px"
      borderRadius="lg"
      bg={isEffectivelyMarkerSelected ? "green.50" : "white"}
      borderColor={isEffectivelyMarkerSelected ? "yellow.400" : "gray.200"}
      boxShadow={isEffectivelyMarkerSelected ? "lg" : "sm"}
      _hover={
        !isEffectivelyMarkerSelected
          ? { bg: "gray.50", borderColor: "gray.300" }
          : { bg: "green.50", borderColor: "yellow.400", boxShadow: "lg" }
      }
      _active={{ filter: "brightness(0.9)" }}
      onMouseLeave={handleMouseLeave}
    >
      <Flex direction="row" gap={4}>
        <Box flexShrink={0}>
          <Image
            borderRadius="md"
            boxSize="120px"
            objectFit="cover"
            src={user.avatar}
            alt={user.name}
          />
        </Box>

        <VStack align="start" spacing={2} flex="1">
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="semibold">{user.name}</Text>
            <Badge colorScheme="yellow">Provider</Badge>
          </HStack>

          <HStack spacing={2}>
            <Icon as={FaStar} color="yellow.400" />
            <Text fontSize="sm" color="gray.500">Rating: {user.rating}</Text>
          </HStack>

          <Text fontSize="sm" color="gray.600">{user.bio}</Text>

          <HStack spacing={3} flexWrap="wrap">
            <HStack spacing={1}>
              <Icon as={FaSyncAlt} />
              <Text fontSize="sm">
                Available: {formatAvailability(user.availability)}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaCalendar} />
              <Text fontSize="sm">
                Schedule: {formatAvailability(user.availability)}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaEnvelope} />
              <Text fontSize="sm">Contact: {user.contact}</Text>
            </HStack>
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ProviderCard;
