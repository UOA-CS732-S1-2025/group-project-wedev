import { Box, Flex, Image, Text, Badge, Icon, VStack, HStack} from "@chakra-ui/react";
import { FaStar, FaSyncAlt, FaCalendar, FaEnvelope } from "react-icons/fa";

const ProviderCard = ({ user }) => {
  return (
    <Box
      w="600px"
      mx="auto"
      p={4}
      my={2}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.3s"
      bg="white"
      borderColor="gray.200"
      _hover={{
        transform: "scale(1.05)",
        bg: "blue.100",
        borderColor: "blue.400",
      }}
      _active={{
        filter: "brightness(0.9)",
      }}
    >
      <Flex>
        {/* 头像 */}
        <Image
          src={user.profilePictureUrl}
          boxSize="100px"
          borderRadius="md"
          objectFit="cover"
          alt={user.name}
          mr={4}
        />

        {/* 基本信息 */}
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
            {user.address.city}, {user.address.country}
          </Text>
          <Text fontSize="sm" color="gray.500">{user.description}</Text>
          
          {/* 统计数据 */}
          <HStack spacing={4} mt={2}>
            <Flex align="center">
              <Icon as={FaStar} color="yellow.400" />
              <Text ml={1} fontWeight="bold">{user.rating?.toFixed(1)}</Text>
              <Text ml={1} color="gray.500">({user.reviewCount} reviews)</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaSyncAlt} color="gray.500" />
              <Text ml={1} color="gray.500">{user.recurringGuests} recurring guests</Text>
            </Flex>
          </HStack>

          {/* 预订 & 联系信息 */}
          <HStack spacing={4}>
            <Flex align="center">
              <Icon as={FaCalendar} color="blue.500" />
              <Text ml={1} color="gray.500">Last booked {user.lastBookedDays} days ago</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaEnvelope} color="gray.500" />
              <Text ml={1} color="gray.500">Last contacted {user.lastContactedDays} days ago</Text>
            </Flex>
          </HStack>
        </VStack>

        {/* 价格 */}
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