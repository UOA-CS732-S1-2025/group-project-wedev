import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import CachedAvatar from './CachedAvatar';

// 格式化消息时间
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (e) {
    return timestamp;
  }
};

const ChatMessage = React.memo(({ message, isCurrentUserSender, currentUser, otherUser }) => {
  return (
    <Box 
      alignSelf={isCurrentUserSender ? "flex-end" : "flex-start"}
      maxW="70%"
    >
      <HStack 
        spacing={2} 
        alignItems="flex-start"
        flexDirection={isCurrentUserSender ? "row-reverse" : "row"}
      >
        <CachedAvatar 
          size="sm"
          name={isCurrentUserSender ? currentUser?.username : otherUser?.username}
          src={isCurrentUserSender ? currentUser?.profilePictureUrl : otherUser?.profilePictureUrl}
        />
        <Box>
          <Box
            bg={isCurrentUserSender ? "blue.500" : "white"} 
            color={isCurrentUserSender ? "white" : "black"}
            px={4}
            py={2}
            borderRadius="lg"
            boxShadow="sm"
          >
            <Text>{message.content}</Text>
          </Box>
          <Text fontSize="xs" color="gray.500" textAlign={isCurrentUserSender ? "right" : "left"}>
            {formatMessageTime(message.createdAt)}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}, (prevProps, nextProps) => {
  // 增强 memo 比较逻辑，避免不必要的重新渲染
  return (
    prevProps.message.id === nextProps.message.id && 
    prevProps.isCurrentUserSender === nextProps.isCurrentUserSender
  );
});

export default ChatMessage;