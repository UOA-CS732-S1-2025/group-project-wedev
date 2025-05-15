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
  Heading,
  Badge,
} from '@chakra-ui/react';
import { LuSend, LuMessageSquare, LuCheck } from 'react-icons/lu';
import { FaUserCircle } from 'react-icons/fa';
import { useConversationStore } from '../store/conversationStore';
import CachedAvatar from './CachedAvatar';
import { Link as RouterLink } from 'react-router-dom';
import { toaster } from "@/components/ui/toaster";

const ConversationView = ({ conversation, user }) => {
  const { activeMessages, messageLoading, fetchMessages, sendMessage, updateLocalMessage } = useConversationStore();
  const [newMessage, setNewMessage] = useState('');
  const [updatingMessageIds, setUpdatingMessageIds] = useState([]);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null); // 轮询定时器引用
  
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
  
  // 初始加载消息
  useEffect(() => {
    if (conversation?._id) {
      fetchMessages(conversation._id).then(() => {
        // Directly set scroll position to bottom without animation
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        }
      });
      
      // 设置轮询，每5秒检查一次消息更新
      pollingIntervalRef.current = setInterval(() => {
        // 传递 true 表示跳过加载状态，并处理返回的结果
        fetchMessages(conversation._id, true).then(hasNewMessages => {
          // 只有当有新消息时，才自动滚动到底部
          if (hasNewMessages && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }, 5000);
      
      // 组件卸载时清除轮询
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [conversation?._id, fetchMessages]);
  
  // 确保当conversation变化时重新设置轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversation?._id]);
  
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user?._id || !conversation?._id) return;
    
    const messageToSend = newMessage;
    setNewMessage('');
    
    try {
      await sendMessage(conversation._id, user._id, messageToSend);
      
      // Use smooth scrolling for new messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toaster.create({ title: 'Failed to send message', description: error.message });
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
                    <Span color="fg.muted" ml="auto" fontSize="xs">
                      {new Date(message.createdAt).toLocaleString()}
                    </Span>
                    </Timeline.Title>
                    
                    
                    {message.messageType === 'booking' ? (
                      <Box
                        borderWidth="1px"
                        borderRadius="xl"
                        p={5}
                        bg={message.bookingStatus === 'pending' ? 'blue.50' : 
                            message.bookingStatus === 'accepted' ? 'green.50' : 
                            message.bookingStatus === 'rejected' ? 'red.50' : 'gray.50'}
                        my={3}
                        minW="280px"
                        maxW="600px"
                        boxShadow="md"
                        position="relative"
                        transition="all 0.2s"
                        _hover={{ boxShadow: "lg" }}
                      >
                        {/* Status Badge */}
                        {message.bookingStatus === 'pending' ? (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorPalette="blue"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            Pending
                          </Badge>
                        ) : message.bookingStatus === 'accepted' ? (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorPalette="green"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            Accepted
                          </Badge>
                        ) : message.bookingStatus === 'rejected' ? (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorPalette="red"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            Rejected
                          </Badge>
                        ) : (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorPalette="purple"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {message.bookingStatus || 'Unknown'}
                          </Badge>
                        )}
                        
                        {/* Title */}
                        <Box mb={3}>
                          <Heading size="md" color="blue.700">Booking Request</Heading>
                        </Box>
                        
                        {/* Content - Formatted */}
                        <Box 
                          p={4} 
                          bg="white" 
                          borderRadius="md" 
                          borderLeft="4px solid"
                          borderLeftColor={
                            message.bookingStatus === 'pending' ? 'blue.400' : 
                            message.bookingStatus === 'accepted' ? 'green.400' : 
                            message.bookingStatus === 'rejected' ? 'red.400' : 'gray.400'
                          }
                          mb={3}
                        >
                          {(() => {
                            // Parse the booking content into structured format
                            const content = message.content;
                            
                            // Try to extract key details using regex or simple parsing
                            const sections = [];
                            
                            // Common patterns to look for
                            const patterns = [
                              { label: "Customer", regex: /Customer:?\s*([^,\n]+)/ },
                              { label: "Provider", regex: /Provider:?\s*([^,\n]+)/ },
                              { label: "Service", regex: /Service Type:?\s*([^,\n]+)/ },
                              { label: "Date", regex: /Booking Date:?\s*([^,\n]+)/ },
                              { label: "Address", regex: /Customer Address:?\s*([^\n]+)/ },
                              { label: "Rate", regex: /Rate:?\s*([^,\n]+)/ }
                            ];
                            
                            // Extract information based on patterns
                            patterns.forEach(pattern => {
                              const match = content.match(pattern.regex);
                              if (match && match[1]) {
                                sections.push({ 
                                  label: pattern.label, 
                                  value: match[1].trim() 
                                });
                              }
                            });
                            
                            // If no sections were extracted, just display the original content
                            if (sections.length === 0) {
                              return <Text color="gray.700">{content}</Text>;
                            }
                            
                            // Otherwise, display structured content
                            return (
                              <Box>
                                {sections.map((section, index) => (
                                  <Box 
                                    key={index} 
                                    display="flex" 
                                    mb={index === sections.length - 1 ? 0 : 2}
                                    alignItems="baseline"
                                  >
                                    <Text 
                                      fontWeight="bold" 
                                      color="gray.600" 
                                      minWidth="80px"
                                      display="inline-flex"
                                      flexShrink={0}
                                    >
                                      {section.label}:
                                    </Text>
                                    <Text color="gray.700">{section.value}</Text>
                                  </Box>
                                ))}
                              </Box>
                            );
                          })()}
                        </Box>
                        
                        {/* Message */}
                        <Box 
                          bg="gray.50" 
                          p={2} 
                          borderRadius="md"
                          fontSize="sm"
                          color="gray.600"
                        >
                          {message.isCurrentUserSender ? message.senderDisplayText : message.receiverDisplayText}
                        </Box>
                        

                      </Box>
                    ) : (
                      <Span fontWeight="medium">{message.content}</Span>
                    )}


                  
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