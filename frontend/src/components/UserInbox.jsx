import React from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Image, 
  Flex, 
  Icon,
  Separator
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';

const UserInbox = () => {
  // Mock data for messages
  const messages = [
    {
      id: 1,
      sender: {
        name: 'John Doe',
        profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      preview: 'Hi, I was wondering if you are available next week for cleaning services?',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: 2,
      sender: {
        name: 'Jane Smith',
        profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      preview: 'Thank you for your service last week. Everything was perfect!',
      timestamp: '1 day ago',
      isRead: true
    },
    {
      id: 3,
      sender: {
        name: 'Mike Johnson',
        profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      preview: 'Can we reschedule our appointment from Thursday to Friday this week?',
      timestamp: '3 days ago',
      isRead: false
    },
    {
      id: 4,
      sender: {
        name: 'Sarah Williams',
        profilePictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      preview: 'Hi there! I need some help with my project. Are you available for a consultation?',
      timestamp: '1 week ago',
      isRead: true
    },
    {
      id: 5,
      sender: {
        name: 'Alex Brown',
        profilePictureUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      preview: 'Just wanted to check if you received my payment for last month\'s services.',
      timestamp: '2 weeks ago',
      isRead: true
    }
  ];

  return (
    <Box bg="gray.50" minH="100vh" py={8} px={4}>
      <Box 
        w={{ base: "95%", md: "85%", lg: "90%" }} 
        minH={"1000px"}
        mx="auto" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        overflow="hidden"
      >

        
        <Box maxH="calc(100vh - 200px)" overflowY="auto" p={2}>
          <VStack spacing={0} align="stretch">
            {messages.map((message, index) => (
              <Box key={message.id}>
                <Box 
                  p={4} 
                  bg={message.isRead ? "white" : "blue.50"}
                  _hover={{ bg: message.isRead ? "gray.50" : "blue.100" }}
                  transition="background 0.2s"
                  cursor="pointer"
                >
                  <HStack spacing={4} align="center">
                    <Image
                      src={message.sender.profilePictureUrl}
                      boxSize="50px"
                      borderRadius="full"
                      objectFit="cover"
                      alt={message.sender.name}
                    />
                    
                    <Flex flex="1" direction="column">
                      <HStack justify="space-between" mb={1}>
                        <HStack>
                          <Text fontWeight="bold">{message.sender.name}</Text>
                          {!message.isRead && (
                            <Icon as={FaCircle} color="blue.500" boxSize={2} />
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{message.timestamp}</Text>
                      </HStack>
                      
                      <Text 
                        fontSize="sm" 
                        color={message.isRead ? "gray.600" : "black"}
                        noOfLines={2}
                      >
                        {message.preview}
                      </Text>
                    </Flex>
                  </HStack>
                </Box>
                {index < messages.length - 1 && (
                  <Separator />
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInbox;