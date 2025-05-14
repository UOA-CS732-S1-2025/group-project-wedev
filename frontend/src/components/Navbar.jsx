import { Box, Button, Container, Flex, HStack, Text, Image} from "@chakra-ui/react";
import { useNavigate , Link as RouterLink } from "react-router-dom";
import React from "react";
import UserNavActions from "./UserNavActions";

import useAuthStore from "../store/authStore";
const Navbar = () => {
  const { user, login, logout } = useAuthStore();

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
          <Image
            src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/UEase.png"
            alt="UrbanEase Logo"
            w="120px"
            h="auto"
            objectFit="contain"
            cursor="pointer"
            onClick={() => navigate("/")}
          />
        </HStack>

        {/* Right side */}
        <HStack spacing={4}>
          {!user ? (
            <>
              <Button
                as={RouterLink}
                to="/login"
                position="relative"
                overflow="hidden"
                bg="black"
                color="white"
                transition="color 0.2s ease"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '0%',
                  height: '0%',
                  bg: 'blue.500',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'top right',
                  transition: 'width 0.4s ease, height 0.4s ease',
                  zIndex: 0,
                }}
                _hover={{
                  color: 'white',
                  _before: {
                    width: '200%',
                    height: '500%',
                  }
                }}
                _active={{
                  transform: 'scale(0.97)',
                }}
              >
                <Box position="relative" zIndex={1}>Log in</Box>
              </Button>

              <Button
                as={RouterLink}
                to="/signup"
                position="relative"
                overflow="hidden"
                bg="black"
                color="white"
                transition="color 0.2s ease"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '0%',
                  height: '0%',
                  bg: 'blue.500',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'top right',
                  transition: 'width 0.4s ease, height 0.4s ease',
                  zIndex: 0,
                }}
                _hover={{
                  color: 'white',
                  _before: {
                    width: '200%',
                    height: '500%',
                  }
                }}
                _active={{
                  transform: 'scale(0.97)',
                }}
              >
                <Box position="relative" zIndex={1}>Sign up</Box>
              </Button>
            </>
          ) : (
            <UserNavActions user={user} logout={logout} />
          )}
        </HStack>

      </Flex>
    </Container>
  );
};

export default Navbar;