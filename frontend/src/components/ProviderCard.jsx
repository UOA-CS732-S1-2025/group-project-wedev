import React, { useRef, useEffect } from "react";
import { Box, Flex, Image, Text, Badge, Icon, VStack, HStack, RatingGroup} from "@chakra-ui/react";
import { FaStar, FaSyncAlt, FaCalendar, FaEnvelope, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";


const ProviderCard = ({ user }) => {
  const { selectedProviderId, setSelectedProviderId, isMarkerSelect } = useUserStore();
  const isSelected = selectedProviderId === user._id;
  const isEffectivelyMarkerSelected = isSelected && isMarkerSelect;
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/providerDetail/${user._id}`);
  };

   // Scroll into view only when the component is selected and the selection was triggered by a map marker click
  useEffect(() => {
    if (isEffectivelyMarkerSelected && cardRef.current) {
      // Find result container
      const resultsContainer = document.getElementById('results-container');
      if (!resultsContainer) return;

      // Check if element is within the container's visible area
      const containerRect = resultsContainer.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();

      // Calculate the card's position relative to the container
      const isFullyVisible = (
        cardRect.top >= containerRect.top &&
        cardRect.bottom <= containerRect.bottom
      );

      // If not in the visible area, calculate the scroll position needed
      if (!isFullyVisible) {
        // Calculate the card's top position relative to the container
        const cardTopRelativeToContainer = cardRect.top - containerRect.top + resultsContainer.scrollTop;
        // Calculate target scroll position (center the card in view)
        const scrollTarget = cardTopRelativeToContainer - (containerRect.height - cardRect.height) / 2;

        // Smooth scroll to the target position
        resultsContainer.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [isSelected, isMarkerSelect]);

  // Add global click event listener to cancel marker highlight when clicking anywhere outside the card
  useEffect(() => {
    // Add listener only when the card is highlighted by a marker
    if (isEffectivelyMarkerSelected && cardRef.current) {
      const handleOutsideClick = (event) => {
        // Check if the click is outside the current card
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          setSelectedProviderId(null, false);
        }
      };

      // Add click event listener to the document
      document.addEventListener('mousedown', handleOutsideClick);

      // Cleanup function to remove event listeners
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isEffectivelyMarkerSelected, setSelectedProviderId]);

  // On mouse leave, if the current card is selected by a marker, clear the global selection state
  const handleMouseLeave = () => {
    if (isEffectivelyMarkerSelected) {
      setSelectedProviderId(null, false); //Clear marker-induced highlight
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
        !isEffectivelyMarkerSelected ? 
        {
          bg: "gray.50",
          borderColor: "gray.300",
        } : 
        {
          bg: "green.50",
          borderColor: "yellow.400",
          boxShadow: "lg",
        }
      }
      _active={{filter: "brightness(0.9)",}}
      onMouseLeave={handleMouseLeave}
    >
      <Flex>
        {/* profilePicture */}
        <Image
          src={user.profilePictureUrl}
          boxSize="100px"
          borderRadius="md"
          objectFit="cover"
          alt={user.name}
          mr={4}
        />

        {/* Basic information */}
        <VStack align="start" spacing={1} flex="1">
          <Text fontWeight="bold" fontSize="lg" color="black">
            {user.firstName} {user.lastName}
          </Text>
          <Text fontSize="md" color="gray.600">
            {user.serviceType}
            <Badge ml={2} colorPalette="green" fontSize="0.8em">
                Verified
              </Badge>
          </Text>
          <Text fontSize="sm" color="gray.500">
            {user.address?.suburb || "Unknown"}, {user.address?.city || "Unknown"}
          </Text>
          <Text fontSize="sm" color="gray.500">{user.description}</Text>

          {/* Statistics */}
          <HStack spacing={4} mt={2}>
            <Flex align="center">
              {/* Star rating display */}
              {(() => {
                const rating = Math.round((user.averageRating || 0) * 2) / 2; // Round to nearest 0.5
                const stars = [];
                for (let i = 1; i <= 5; i++) {
                  if (rating >= i) {
                    stars.push(<Icon as={FaStar} key={i} color="yellow.400" />);
                  } else if (rating + 0.5 === i) {
                    stars.push(<Icon as={FaStarHalfAlt} key={i} color="yellow.400" />);
                  } else {
                    stars.push(<Icon as={FaRegStar} key={i} color="gray.300" />);
                  }
                }
                return stars;
              })()}
              {/* Actual rating */}
              <Text ml={2} fontWeight="bold">{user.averageRating?.toFixed(1)}</Text>
              <Text ml={1} color="gray.500">({user.reviewCount} reviews)</Text>
            </Flex>

          </HStack>

        </VStack>

        {/* Price */}
        <Box textAlign="right">
          <Text fontWeight="bold" fontSize="lg" color="blue.500">
            ${user.hourlyRate?.toFixed(2)}
          </Text>
          <Text fontSize="sm" color="gray.500">/Hour</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default ProviderCard;
