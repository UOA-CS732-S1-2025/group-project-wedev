import React, { useRef, useEffect } from "react";
import { Box, Flex, Image, Text, Badge, Icon, VStack, HStack} from "@chakra-ui/react";
import { FaStar, FaSyncAlt, FaCalendar, FaEnvelope } from "react-icons/fa";
import { useUserStore } from "../store/user";

const ProviderCard = ({ user }) => {
  const { selectedProviderId, setSelectedProviderId, isMarkerSelect } = useUserStore();
  const isSelected = selectedProviderId === user._id;
  const cardRef = useRef(null);

  // 当组件被选中时，且是通过地图标记点击选中的，才滚动到视图中
  useEffect(() => {
    if (isSelected && isMarkerSelect && cardRef.current) {
      // 查找结果容器
      const resultsContainer = document.getElementById('results-container');
      if (!resultsContainer) return;

      // 检查元素是否在容器的可视区域内
      const containerRect = resultsContainer.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      
      // 计算卡片相对于容器的位置
      const isFullyVisible = (
        cardRect.top >= containerRect.top &&
        cardRect.bottom <= containerRect.bottom
      );

      // 如果不在可视区域内，计算需要滚动的位置
      if (!isFullyVisible) {
        // 计算卡片相对于容器的顶部位置
        const cardTopRelativeToContainer = cardRect.top - containerRect.top + resultsContainer.scrollTop;
        // 计算目标滚动位置（居中显示卡片）
        const scrollTarget = cardTopRelativeToContainer - (containerRect.height - cardRect.height) / 2;
        
        // 平滑滚动到目标位置
        resultsContainer.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [isSelected, isMarkerSelect]);

  // 鼠标离开时，如果当前卡片是选中的，则清除选中状态
  const handleMouseLeave = () => {
    if (isSelected) {
      setSelectedProviderId(null, false); // 第二个参数表示不是地图标记触发的
    }
  };

  // 鼠标悬停时，设置当前卡片为选中状态
  const handleMouseEnter = () => {
    setSelectedProviderId(user._id, false); // 第二个参数表示不是地图标记触发的
  };

  return (
    <Box
      ref={cardRef}
      w="600px"
      mx="auto"
      p={4}
      my={2}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow={isSelected ? "lg" : "sm"}
      bg={isSelected ? "green.50" : "white"}
      borderColor={isSelected ? "yellow.40" : "gray.200"}
      transition="all 0.3s"
      _hover={{
        transform: "scale(1.02)",
      }}
      _active={{
        filter: "brightness(0.9)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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