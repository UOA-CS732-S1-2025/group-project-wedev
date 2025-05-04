import { Button, Text, Avatar, IconButton, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CiMail } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";

const UserNavActions = ({ user, logout, toggleAuth }) => {
  return (
    <HStack spacing={4} align="center">
      {/* Navigation buttons */}
      <Button as={RouterLink} to="/">Home</Button>
      {/* User Info */}
      <Text>{user.name}</Text>
      <Avatar.Root>
      <Avatar.Fallback name="Segun Adebayo" />
      <Avatar.Image src="https://bit.ly/sage-adebayo" />
    </Avatar.Root>

      {/* Mail Icon Button */}
      <IconButton 
        variant="outline" 
        as={RouterLink} 
        to="/inbox" 
      >

        <CiMail />
      </IconButton>
      {/* Log out and toggle button */}
      <IconButton onClick={toggleAuth} variant="outline">
        {user ? <LuLogOut /> : "Log in (mock)"}
      </IconButton>
    </HStack>
  );
};

export default UserNavActions;