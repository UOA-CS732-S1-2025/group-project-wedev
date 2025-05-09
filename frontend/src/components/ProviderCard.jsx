import React, { useRef, useEffect } from "react";
import { Box, Flex, Image, Text, Badge, Icon, VStack, HStack, RatingGroup} from "@chakra-ui/react";
import { FaStar, FaSyncAlt, FaCalendar, FaEnvelope, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useUserStore } from "../store/user";


const ProviderCard = ({ user }) => {
  const { selectedProviderId, setSelectedProviderId, isMarkerSelect } = useUserStore();
  const isSelected = selectedProviderId === user._id;
  const isEffectivelyMarkerSelected = isSelected && isMarkerSelect;
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/providerDetail/${user._id}`);
  };

   // 当组件被选中时，且是通过地图标记点击选中的，才滚动到视图中
  useEffect(() => {
    if (isEffectivelyMarkerSelected && cardRef.current) {
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

  // 添加全局点击事件监听器，点击卡片外部任意位置可取消marker高亮
  useEffect(() => {
    // 只在卡片被marker高亮时添加监听器
    if (isEffectivelyMarkerSelected && cardRef.current) {
      const handleOutsideClick = (event) => {
        // 检查点击是否在当前卡片外部
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          setSelectedProviderId(null, false);
        }
      };

      // 添加点击事件监听器到document
      document.addEventListener('mousedown', handleOutsideClick);

      // 清理函数，移除事件监听器
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isEffectivelyMarkerSelected, setSelectedProviderId]);

  // 鼠标离开时，如果当前卡片是被 Marker 选中的，则清除全局选中状态
  const handleMouseLeave = () => {
    if (isEffectivelyMarkerSelected) {
      setSelectedProviderId(null, false); // 清除 Marker 导致的高亮
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
            {user.address.suburb}, {user.address.city}
          </Text>
          <Text fontSize="sm" color="gray.500">{user.description}</Text>

          {/* 统计数据 */}
          <HStack spacing={4} mt={2}>
            <Flex align="center">
              {/* 星星评分显示 */}
              {(() => {
                const rating = Math.round((user.averageRating || 0) * 2) / 2; // 四舍五入到0.5
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
              {/* 真实评分 */}
              <Text ml={2} fontWeight="bold">{user.averageRating?.toFixed(1)}</Text>
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
