import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Input, 
  Button,
  Text,
  Timeline,
  Span,
  Icon,
  Spinner,
  Center,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { LuSend, LuMessageSquare } from 'react-icons/lu';
import { FaUserCircle } from 'react-icons/fa';
import { useConversationStore } from '../store/conversationStore';
import CachedAvatar from './CachedAvatar';
import { Link as RouterLink } from 'react-router-dom';

const ConversationView = ({ conversation, user }) => {
  const { activeMessages, messageLoading, fetchMessages, sendMessage } = useConversationStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Cache user information
  const currentUserInfo = useMemo(() => ({
    id: user?._id,
    username: user?.username,
    profilePictureUrl: user?.profilePictureUrl
  }), [user?._id, user?.username, user?.profilePictureUrl]);
  
  const otherUserInfo = useMemo(() => ({
    id: conversation?.otherUser?._id,
    username: conversation?.otherUser?.username,
    profilePictureUrl: conversation?.otherUser?.profilePictureUrl
  }), [conversation?.otherUser]);
  
  useEffect(() => {
    if (conversation?._id) {
      fetchMessages(conversation._id).then(() => {
        // Directly set scroll position to bottom without animation
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        }
      });
    }
  }, [conversation?._id, fetchMessages]);
  
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user?._id || !conversation?._id) return;
    
    const messageToSend = newMessage;
    setNewMessage('');
    
    await sendMessage(conversation._id, user._id, messageToSend);
    
    // Use smooth scrolling for new messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [newMessage, user?._id, conversation?._id, sendMessage]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Process and cache message data
  const processedMessages = useMemo(() => {
    if (!Array.isArray(activeMessages)) return [];
    
    return activeMessages.map(message => {
      const messageSenderId = String(message.sender?._id || message.sender);
      const isCurrentUserSender = messageSenderId === String(user?._id);
      
      return {
        ...message,
        id: message._id || `msg-${Math.random()}`,
        isCurrentUserSender
      };
    });
  }, [activeMessages, user?._id]);
  
  if (!conversation) return null;

  return (
    <Box display="flex" flexDirection="column" h="100%" position="relative" zIndex={1}>
      {/* Header */}
      <Box 
        px={6} 
        py={3} 
        borderBottom="1px solid" 
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        gap={3}
      >
        <CachedAvatar
          name={conversation?.otherUser?.username || "User"}
          src={conversation?.otherUser?.profilePictureUrl}
          size="sm"
        />
        <Text fontWeight="bold">
          
            <Button 
              as={RouterLink} 
              to={`/providerDetail/${conversation.otherUser._id}`}
              size="xs" 
              variant="outline"
              colorScheme="blue"
              ml="auto"
              leftIcon={<FaUserCircle />}
            >
              View Profile
            </Button>
          
        </Text>
      </Box>

      {/* Messages */}
      <Box flex="1" overflowY="auto" py={4} px={4} maxH="calc(100vh - 280px)">
        {messageLoading ? (
          <Center h="100%">
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : (
          <Timeline.Root variant="subtle">
            {processedMessages.map((message) => (
              <Timeline.Item key={message.id}>
                <Timeline.Connector>
                  <Timeline.Separator />
                  <Timeline.Indicator>
                    <Icon fontSize="sm">
                      <LuMessageSquare />
                    </Icon>
                  </Timeline.Indicator>
                </Timeline.Connector>
                <Timeline.Content>
                  <Timeline.Title>
                    <CachedAvatar
                      size="2xs"
                      name={message.isCurrentUserSender ? currentUserInfo.username : otherUserInfo.username}
                      src={message.isCurrentUserSender ? currentUserInfo.profilePictureUrl : otherUserInfo.profilePictureUrl}
                    />
                    {message.isCurrentUserSender ? currentUserInfo.username : otherUserInfo.username}
                    <Span color="fg.muted"> sent </Span>
                    <Span fontWeight="medium">{message.content}</Span>
                    <Span color="fg.muted" ml="auto" fontSize="xs">
                      {new Date(message.createdAt).toLocaleString()}
                    </Span>
                  </Timeline.Title>
                </Timeline.Content>
              </Timeline.Item>
            ))}

            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>
                  <CachedAvatar
                    size="sm"
                    name={currentUserInfo.username}
                    src={currentUserInfo.profilePictureUrl}
                  />
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content gap="4" mt="-1" w="full">
                <Box display="flex" gap={2}>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxW="300px"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSendMessage}
                    isDisabled={!newMessage.trim()}
                  >
                    Send a message
                  </Button>
                </Box>
              </Timeline.Content>
            </Timeline.Item>
            <Box ref={messagesEndRef} />
          </Timeline.Root>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ConversationView); 