import { Button, Text, Avatar, IconButton, HStack, Box, Badge } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CiMail } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";
import { useState, useEffect } from "react";

const UserNavActions = ({ user, logout, toggleAuth }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the full name from firstName and lastName if available
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";
  
  useEffect(() => {
    if (user?._id) {
      // Fetch unread message count
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch(`/api/messages/unread-count?userId=${user._id}`);
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };

      fetchUnreadCount();
      
      // Set up polling to check for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
    
  return (
    <HStack spacing={4} align="center">
      {/* Navigation buttons */}
      
      {/* User Info */}
      <Text>{displayName}</Text>
      
      {/* Make avatar clickable and link to profile page */}
      <Box as={RouterLink} to="/profile?tab=profile" cursor="pointer">
        <Avatar.Root>
          <Avatar.Fallback name={displayName} />
          <Avatar.Image src={user?.profilePictureUrl || "https://bit.ly/sage-adebayo"} />
        </Avatar.Root>
      </Box>

      {/* Mail Icon Button */}
      <Box position="relative">
        <IconButton 
          variant="outline" 
          as={RouterLink} 
          to="/profile?tab=messages" 
        >
          <CiMail />
        </IconButton>
        {unreadCount > 0 && (
          <Badge 
            colorScheme="red" 
            borderRadius="full" 
            position="absolute" 
            top="-2px" 
            right="-2px"
            fontSize="xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Box>
      
      {/* Log out button */}
      <IconButton onClick={logout} variant="outline">
        <LuLogOut />
      </IconButton>
    </HStack>
  );
};

export default UserNavActions;