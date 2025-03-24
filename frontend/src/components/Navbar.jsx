import { Box, Button, Container, Flex, HStack, Icon } from "@chakra-ui/react";
import React from "react";
import { useColorMode, useColorModeValue } from "./ui/color-mode";
import { FaLeaf, FaStar } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  // 动态切换背景颜色
  const buttonBg = useColorModeValue("white", "gray.700");
  const iconColor = useColorModeValue("gray.800", "gray.200");

  return (
    <Container maxW="1920px" px={4}>
      <Flex
        justify="space-between"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        <Box>
          <HStack spacing={4} color="green.500">
            <Icon as={FaLeaf} boxSize={8} />
            <Icon as={FaStar} boxSize={8} />
            <Icon as={FaCircle} boxSize={8} />
          </HStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default Navbar;
