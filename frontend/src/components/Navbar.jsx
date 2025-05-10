import { Box, Button, Container, Flex, HStack, Icon, IconButton, Text, Avatar } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import { FaLeaf, FaStar, FaCircle } from "react-icons/fa";
import UserNavActions from "./UserNavActions";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/authStore";
const Navbar = () => {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleAuth = () => {
    if (user) {
      logout();
      navigate("/"); // ← 登出后跳转到首页
    } else {
      login();
    }
  };

  return (
    <Container maxW="1920px" px={4} bg="gray.100" py={4}>
      <Flex
        justify="space-between"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        {/* Left icons */}
        <HStack spacing={4} color="green.500">
          <Text fontSize="2xl" fontWeight="bold">
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
          ) : (
            <>
            {/*如果是customer以登陆，就显示Admin Dashboard导航按钮*/ }
              {user.role === 'customer' && (
                <Button as={RouterLink} to="/admin" variant="outline" color="black" background="white"  _hover={ {bg: "gray.200"} }>
                  Admin Dashboard
                </Button>
              )}
              <UserNavActions user={user} logout={logout} toggleAuth={toggleAuth} navigate={navigate}/>
              </>
          )}
        </HStack>

      
      </Flex>

      
    </Container>
  );
};

export default Navbar;