import { Box, Button, Container, Flex, HStack, Icon, IconButton, Text, Avatar } from "@chakra-ui/react";
import { useNavigate , Link as RouterLink } from "react-router-dom";
import React from "react";
import { FaLeaf, FaStar, FaCircle } from "react-icons/fa";
import UserNavActions from "./UserNavActions";

import useAuthStore from "../store/authStore";
const Navbar = () => {
  const { user, login, logout } = useAuthStore();

  const toggleAuth = () => {
    if (user) logout();
    else login();
  };

  const navigate = useNavigate();
  
  return (
    <Container maxW="1920px" px={4} bg="gray.100" py={4}>
      <Flex
        justify="space-between"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        {/* Left icons */}
        <HStack spacing={4} color="green.500">
          <Text fontSize="2xl" fontWeight="bold" cursor="pointer" onClick={() => navigate('/')}>
            UrbanEase
          </Text>
          {/* Simulate login/logout */}
          <Button onClick={toggleAuth} variant="surface">
            {user ? "Log out" : "Log in (mock)"}
          </Button>
        </HStack>

        {/* Right side */}
        <HStack spacing={4}>
          {!user ? (
            <>
              <Button as={RouterLink} to="/login">Log in</Button>
              <Button as={RouterLink} to="/signup">Sign up</Button>
            </>
          ) : <UserNavActions user={user} logout={logout} toggleAuth={toggleAuth} />}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;